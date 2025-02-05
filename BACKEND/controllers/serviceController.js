import Service from '../models/serviceModel.js'; // Assuming this is the location of the Service model
import Category from '../models/categoryModel.js'; // Assuming this is the location of the Category model

export const createService = async (req, res) => {
  const { categoryName, name, duration, price } = req.body;

  try {
    // Find the category by name (or you can use the categoryId if you have it directly)
    const category = await Category.findOne({ name: categoryName });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Create the new service with the category's ObjectId
    const newService = new Service({
      category: category._id,  // Use the ObjectId of the category
      name,
      duration,
      price,
    });

    // Save the new service
    await newService.save();

    res.status(201).json(newService); // Send back the newly created service
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ message: error.message });
  }
};


// Get all services
export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get services by category
export const getServicesByCategory = async (req, res) => {
  const { category } = req.params;

  try {
    let services;

    if (category === "all") {
      // Fetch all services if the category is "all"
      services = await Service.find();
    } else {
      // Fetch services by the specified category
      services = await Service.find({ category });
    }

    if (!services.length) {
      return res.status(404).json({ message: "No services found for the specified category" });
    }

    res.status(200).json(services);
  } catch (error) {
    console.error("Error fetching services by category:", error);
    res.status(500).json({ message: "Error fetching services", error: error.message });
  }
};

// Update a service
export const updateService = async (req, res) => {
  const { id } = req.params;
  const { category, name, duration, price } = req.body;

  try {
    const updatedService = await Service.findByIdAndUpdate(
      id,
      { category, name, duration, price },
      { new: true }
    );
    res.status(200).json(updatedService);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a service
export const deleteService = async (req, res) => {
  const { id } = req.params;

  try {
    await Service.findByIdAndDelete(id);
    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
