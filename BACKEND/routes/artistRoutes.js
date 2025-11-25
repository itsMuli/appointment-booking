import express from 'express';
import { getArtistById,getAllArtists,updateArtist,deleteArtist,createArtist } from '../controllers/artistController.js';
import upload from '../middleware/multer.js';

const artistRouter = express.Router();

artistRouter.get('/', getAllArtists)
artistRouter.get('/:id', getArtistById)
artistRouter.post('/create-artist', upload.single('image'), createArtist)
artistRouter.put('/:id', updateArtist)
artistRouter.delete('/:id', deleteArtist)

export default artistRouter