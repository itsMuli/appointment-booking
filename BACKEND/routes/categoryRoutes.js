import express from 'express' ;

import {
    getCategory,
    updateCategory,
    createCategory,
    deleteCategory,
    addServiceToCategory,
    getServicesByCategory
} from '../controllers/categoryController.js';

const router = express.Router();

router.get('/',getCategory)
router.put('/:id',updateCategory)
router.post('/create-category',createCategory)
router.delete('/:id',deleteCategory)
router.post('/:id/services', addServiceToCategory);
router.get('/category/:category', getServicesByCategory);

export default router;