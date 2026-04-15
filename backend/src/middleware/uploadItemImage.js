import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../../uploads/items');
fs.mkdirSync(uploadDir, { recursive: true });

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    let safeExt = '.jpg';
    if (ext === '.png') safeExt = '.png';
    if (ext === '.webp') safeExt = '.webp';
    if (ext === '.jpeg' || ext === '.jpg') safeExt = '.jpg';

    cb(null, `item-${req.params.id}-${Date.now()}${safeExt}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error('Nur JPG, PNG oder WEBP erlaubt'));
  }
  cb(null, true);
};

const uploadItemImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

export default uploadItemImage;