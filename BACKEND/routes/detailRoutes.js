import express from "express";
import {
  saveDetails,
  getAllDetails,
  getDetailById,
  deleteDetail,
} from "../controllers/detailController.js";

const router = express.Router();

// POST: Save details and send confirmation email
router.post("/", saveDetails);

// GET: Fetch all details
router.get("/", getAllDetails);

// GET: Fetch a detail by ID
router.get("/:id", getDetailById);

// DELETE: Delete a detail by ID
router.delete("/:id", deleteDetail);

export default router;
