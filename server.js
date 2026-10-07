require('dotenv').config();  // Load environment variables
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');

// Initialize express app
const app = express();

// Middleware setup
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse incoming JSON requests
app.use(bodyParser.json()); // Parse incoming requests with JSON payloads
app.use(express.static('assets')); // Serve static files from 'assets' directory

// Create MySQL connection using environment variables
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database');
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: './src/assets/images/', // Specify where to store the uploaded file
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname); // Create a unique filename
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // Limit file size to 1MB
}).single('image'); // 'image' is the name of the form field



// Get all products (READ)
app.get('/products', (req, res) => {
  const query = "SELECT * FROM products"; // Correct SQL syntax

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching products:", err);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }
    res.status(200).json(results);
  });
});



// Create a new product (CREATE)
app.post('/create-product', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error uploading file' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { name, shippingCost } = req.body;
    const imagePath = req.file.filename;

    if (!name || !shippingCost) {
      return res.status(400).json({ message: 'Name and shipping cost are required' });
    }

    const query = "INSERT INTO products (name, image, shippingCost) VALUES (?, ?, ?)";
    db.query(query, [name, imagePath, shippingCost], (err, results) => {
      if (err) {
        console.error("Error creating product:", err);
        return res.status(500).json({ error: 'Failed to create product' });
      }
      res.status(200).json({ message: "Product created successfully", productId: results.insertId });
    });
  });
});




// Delete a product (DELETE)
app.delete('/product/:id', (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM products WHERE id = ?";

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error deleting product:", err);
      return res.status(500).json({ error: 'Failed to delete product' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  });
});



app.put('/products/:id', (req, res) => {
  const productId = req.params.id;

  // First, upload the new image if there's one
  upload(req, res, (err) => {
    if (err) {
      return res.status(500).send({ message: 'Error uploading file' });
    }

    // Extract the form data
    const { name, unitPrice, shippingCost } = req.body;
    const imagePath = req.file ? req.file.filename : null; // Handle new image

    // Get the current product details to retrieve the old image path
    const getProductQuery = 'SELECT image FROM products WHERE id = ?';
    db.query(getProductQuery, [productId], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch product' });
      }

      const oldImage = result[0]?.image;

      // Update the product details
      const updateProductQuery = 'UPDATE products SET name = ?, unitPrice = ?, shippingCost = ?, image = ? WHERE id = ?';
      db.query(updateProductQuery, [name, unitPrice, shippingCost, imagePath || oldImage, productId], (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to update product' });
        }

        // If there's a new image, delete the old image from the server
        if (imagePath && oldImage) {
          const fs = require('fs');
          const oldImagePath = path.join(__dirname, 'src/assets/images/', oldImage);

          // Delete the old image file
          fs.unlink(oldImagePath, (err) => {
            if (err) {
              console.error('Failed to delete old image:', err);
            } else {
              console.log('Old image deleted:', oldImage);
            }
          });
        }

        res.status(200).json({ message: 'Product updated successfully' });
      });
    });
  });
});



// Update a product (UPDATE)
app.put('/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, shippingCost } = req.body;
  
  const query = "UPDATE products SET name = ?, shippingCost = ? WHERE id = ?";

  db.query(query, [name, shippingCost, id], (err, results) => {
    if (err) {
      console.error("Error updating product:", err);
      return res.status(500).json({ error: 'Failed to update product' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product updated successfully' });
  });
});

// Start the server using the port from environment variables
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
