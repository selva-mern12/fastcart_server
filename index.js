const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary");
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
const api_key = process.env.CLOUDINARY_API_KEY;
const api_secret = process.env.CLOUDINARY_API_SECRET;

cloudinary.v2.config({
    cloud_name,
    api_key,
    api_secret,
    secure: true
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary.v2,
    params: {
      folder: "fastcart",
      transformation: [{ 
        width: 500, 
        height: 500, 
        crop: "limit" 
      }]
    },
});

const upload = multer({
     storage: storage, 
     limits: { fileSize: 5 * 1024 * 1024 }
});

// Db Connection 

mongoose.connect(MONGO_URI)
    .then(() => {console.log('MongoDB connected')})
    .catch(err => {console.log(err)});

// Creating Schema

const userSchema = new mongoose.Schema({
    name: {type: String, required: true, trim: true},
    username: {type: String, required: true,lowercase: true, unique: true, trim: true},
    password: {type: String, required: true, minLength: 6},
},{
    timestamps: true
});

const categorySchema = new mongoose.Schema({
    image_url: {type: String, required: true},
    category_name: {type: String, required: true, trim: true},
    item_count: {type: Number, default: 0},
    user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
},{
    timestamps: true
});

// Creating Model 

const UserModel = mongoose.model('User', userSchema);
const CategoryModel = mongoose.model('Category', categorySchema);

//middleware for authentication

const Authentication = (req, res, next) => {
    try {
      const authHead = req.headers['authorization'];
      if (!authHead) return res.status(401).json({ message: 'Authorization header missing' });
      
      const token = authHead.split(' ')[1];
      if (!token) return res.status(401).json({ message: 'Token missing' });
      
      jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired token' });
        req.user_id = decoded.id;
        next();
      });
    } catch (error) {
      return res.status(500).json({ message: 'Authentication failed', error });
    }
  };

// User Registration

app.post('/api/auth/signup', async (req, res) => {
    const { name, username, password } = req.body;
    const checkUser = await UserModel.findOne({ username });
    try {
        if (!checkUser){
            const hashedPassword = await bcrypt.hash(password, 5);
            const newUser = new UserModel({name, username, password: hashedPassword});
            await newUser.save();
            res.status(201).json({ message: 'User created successfully' });
        } else {
            res.status(400).json({ message: 'User already exists' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
});

// User Login

app.post('/api/auth/login', async (req, res) => {
    const {username, password} = req.body;
    try {
        const checkUser = await UserModel.findOne({ username });
        if (!checkUser) {
            return res.status(400).json({ message: 'User not found' });
        }
        const isPasswordValid = await bcrypt.compare(password, checkUser.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid password' });
        }
        const token = jwt.sign({ id: checkUser._id }, JWT_SECRET);
        res.status(200).json({ message: 'Login successful', user_id: checkUser._id, name: checkUser.name, token });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
});

// Retrive Categories

app.get('/api/categories', Authentication, async (req, res) => {
    try {
        const categories = await CategoryModel.find();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error }); 
    }
});
  
// Add Category (with Authentication)
app.post('/api/categories', upload.single("image"), async (req, res) => {
    try {
      // const { category_name, item_count } = req.body;
      // const user_id = req.user_id; 
        const category_name = "resume";
        const item_count = 1
  
      // Validate required fields
      // if (!category_name || !item_count) {
      //   return res.status(400).json({ message: 'Category name and item count are required' });
      // }
  
      // Check for either file upload or image URL
      if (!req.file && !req.body.image_url) {
        return res.status(400).json({ message: 'Either an image file or image URL is required' });
      }
  
      let image_url;
  
      // Handle file upload
      if (req.file) {
        image_url = req.file.path;
        
        // Verify Cloudinary upload (optional)
        try {
          const result = await cloudinary.v2.uploader.explicit(req.file.filename, {
            type: 'upload'
          });
          console.log('Cloudinary upload verified');
        } catch (cloudinaryError) {
            console.error('Cloudinary verification failed');
        }
      } 
      // Handle image URL
      else {
        image_url = req.body.image_url;
        
        // Basic URL validation
        if (!image_url.startsWith('http')) {
          return res.status(400).json({ message: 'Invalid image URL format' });
        }
      }
  
      // Create new category
      const newCategory = new CategoryModel({
        image_url,
        category_name,
        item_count: Number(item_count),
        user_id
      });
  
      await newCategory.save();
      
      res.status(201).json({ 
        success: true,
        message: 'Category created successfully',
          image_url
        category: newCategory
      });
      
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ 
        success: false,
        message: 'Internal server error', 
        error: error.message 
      });
    }
});

  // Update Category
app.put('/api/categories/:id', Authentication, upload.single("image"), async (req, res) => {
try {
    const { id } = req.params;
    const { category_name, item_count, image_url: imageUrlFromBody } = req.body;

    const updateFields = {};

    // Handle image update
    if (req.file) {
        updateFields.image_url = req.file.path;
    
    // Verify Cloudinary upload
        const exists = await cloudinary.v2.uploader.explicit(req.file.filename, {
            type: 'upload'
        });
        if (!exists) {
            return res.status(500).json({ message: 'Failed to verify Cloudinary upload' });
        }
    } else if (imageUrlFromBody) {
        updateFields.image_url = imageUrlFromBody;
    }

    // Update other fields
    if (category_name) updateFields.category_name = category_name;
    if (item_count) updateFields.item_count = Number(item_count);

    const updatedCategory = await CategoryModel.findByIdAndUpdate(
        id,
        updateFields,
        { new: true }
    );

    if (!updatedCategory) {
        return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({ 
        message: 'Category updated successfully', 
        category: updatedCategory 
    });
    
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ 
            message: 'Internal server error', 
            error: error.message 
        });
    }
});

app.delete('/api/categories/:id', Authentication, async (req, res) => {
    try {
        // Find the category first
      const category = await CategoryModel.findById(req.params.id);
      
      if (!category) {
        return res.status(404).json({
          message: 'Category not found' 
        });
      }
  
      // Extract Cloudinary public ID if it's a Cloudinary URL
      let publicId;
      if (category.image_url.includes('res.cloudinary.com')) {
        const urlParts = category.image_url.split('/');
        publicId = urlParts.slice(urlParts.indexOf('upload') + 1).join('/').split('.')[0];
      }
  
      // Delete from Cloudinary (if Cloudinary image)
      if (publicId) {
        try {
          await cloudinary.v2.uploader.destroy(publicId);
          console.log(`Deleted image from Cloudinary`);
        } catch (cloudinaryErr) {
          console.error('Cloudinary deletion error:', cloudinaryErr);
          // Continue with DB deletion even if Cloudinary fails
        }
      }
  
      //  Delete from MongoDB
      await CategoryModel.findByIdAndDelete(req.params.id);
  
      res.status(200).json({
        message: 'Category and image deleted successfully',
      });
  
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: error.message 
      });
    }
});
