import { createAsyncThunk} from '@reduxjs/toolkit'
import axios from 'axios';




// Fetch all products
export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get('/products');
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

// productThunks.js
export const createProduct = createAsyncThunk(
    'products/createProduct',
    async (formData, { rejectWithValue }) => {
      try {
        const response = await axios.post('/create-product', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } catch (err) {
        return rejectWithValue(err.response?.data || 'Failed to create product');
      }
    }
  );
  

// Update a product (assuming you have an API route for this)
export const updateProduct = createAsyncThunk(
    'products/updateProduct',
    async ({ id, updatedData }, { rejectWithValue }) => {
      try {
        const formData = new FormData();
  
        // Append all form data
        for (const key in updatedData) {
          formData.append(key, updatedData[key]);
        }
  
        // Make PUT request to update the product with image (if any)
        const res = await axios.put(`/products/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
  
        return res.data;
      } catch (err) {
        return rejectWithValue(err.response?.data || 'Failed to update product');
      }
    }
  );
  

// Delete a product
export const deleteProduct = createAsyncThunk(
    'products/deleteProduct',
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(`/product/${id}`);
            return id;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);
