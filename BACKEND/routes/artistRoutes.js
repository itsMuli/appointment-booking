import express from 'express';
import { getArtistById,getAllArtists,updateArtist,deleteArtist,createArtist } from '../controllers/artistController.js';

const artistRouter = express.Router();

artistRouter.get('/', getAllArtists)
artistRouter.get('/:id', getArtistById)
artistRouter.post('/create-artist', createArtist)
artistRouter.put('/:id', updateArtist)
artistRouter.delete('/:id', deleteArtist)

export default artistRouter