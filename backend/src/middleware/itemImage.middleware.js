import { getImageVariant, localImagePath } from '../utils/imageStorage.js';

export async function serveItemImage(req, res, next) {
  const source = localImagePath(`/uploads/items/${req.params.filename}`);
  if (!source) return res.sendStatus(404);
  try {
    const image = await getImageVariant(source, req.query.size === 'thumbnail');
    res.type('webp');
    res.set('X-Content-Type-Options', 'nosniff');
    res.sendFile(image, { maxAge: '1d' }, error => { if (error) next(error); });
  } catch (error) {
    if (error.code === 'ENOENT') return res.sendStatus(404);
    next(error);
  }
}
