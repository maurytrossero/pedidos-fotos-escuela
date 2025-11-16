import { v2 as cloudinary } from 'cloudinary';

// Configuración DIRECTA (sin env)
cloudinary.config({
  cloud_name: "df4ims1w9",
  api_key: "725172991676881",
  api_secret: "IZH1C35XrxZF9PGxpgG31Lv6Ekc",
});

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({ error: "publicId requerido" });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    return res.status(200).json({ success: true, result });
  } catch (error: any) {
    console.error("🔥 ERROR EN API CLOUDINARY:", error);
    return res.status(500).json({ error: error.message });
  }
}
