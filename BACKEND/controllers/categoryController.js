import Category from '../models/categoryModel.js';
import Service from '../models/serviceModel.js'
import mongoose from 'mongoose';

export const getCategory = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).select('_id name');
    const allCategory = {
      id: 'all', 
      name: 'ALL',
    };
    
    const formattedCategories = [
      allCategory, 
      ...(categories.length > 0 ? categories.map(category => ({
        id: category._id.toString(), 
        name: category.name,
      })) : []),
    ];

    res.status(200).json(formattedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error while fetching categories.', error: error.message });
  }
};

export const createCategory = async (req, res) => {
    const { name, isActive = true } = req.body;
  
    try {
      if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ message: 'Category name is required and must be a valid string.' });
      }

      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({ message: 'Category with this name already exists.' });
      }
  
      const newCategory = new Category({
        name: name.trim(),
        isActive,
      });

      await newCategory.save();

      res.status(201).json(newCategory);
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ message: 'Server error while creating category.', error: error.message });
    }
};
  // UPDATE a category
  // export const updateCategory = async (req, res) => {
  //   try {
  //     const { id } = req.params;
  //     const { name, description, icon, service, isActive } = req.body;
  
  //     // Validate ID
  //     if (!mongoose.Types.ObjectId.isValid(id)) {
  //       return res.status(400).json({ message: 'Invalid category ID' });
  //     }
  
  //     // If a service is provided, add it to the category's services array
  //     const updateData = { 
  //       name, 
  //       description,
  //       icon, 
  //       isActive
  //     };
  
  //     if (service) {
  //       // Option 1: Push new service to existing services
  //       const updatedCategory = await Category.findByIdAndUpdate(
  //         id, 
  //         { $push: { services: service } }, 
  //         { new: true, runValidators: true }
  //       );
  
  //       // Option 2: If you want to replace all services
  //       updateData.services = [service];
  //     }
  
  //     // Update other category details
  //     const updatedCategory = await Category.findByIdAndUpdate(
  //       id, 
  //       updateData, 
  //       { new: true, runValidators: true }
  //     );
  
  //     if (!updatedCategory) {
  //       return res.status(404).json({ message: 'Category not found' });
  //     }
  
  //     res.json(updatedCategory);
  //   } catch (error) {
  //     console.error('Error updating category:', error);
  //     res.status(500).json({ 
  //       message: 'Error updating category', 
  //       error: error.message 
  //     });
  //   }
  // };
  
  // DELETE a category
  export const deleteCategory = async (req, res) => {
    try {
      const { id } = req.params;
  
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid category ID.' });
      }

      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({ message: 'Category not found.' });
      }

      if (category.services && category.services.length > 0) {
        return res.status(400).json({ message: 'Cannot delete a category with associated services.' });
      }

      const deletedCategory = await Category.findByIdAndDelete(id);
  
      res.json({ 
        message: 'Category deleted successfully.', 
        deletedCategory 
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ 
        message: 'Error deleting category.', 
        error: error.message 
      });
    }
  };

  export const addServiceToCategory = async (req, res) => {
    try {
      const { id } = req.params;
      const { name, duration, price } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid category ID.' });
      }
 
      if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ message: 'Service name is required and must be a valid string.' });
      }
      if (!duration || isNaN(duration) || duration <= 0) {
        return res.status(400).json({ message: 'Service duration is required and must be a positive number.' });
      }
      if (!price || isNaN(price) || price <= 0) {
        return res.status(400).json({ message: 'Service price is required and must be a positive number.' });
      }

      const newService = {
        name: name.trim(),
        duration: Number(duration),
        price: Number(price),
        id: new mongoose.Types.ObjectId() 
      };
  
      const updatedCategory = await Category.findByIdAndUpdate(
        id, 
        { $push: { services: newService } }, 
        { new: true, runValidators: true }
      );
  
      if (!updatedCategory) {
        return res.status(404).json({ message: 'Category not found.' });
      }
  
      res.status(201).json(updatedCategory);
    } catch (error) {
      console.error('Error adding service to category:', error);
      res.status(500).json({ 
        message: 'Error adding service to category.', 
        error: error.message 
      });
    }
  };
  
  export const getServicesByCategory = async (req, res) => {
    const { category } = req.params;

    if (!category || category === "undefined") {
      return res.status(400).json({ message: "Category is required." });
    }
  
    try {
      let services;
  
      if (category === "all") {
        services = await Service.find();
      } else {
        services = await Service.find({ category });
      }
  
      if (!services.length) {
        return res.status(404).json({ message: "No services found for the specified category." });
      }
  
      res.status(200).json(services);
    } catch (error) {
      console.error("Error fetching services by category:", error);
      res.status(500).json({ message: "Error fetching services.", error: error.message });
    }
  };
  