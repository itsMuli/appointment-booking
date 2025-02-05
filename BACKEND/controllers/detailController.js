import detailModel from "../models/detailModel.js";
import nodemailer from "nodemailer";

// Save details and send confirmation email
export const saveDetails = async (req, res) => {
    const { firstname, lastname, email, phone } = req.body;
  
    try {
      // Save details to the database
      const detail = new detailModel({ firstname, lastname, email, phone });
      await detail.save();
  
      res.status(201).json({
        message: "Details saved successfully!",
        data: detail,
      });
    } catch (error) {
      console.error("Error saving details:", error);
  
      if (error.code === 11000) {
        // Handle unique email constraint error
        return res.status(400).json({ error: "Email already exists." });
      }
  
      res.status(500).json({ error: "Failed to save details." });
    }
  };
// Fetch all details (optional)
export const getAllDetails = async (req, res) => {
  try {
    const details = await detailModel.find();
    res.status(200).json(details);
  } catch (error) {
    console.error("Error fetching details:", error);
    res.status(500).json({ error: "Failed to fetch details." });
  }
};

// Fetch a single detail by ID (optional)
export const getDetailById = async (req, res) => {
  try {
    const { id } = req.params;
    const detail = await detailModel.findById(id);

    if (!detail) {
      return res.status(404).json({ error: "Detail not found." });
    }

    res.status(200).json(detail);
  } catch (error) {
    console.error("Error fetching detail:", error);
    res.status(500).json({ error: "Failed to fetch detail." });
  }
};

// Delete a detail (optional)
export const deleteDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const detail = await detailModel.findByIdAndDelete(id);

    if (!detail) {
      return res.status(404).json({ error: "Detail not found." });
    }

    res.status(200).json({ message: "Detail deleted successfully." });
  } catch (error) {
    console.error("Error deleting detail:", error);
    res.status(500).json({ error: "Failed to delete detail." });
  }
};
