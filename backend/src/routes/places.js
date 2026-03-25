import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/nearby-print-centers", async (req, res) => {
  const { lat, lng } = req.query;

  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
      {
        params: {
          location: `${lat},${lng}`,
          radius: 3000,
          keyword: "internet cafe OR xerox OR print shop OR copy shop OR cyber cafe",
          key: process.env.GOOGLE_PLACES_API_KEY,
        },
      }
    );

    res.json(response.data.results);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch places" });
  }
});

export default router;