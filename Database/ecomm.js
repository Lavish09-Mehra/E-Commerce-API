import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",   // Your User model name
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: String,
        required: true
    },
    InStock: {
        type: Boolean,
        default: true
    }
}, { timestamps: true })

export const Stock = mongoose.model('Stock', ProductSchema );