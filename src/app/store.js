import { configureStore } from '@reduxjs/toolkit'
import ProductReducer from '../redux/ProductSlice'

export const store = configureStore({
  reducer: {
    products: ProductReducer
  },
})