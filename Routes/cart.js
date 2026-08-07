import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

import { Stock } from '../Database/ecomm.js';
import { Register } from '../Database/users.js';
import { Cart } from '../Database/cartDB.js';

const router = express.Router();

// Verify JWT token and set req.user with decoded payload.
const VerifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token missing or invalid' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token missing or invalid' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token or token expired' });
    }
};

// Only customers can use cart endpoints in this file.
const requireCustomer = (req, res, next) => {
    if (!req.user || req.user.role !== 'customer') {
        return res.status(403).json({ message: 'Only customers can access cart actions' });
    }
    next();
};

// Admin-only helper route example.
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can access this endpoint' });
    }
    next();
};

// Calculate the cart total from items.
const calculateCartTotal = (items) => {
    return items.reduce((sum, item) => sum + item.subtotal, 0);
};

// Get or create an active cart for the current user.
const getOrCreateCart = async (userId) => {
    let cart = await Cart.findOne({ user: userId, status: 'active' });
    if (!cart) {
        cart = new Cart({ user: userId, items: [], total: 0 });
    }
    return cart;
};

// Add a product to the cart, or increase quantity if already present.
const addOrUpdateItem = (cart, product, quantity) => {
    const existingItem = cart.items.find((item) => item.product.toString() === product._id.toString());
    const quantityNumber = Number(quantity);

    if (existingItem) {
        existingItem.quantity += quantityNumber;
        existingItem.subtotal = existingItem.quantity * existingItem.price;
    } else {
        cart.items.push({
            product: product._id,
            productName: product.productName,
            price: product.price,
            quantity: quantityNumber,
            subtotal: product.price * quantityNumber
        });
    }

    cart.total = calculateCartTotal(cart.items);
};

// Return current customer cart.
router.get('/api/cart', VerifyToken, requireCustomer, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id, status: 'active' }).populate('items.product');
        return res.json({ cart: cart || { items: [], total: 0 } });
    } catch (err) {
        return res.status(500).json({ message: 'Unable to load cart', error: err.message });
    }
});

// Add product to cart endpoint.
router.post('/api/cart/add', VerifyToken, requireCustomer, async (req, res) => {
    const { productId, quantity } = req.body;
    if (!productId || !quantity || Number(quantity) < 1) {
        return res.status(400).json({ message: 'productId and quantity (>= 1) are required' });
    }

    try {
        const product = await Stock.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (!product.InStock) {
            return res.status(400).json({ message: 'Product is not in stock' });
        }

        const cart = await getOrCreateCart(req.user.id);
        addOrUpdateItem(cart, product, quantity);
        await cart.save();

        return res.json({ message: 'Product added to cart', cart });
    } catch (err) {
        return res.status(500).json({ message: 'Unable to add item to cart', error: err.message });
    }
});

// Update the quantity of a cart item.
router.put('/api/cart/update', VerifyToken, requireCustomer, async (req, res) => {
    const { productId, quantity } = req.body;
    if (!productId || quantity == null || Number(quantity) < 1) {
        return res.status(400).json({ message: 'productId and quantity (>= 1) are required' });
    }

    try {
        const cart = await Cart.findOne({ user: req.user.id, status: 'active' });
        if (!cart) {
            return res.status(404).json({ message: 'Active cart not found' });
        }

        const item = cart.items.find((item) => item.product.toString() === productId);
        if (!item) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }

        item.quantity = Number(quantity);
        item.subtotal = item.quantity * item.price;
        cart.total = calculateCartTotal(cart.items);
        await cart.save();

        return res.json({ message: 'Cart updated', cart });
    } catch (err) {
        return res.status(500).json({ message: 'Unable to update cart', error: err.message });
    }
});

// Remove an item from the cart.
router.delete('/api/cart/remove/:productId', VerifyToken, requireCustomer, async (req, res) => {
    const { productId } = req.params;
    try {
        const cart = await Cart.findOne({ user: req.user.id, status: 'active' });
        if (!cart) {
            return res.status(404).json({ message: 'Active cart not found' });
        }

        cart.items = cart.items.filter((item) => item.product.toString() !== productId);
        cart.total = calculateCartTotal(cart.items);
        await cart.save();

        return res.json({ message: 'Item removed from cart', cart });
    } catch (err) {
        return res.status(500).json({ message: 'Unable to remove item', error: err.message });
    }
});

// Checkout cart: mark as checked out and leave a record.
router.post('/api/cart/checkout', VerifyToken, requireCustomer, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id, status: 'active' }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        cart.status = 'checked_out';
        await cart.save();

        return res.json({ message: 'Checkout completed', order: { total: cart.total, items: cart.items } });
    } catch (err) {
        return res.status(500).json({ message: 'Unable to complete checkout', error: err.message });
    }
});

// Admin can view all carts (optional admin-only route).
router.get('/api/cart/admin/all', VerifyToken, requireAdmin, async (req, res) => {
    try {
        const carts = await Cart.find().populate('user', 'username email').populate('items.product');
        return res.json({ carts });
    } catch (err) {
        return res.status(500).json({ message: 'Unable to load carts', error: err.message });
    }
});

export default router;
