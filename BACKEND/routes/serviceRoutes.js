import express from 'express';
import {
  getAllServices,
  getServicesByCategory,
  createService,
  updateService,
  deleteService,
} from '../controllers/serviceController.js';

const router = express.Router();

router.get('/', getAllServices);
router.get('/category/:category', getServicesByCategory);
router.post('/create-services', createService);
router.put('/:id', updateService);
router.delete('/:id', deleteService);

export default router;
