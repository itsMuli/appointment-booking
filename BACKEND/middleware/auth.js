import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";

export const requireSignIn = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }
        
        const decoded = JWT.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

export const isAdmin = async (req,res,next) => {
    try {
        const user = await userModel.findById(req.user._id)
        if(user.role !==1) {
            return res.status(401).send({
                success:false,
                message: "Unauthorized Access",
            });
        } else {
            next();
        }
    } catch (error) {
        console.log(error);
        res.status(401).send({
            sucess:false,
            error,
            message: "Error in admin middleware"
        })
    }
}

export const protect = async (req, res, next) => {
    try {
      let token;
  
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      }
  
      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Not authorized to access this route'
        });
      }
  
      try {
        const decoded = JWT.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
      } catch (err) {
        console.error('Auth middleware error:', err);
        return res.status(401).json({
          success: false,
          error: 'Invalid or expired token'
        });
      }
    } catch (err) {
      console.error('Server error in auth middleware:', err);
      return res.status(500).json({
        success: false,
        error: 'Server error in auth middleware'
      });
    }
  };

  export const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Extract token from header
    if (!token) {
      return res.status(401).json({ message: 'Authentication failed!' });
    }
  
    // Token verification logic (e.g., using JWT)
    JWT.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token!' });
      }
      req.user = user; // Attach decoded data (e.g., user ID) to the request object
      next();
    });
  };
  