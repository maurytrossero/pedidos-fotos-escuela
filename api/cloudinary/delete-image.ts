import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { publicId } = body;

    // 🔍 LOG 1: Ver si llega el publicId
    console.log("PUBLICID RECIBIDO:", publicId);

    // 🔍 LOG 2: Ver si las variables están cargadas
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
  } catch (error: any) {
    console.error("🔥 ERROR EN API CLOUDINARY:", error);
    return res.status(500).json({ error: error.message });
  }
}
