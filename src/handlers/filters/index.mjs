import { Router } from 'express';
import multer from 'multer';
import applyFiltersHandler from './applyFiltersHandler.mjs';
import uploadImagesHandler from './uploadImagesHandler.mjs';

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();

router.get('/', (req, res) => {
  res.send('OK GET IMAGES');
});

router.post('/', applyFiltersHandler);
router.post('/upload', upload.array('images'), uploadImagesHandler);

export default router;
