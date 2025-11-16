import type { VercelRequest, VercelResponse } from '@vercel/node';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const publicId: string = body.publicId;

    console.log("PUBLICID RECIBIDO:", publicId);

    console.log("Cloudinary env vars:", {
      name: process.env.CLOUDINARY_CLOUD_NAME,
      key: process.env.CLOUDINARY_API_KEY ? "OK" : "MISSING",
      secret: process.env.CLOUDINARY_API_SECRET ? "OK" : "MISSING",
    });

    if (!publicId) {
      return res.status(400).json({ error: "publicId requerido" });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    return res.status(200).json({ success: true, result });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("🔥 ERROR EN API CLOUDINARY:", err);
    return res.status(500).json({ error: err.message });
  }
}
