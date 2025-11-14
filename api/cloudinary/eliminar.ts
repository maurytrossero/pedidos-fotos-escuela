import type { VercelRequest, VercelResponse } from '@vercel/node';
import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: "df4ims1w9",
  api_key: "725172991676881",
  api_secret: "IZH1C35XrxZF9PGxpgG31Lv6Ekc",
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({ error: "publicId requerido" });
    }

    const result = await cloudinary.v2.uploader.destroy(publicId);

    return res.status(200).json({ result });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
