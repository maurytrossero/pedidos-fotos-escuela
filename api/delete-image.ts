import type { VercelRequest, VercelResponse } from '@vercel/node';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { publicId } = req.body;

    console.log("PUBLICID:", publicId);
    console.log("ENV:", {
      name: process.env.CLOUDINARY_CLOUD_NAME,
      key: process.env.CLOUDINARY_API_KEY ? 'OK' : 'MISSING',
      secret: process.env.CLOUDINARY_API_SECRET ? 'OK' : 'MISSING',
    });

    if (!publicId) {
      return res.status(400).json({ error: "publicId requerido" });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    res.status(200).json({ success: true, result });

  } catch (error: any) {
    console.error("ERROR:", error);
    res.status(500).json({ error: error.message || 'Error desconocido' });
  }
}
