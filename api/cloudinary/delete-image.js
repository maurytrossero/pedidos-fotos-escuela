const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({ error: "publicId requerido" });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({ error: error.message || "Error desconocido" });
  }
};
