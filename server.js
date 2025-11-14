const express = require('express');
const path = require('path');
const { v2: cloudinary } = require('cloudinary');

// Configuración Cloudinary
cloudinary.config({
  cloud_name: "dgwdgpwzq",
  api_key: "823271294374781",
  api_secret: "fwD0s4pOKUFUKKQQolIdIPYEzsE",
});

const app = express();
const DIST_DIR = path.join(__dirname, 'dist');

// 👇 Necesario para leer JSON en requests
app.use(express.json());

// 1️⃣ Endpoint para eliminar imagen de Cloudinary
app.post('/api/cloudinary/eliminar', async (req, res) => {
  try {
    const { publicId } = req.body;
    if (!publicId) {
      return res.status(400).json({ error: 'Falta publicId' });
    }

    const result = await cloudinary.uploader.destroy(publicId);
    res.json({ ok: true, result });
  } catch (err) {
    console.error('Error eliminando en Cloudinary:', err);
    res.status(500).json({ error: 'Error eliminando en Cloudinary' });
  }
});

// 2️⃣ Servir archivos estáticos
app.use(express.static(DIST_DIR));

// 3️⃣ Redirigir todas las rutas SPA (history mode) a index.html
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.includes('.')) {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  } else {
    next();
  }
});

// 4️⃣ Levantar servidor
const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
);
