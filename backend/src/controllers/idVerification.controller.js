const crypto = require("crypto");
const axios = require("axios");
const User = require("../models/User");

// =======================================
// 🔹 STEP 1: Generate DigiLocker Auth URL
// =======================================
exports.getDigilockerAuthUrl = async (req, res) => {
  try {
    const clientId = process.env.DIGILOCKER_CLIENT_ID;
    const redirectUri = process.env.DIGILOCKER_REDIRECT_URI;

    // ✅ Validate config
    if (!clientId || !redirectUri) {
      return res.status(500).json({
        message: "DigiLocker configuration missing",
      });
    }

    // ✅ Validate user
    if (!req.userId) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    const state = req.userId.toString();

    const user = await User.findById(state);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate PKCE code_verifier and code_challenge
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');

    // Save code_verifier to DB to strictly match state
    user.onboarding = user.onboarding || {};
    user.onboarding.digilockerCodeVerifier = codeVerifier;
    await user.save();

    // ✅ Build OAuth URL (WITH PKCE, NO SCOPE)
    const authUrl =
      `https://api.digitallocker.gov.in/public/oauth2/1/authorize?` +
      `response_type=code` +
      `&client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&state=${state}` +
      `&code_challenge=${codeChallenge}` +
      `&code_challenge_method=S256`;

    console.log("DigiLocker Auth URL:", authUrl);

    return res.json({
      success: true,
      url: authUrl,
    });

  } catch (err) {
    console.error("Auth URL Error:", err.message);
    return res.status(500).json({
      message: "Failed to generate DigiLocker URL",
    });
  }
};

// =======================================
// 🔹 STEP 2: Handle DigiLocker Callback
// =======================================
exports.digilockerCallback = async (req, res) => {
  const FRONTEND_URL =
    process.env.FRONTEND_URL ||
    process.env.CORS_ORIGIN ||
    "http://localhost:5173";

  try {
    const { code, state, error } = req.query;
    console.log("DEBUG: DigiLocker Callback Query:", { code: code ? "EXISTS" : "MISSING", state, error });

    // ❌ User cancelled or DigiLocker error
    if (error) {
      console.error("DigiLocker Error:", error);
      return res.redirect(
        `${FRONTEND_URL}/verification/callback?error=${error}`
      );
    }

    // ❌ No code
    if (!code) {
      return res.redirect(
        `${FRONTEND_URL}/verification/callback?error=no_code`
      );
    }

    // 🔹 Find user using state FIRST to get the code_verifier
    const user = await User.findById(state);
    if (!user) {
      return res.redirect(`${FRONTEND_URL}/verification/callback?error=user_not_found`);
    }

    const codeVerifier = user.onboarding?.digilockerCodeVerifier;
    if (!codeVerifier) {
      return res.redirect(`${FRONTEND_URL}/verification/callback?error=missing_pkce_verifier`);
    }

    // =======================================
    // 🔹 STEP 1: Exchange code → token
    // =======================================
    const tokenRes = await axios.post(
      "https://api.digitallocker.gov.in/public/oauth2/1/token",
      new URLSearchParams({
        code,
        grant_type: "authorization_code",
        client_id: process.env.DIGILOCKER_CLIENT_ID,
        client_secret: process.env.DIGILOCKER_CLIENT_SECRET,
        redirect_uri: process.env.DIGILOCKER_REDIRECT_URI,
        code_verifier: codeVerifier,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log("DEBUG: DigiLocker Token Response Status:", tokenRes.status);
    console.log("DEBUG: Token Data Keys:", Object.keys(tokenRes.data));

    const accessToken = tokenRes.data.access_token;

    if (!accessToken) {
      return res.redirect(
        `${FRONTEND_URL}/verification/callback?error=no_token`
      );
    }

    // =======================================
    // 🔹 STEP 2: Fetch user (APAAR)
    // =======================================
    const userRes = await axios.get(
      "https://api.digitallocker.gov.in/public/oauth2/1/user",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = userRes.data;
    console.log("DEBUG: DigiLocker User Data Response:", JSON.stringify(data, null, 2));

    // ⚠️ Capture ID from various potential fields
    const apaarId = data?.apaar_id || data?.abc_id || data?.digilockerid || data?.sub || "";
    const name = data?.name || "Verified Student";
    const dob = data?.dob || "";
    const gender = data?.gender || "";
    const digilockerid = data?.digilockerid || "";

    // =======================================
    // 🔹 STEP 3: Save in DB
    // =======================================
    // User already fetched above

    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    user.onboarding.apaarId = apaarId;
    user.onboarding.verificationMethod = "APAAR";
    user.onboarding.verificationStatus = "VERIFIED";
    user.onboarding.verifiedAt = new Date();
    user.onboarding.verifiedName = name;
    user.onboarding.verifiedDob = dob;
    user.onboarding.verifiedGender = gender;
    user.onboarding.verifiedDigilockerId = digilockerid;
    user.onboarding.subscriptionExpiry = expiryDate;
    user.onboarding.isStudent = true;
    user.onboarding.accountType = "student";

    await user.save();

    // =======================================
    // ✅ SUCCESS
    // =======================================
    return res.redirect(
      `${FRONTEND_URL}/stu/pricing`
    );

  } catch (err) {
    console.error("DigiLocker Callback Error:", err.response?.data || err.message);

    return res.redirect(
      `${process.env.FRONTEND_URL}/verification/callback?error=server_error`
    );
  }
};