import validator from "validator";
import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import crypto from 'crypto';
import { sendMail } from '../helpers/mailer.js';

const createToken = (id) => {
    return JWT.sign({id},process.env.JWT_SECRET)
}

export const loginController = async (req,res) => {
    try{
        const {email,password} = req.body
            if(!email || !password){
                return res.status(404).send({
                    success:false,
                    message:'Invalid email or password'
            })
        }

        const user = await userModel.findOne({email})
        if(!user){
            return res.status(404).send({
                success:false,
                message:"Email is not registered"
            })
        }

        const match = await comparePassword(password,user.password)
        if(!match){
            return res.status(200).send({
                success:false,
                message:"Invalid Password"
            })
        }

        const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d"
        });
        res.status(200).send({
            success:true,
            message:"login successfully",
            user: {
                name:user.name,
                email:user.email,
                // phone:user.phone,
                // address:user.address,
                // role:user.role,
            },
            token,
        });
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            message:"Error in Login",
            error
        })
    }
};

const registerUser = async (req,res) => {
    try{
        const { name, email, password } = req.body;

        const exists = await userModel.findOne({email});
        if (exists) {
            return res.json({
                success:false,
                message:"User already exists"
            })
        }
        if (!validator.isEmail(email)) {
            return res.json({
                success:false,
                message:"Please enter a valid email"
            })
        }
        if (password.length < 8) {
            return res.json({
                success:false,
                message:"Please enter a strong password"
            })
        }
        const hashedPassword = await hashPassword(password)

        const newUser = await userModel({
            name,
            email,
            password:hashedPassword
        })

        const user = await newUser.save()

        const token = createToken(user._id)
        res.json({
            success:true,
            token
        })

    } catch (error) {
        console.log(error);
        res.json({
            success:false,
            message:error.message
        })
    }
}

export const getUserDetails = async (req, res) => {
    try {
      // Check if it's an admin user
      if (req.user._id === 'admin_id' || req.user.role === 'admin') {
        return res.status(200).json({
          success: true,
          user: {
            _id: 'admin_id',
            name: 'Admin User',
            email: 'admin@infinitynailsalon.com',
            role: 'admin'
          }
        });
      }
      
      // Find the regular user by ID
      const user = await userModel.findById(req.user._id).select('name email phone');
  
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
  
      res.status(200).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error fetching user details",
        error: error.message
      });
    }
  };

const adminLogin = async (req,res) => {
    try{
        const {email,password} = req.body
        
        // Use admin credentials from environment variables
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@infinitynailsalon.com';
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
        
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            // Create a proper JWT token with admin user info
            const adminUser = {
                _id: 'admin_id',
                name: 'Admin User',
                email: ADMIN_EMAIL,
                role: 'admin'
            };
            
            const token = JWT.sign({ _id: adminUser._id, role: 'admin' }, process.env.JWT_SECRET, {
                expiresIn: "7d"
            });
            
            res.status(200).json({
                success: true,
                message: "Admin login successful",
                token,
                user: adminUser
            });
        } else {
            res.status(401).json({
                success: false,
                message: "Invalid admin credentials"
            });
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Error in admin login",
            error: error.message
        })
    }
}

export const updateProfileController = async (req, res) => {
    try {
      const { name, password, address, phone } = req.body;
      const user = await userModel.findById(req.user._id);
      //password
      if (password && password.length < 6) {
        return res.json({ error: "Passsword is required and 6 character long" });
      }
      const hashedPassword = password ? await hashPassword(password) : undefined;
      const updatedUser = await userModel.findByIdAndUpdate(
        req.user._id,
        {
          name: name || user.name,
          password: hashedPassword || user.password,
          phone: phone || user.phone,
          address: address || user.address,
        },
        { new: true }
      );
      res.status(200).send({
        success: true,
        message: "Profile Updated Successfully",
        updatedUser,
      });
    } catch (error) {
      console.log(error);
      res.status(400).send({
        success: false,
        message: "Error While Update profile",
        error,
      });
    }
  };


  // Admin-only: list all users
  export const getAllUsers = async (req, res) => {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
      const users = await userModel.find().select('-password');
      res.json({ success: true, users });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Admin-only: get user by id
  export const getUserById = async (req, res) => {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
      const user = await userModel.findById(req.params.id).select('-password');
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      res.json({ success: true, user });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Admin-only: update user basic fields
  export const adminUpdateUser = async (req, res) => {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
      const { name, email, phone, address } = req.body;
      const updated = await userModel.findByIdAndUpdate(
        req.params.id,
        { name, email, phone, address },
        { new: true }
      ).select('-password');
      res.json({ success: true, user: updated });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Admin-only: delete user
  export const deleteUser = async (req, res) => {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
      await userModel.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: 'User deleted' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Forgot password: generate token and (in a real app) email it to the user
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const user = await userModel.findOne({ email });
    if (!user) {
      // Respond success to avoid leaking whether email exists
      return res.status(200).json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
    }

    // Generate a secure token
    const buffer = crypto.randomBytes(32);
    const token = buffer.toString('hex');
    const expires = Date.now() + 3600 * 1000; // 1 hour

    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(expires);
    await user.save();

    // Build the reset link and email it to the user. The frontend will accept the token as a query param.
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    const html = `
      <p>Hello ${user.name || ''},</p>
      <p>We received a request to reset the password for your account. Click the link below to reset your password. This link will expire in 1 hour.</p>
      <p><a href="${resetLink}">Reset my password</a></p>
      <p>If you did not request this, you can safely ignore this email.</p>
    `;

    try {
      await sendMail({ to: user.email, subject: 'Reset your password', html });
    } catch (mailErr) {
      console.error('Error sending reset email:', mailErr);
      // Continue to return success so as not to reveal account existence
    }

    return res.status(200).json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Reset password: accept token and new password
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ success: false, message: 'Token and new password are required' });

    const user = await userModel.findOne({ resetPasswordToken: token });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });

    if (!user.resetPasswordExpires || user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ success: false, message: 'Token has expired' });
    }

    // Update password
    const hashed = await hashPassword(password);
    user.password = hashed;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export {registerUser,adminLogin}
