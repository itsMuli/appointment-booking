import validator from "validator";
import bcrypt from "bcrypt"
import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { comparePassword, hashPassword } from "../helpers/authHelper.js";

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
      // Find the user by ID, but explicitly select the fields you want to return
      const user = await userModel.findById(req.user._id).select('name email phone'); // Add any other fields you want to include
  
      if (!user) {
        return res.status(404).send({
          success: false,
          message: "User not found"
        });
      }
  
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone, // Add any other fields you want to return
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        success: false,
        message: "Error fetching user details",
        error: error.message
      });
    }
  };

const adminLogin = async (req,res) => {
    try{
        const {email,password} = req.body
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email+password,process.env.JWT_SECRET)
            res.json({
                success:true,
                token
            })
        } else 
        res.json({
            success:false,
            message:"Invalid Credentials"
        })
    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message:error.message
        })
    }
}

export const updateProfileController = async (req, res) => {
    try {
      const { name, email, password, address, phone } = req.body;
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


export {registerUser,adminLogin}