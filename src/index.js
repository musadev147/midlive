import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import './index.css';
import App from './App';
import { HeaderProvider } from './context/HeaderContext';
import { OrderProvider } from './context/OrderContext';
import { CartProvider } from 'react-use-cart';
import { config } from './config';

const root = ReactDOM.createRoot(document.getElementById('root'));

axios.defaults.baseURL = config.apiUrl;


root.render(
  <CartProvider>
    <HeaderProvider>
      <OrderProvider>
        <App />
      </OrderProvider>
    </HeaderProvider>
  </CartProvider>
);
