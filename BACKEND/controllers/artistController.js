import artistModel from "../models/artistModel.js";

const getAllArtists = async (req, res) => {
  try {
    const artists = await artistModel.find();
    const formattedArtists = artists.map(artist => ({
      ...artist.toObject(), 
      id: artist._id 
    }));
    res.status(200).json(formattedArtists);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


const getArtistById = async (req, res) => {
  try {
    const artist = await artistModel.findById(req.params.id);
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }
    res.status(200).json(artist);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const createArtist = async (req, res) => {
  const artist = new artistModel({
    name: req.body.name,
    email: req.body.email,
  });

  try {
    const newArtist = await artist.save();
    res.status(201).json(newArtist);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateArtist = async (req, res) => {
  try {
    const artist = await artistModel.findById(req.params.id);
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    artist.name = req.body.name;
    artist.email = req.body.email;
    const updatedArtist = await artist.save();
    res.status(200).json(updatedArtist);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteArtist = async (req, res) => {
  try {
    const artist = await artistModel.findById(req.params.id);
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }
    await artist.remove();
    res.status(200).json({ message: 'Artist deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export {getAllArtists, getArtistById, createArtist, updateArtist, deleteArtist}