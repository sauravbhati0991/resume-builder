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

    if (!clientId || !redirectUri) {
      return res.status(500).json({ message: "DigiLocker configuration missing" });
    }

    if (!req.userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const state = req.userId.toString();
    const user = await User.findById(state);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate PKCE
    const codeVerifier = crypto.randomBytes(32).toString("base64url");
    const codeChallenge = crypto.createHash("sha256").update(codeVerifier).digest("base64url");

    user.onboarding = user.onboarding || {};
    user.onboarding.digilockerCodeVerifier = codeVerifier;
    await user.save();

    // ✅ OAuth URL with files.issueddocs scope
    const authUrl =
      `https://api.digitallocker.gov.in/public/oauth2/1/authorize?` +
      `response_type=code` +
      `&client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&state=${state}` +
      `&scope=${encodeURIComponent("files.issueddocs")}` +
      `&code_challenge=${codeChallenge}` +
      `&code_challenge_method=S256`;

    console.log("DigiLocker Auth URL:", authUrl);
    return res.json({ success: true, url: authUrl });

  } catch (err) {
    console.error("Auth URL Error:", err.message);
    return res.status(500).json({ message: "Failed to generate DigiLocker URL" });
  }
};

// =======================================
// 🔹 STEP 2: Handle DigiLocker Callback
// Automatic APAAR verification via issued documents
// NO manual entry — DigiLocker is the only source of truth
// =======================================
exports.digilockerCallback = async (req, res) => {
  const FRONTEND_URL = process.env.FRONTEND_URL || process.env.CORS_ORIGIN || "http://localhost:5173";

  try {
    const { code, state, error } = req.query;
    console.log("DEBUG: DigiLocker Callback:", { code: code ? "EXISTS" : "MISSING", state, error });

    if (error) {
      return res.redirect(`${FRONTEND_URL}/verification/callback?error=${error}`);
    }
    if (!code) {
      return res.redirect(`${FRONTEND_URL}/verification/callback?error=no_code`);
    }

    const user = await User.findById(state);
    if (!user) {
      return res.redirect(`${FRONTEND_URL}/verification/callback?error=user_not_found`);
    }

    const codeVerifier = user.onboarding?.digilockerCodeVerifier;
    if (!codeVerifier) {
      return res.redirect(`${FRONTEND_URL}/verification/callback?error=missing_pkce`);
    }

    // =======================================
    // A: Exchange code → token
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
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const accessToken = tokenRes.data.access_token;
    if (!accessToken) {
      return res.redirect(`${FRONTEND_URL}/verification/callback?error=no_token`);
    }

    // =======================================
    // B: Fetch user profile (identity)
    // =======================================
    let name = "Verified User", dob = "", gender = "", digilockerid = "";

    try {
      const userRes = await axios.get(
        "https://api.digitallocker.gov.in/public/oauth2/1/user",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const p = userRes.data;
      name = p?.name || "Verified User";
      dob = p?.dob || "";
      gender = p?.gender || "";
      digilockerid = p?.digilockerid || "";
      console.log("DEBUG: Profile:", JSON.stringify(p, null, 2));
    } catch (e) {
      console.warn("WARN: Profile fetch failed:", e.response?.status);
    }

    // =======================================
    // C: Fetch issued documents → check for APAAR
    // This is the ONLY way to verify student status
    // =======================================
    let apaarFound = false;
    let apaarId = "";
    let apaarDocInfo = null;
    let issuedDocsError = false;

    try {
      const issuedDocsRes = await axios.get(
        "https://api.digitallocker.gov.in/public/oauth2/1/files/issued",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        }
      );

      const rawData = issuedDocsRes.data;
      const docsList = rawData?.items || rawData?.files || (Array.isArray(rawData) ? rawData : []);

      console.log(`DEBUG: Found ${docsList.length} issued documents`);

      // Log ALL documents for transparency
      for (const doc of docsList) {
        console.log(`  DOC: name="${doc.name}", doctype="${doc.doctype}", issuer="${doc.issuer}", uri="${doc.uri}"`);
      }

      // Search for APAAR / ABC document
      for (const doc of docsList) {
        const dt = (doc.doctype || "").toUpperCase();
        const nm = (doc.name || "").toUpperCase();
        const desc = (doc.description || "").toUpperCase();
        const iss = (doc.issuer || "").toUpperCase();
        const uri = (doc.uri || "").toUpperCase();

        if (
          dt.includes("APAAR") || dt.includes("ABC") ||
          nm.includes("APAAR") || nm.includes("ABC") || nm.includes("ACADEMIC BANK") ||
          desc.includes("APAAR") || desc.includes("ACADEMIC BANK") ||
          iss.includes("ACADEMIC BANK") || iss.includes("ABC") ||
          uri.includes("APAAR") || uri.includes("ABC")
        ) {
          apaarFound = true;
          apaarDocInfo = doc;
          apaarId = doc.uri || doc.doctype || "";
          console.log("✅ APAAR Document FOUND:", JSON.stringify(doc, null, 2));
          break;
        }
      }

      if (!apaarFound) {
        console.log("❌ No APAAR/ABC document in DigiLocker issued documents.");
      }
    } catch (issuedErr) {
      issuedDocsError = true;
      console.error("ERROR: Issued Documents API failed:", issuedErr.response?.status, issuedErr.response?.data || issuedErr.message);
    }

    // =======================================
    // D: Save result — APAAR found = VERIFIED, not found = FAILED
    // =======================================
    user.onboarding = user.onboarding || {};
    user.onboarding.verifiedName = name;
    user.onboarding.verifiedDob = dob;
    user.onboarding.verifiedGender = gender;
    user.onboarding.verifiedDigilockerId = digilockerid;
    user.onboarding.verificationMethod = "APAAR";

    if (apaarFound) {
      // ✅ Student verified — APAAR exists in DigiLocker
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);

      user.onboarding.apaarId = apaarId;
      user.onboarding.verificationStatus = "VERIFIED";
      user.onboarding.apaarVerificationMethod = "DIGILOCKER_AUTO";
      user.onboarding.verifiedAt = new Date();
      user.onboarding.subscriptionExpiry = expiryDate;
      user.onboarding.isStudent = true;
      user.onboarding.accountType = "student";

      await user.save();
      console.log("✅ APAAR VERIFIED — student discount activated");
      return res.redirect(`${FRONTEND_URL}/stu/pricing`);

    } else {
      // ❌ Not a student — no APAAR in DigiLocker
      user.onboarding.verificationStatus = "FAILED";
      user.onboarding.apaarVerificationMethod = "";
      user.onboarding.isStudent = false;

      await user.save();

      const reason = issuedDocsError ? "api_error" : "no_apaar";
      console.log(`❌ VERIFICATION FAILED — reason: ${reason}`);
      return res.redirect(`${FRONTEND_URL}/verification/callback?status=failed&reason=${reason}`);
    }

  } catch (err) {
    console.error("DigiLocker Callback Error:", err.response?.data || err.message);
    const fallbackUrl = process.env.FRONTEND_URL || process.env.CORS_ORIGIN || "http://localhost:5173";
    return res.redirect(`${fallbackUrl}/verification/callback?error=server_error`);
  }
};