import express from "express";
import { 
  registerUser, 
  adminLogin, 
  loginController, 
  updateProfileController, 
  getUserDetails,
  getAllUsers,
  getUserById,
  adminUpdateUser,
  deleteUser,
  forgotPassword,
  resetPassword
} from "../controllers/userController.js";
import { requireSignIn, protect } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginController);
userRouter.post('/admin', adminLogin);
userRouter.post('/profile', updateProfileController);
userRouter.get('/user', requireSignIn, getUserDetails) 

// Password reset endpoints
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/reset-password', resetPassword);

// Admin-only user management
userRouter.get('/all', protect, getAllUsers);
userRouter.get('/:id', protect, getUserById);
userRouter.put('/:id', protect, adminUpdateUser);
userRouter.delete('/:id', protect, deleteUser);
export default userRouter;