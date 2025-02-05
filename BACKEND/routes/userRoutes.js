import express from "express";
import { 
  registerUser, 
  adminLogin, 
  loginController, 
  updateProfileController, 
  getUserDetails
} from "../controllers/userController.js";
import { requireSignIn } from "../middleware/auth.js"; // Assuming this is where your middleware is

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginController);
userRouter.post('/admin', adminLogin);
userRouter.post('/profile', updateProfileController);
userRouter.get('/user', requireSignIn, getUserDetails) 
export default userRouter;