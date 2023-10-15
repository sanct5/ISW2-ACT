import { Router } from 'express';
import multer from 'multer';
import applyFiltersHandler from './applyFiltersHandler.mjs';

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();
router.get('/', (req, res) => {
  res.send('OK GET IMAGES');
});

router.post('/', upload.array('images[]'), applyFiltersHandler);

export default router;
