import mongoose from 'mongoose';


// Cart item schema: stores line item data for a product in the user's cart.
const CartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stock',
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    subtotal: {
        type: Number,
        required: true
    }
}, { _id: true });

// Cart schema: stores one cart per customer, with status and totals.
const CartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Register',
        required: true,
        unique: true
    },
    items: [CartItemSchema],
    total: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'checked_out'],
        default: 'active'
    }
}, { timestamps: true });

export const Cart = mongoose.models.Cart || mongoose.model('Cart', CartSchema);