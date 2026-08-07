import express from 'express';
import jwt from 'jsonwebtoken';

import { Stock } from '../Database/ecomm.js';
import { Register } from '../Database/users.js';

const router = express.Router();

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

router.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'I am Up Boss.. Ready'
    });
});

router.post('/api/store', VerifyToken ,async(req, res) => {
    try{
    const { productName, description, category, 
        price, quantity, InStock } = req.body 
    
    const stock = new Stock({
        productName, description, category,
        price, quantity, InStock
    })
    await stock.save();
    res.json({
        message: 'Successfully filled the inventory..'
        })
    }
    catch(err){
        res.status(500).json({
            message: 'oops.. something went wrong'
        });
    }
});

router.get('/api/explore', VerifyToken ,async(req, res) => {
    try{
        const stock = await Stock.find().sort({createdAt: -1});
        res.json(stock);
    }
    catch(err){
        res.status(404).json({ message: 'Aww.. Nothing found', error: err.message });
    }
});

router.get('/api/explore/:productCategory', VerifyToken ,async(req, res) => {
    try{
        const productCategory = req.params.productCategory;
        const items = await Stock.find({ category: productCategory });

        if(!items.length){
            return res.status(404).json({
                message: `${productCategory} Not found`
            });
        }
        return res.status(200).json({
            message: 'Succes..',
            items
        });
    }
    catch(err){
        res.status(404).json({
            message: 'oops.. Not found',
            error: err.message
        });
    }
});

router.get('/api/profile/:userid', VerifyToken ,async(req, res) => {
    try{
        const userId = req.params.userid;
        const profile = await Register.findById(userId);

        if(!profile){
            return res.status(404).json({
                message: `User ${userId} not found`
            });
        }
        return res.status(200).json({ profile });
    }
    catch(err){
        res.status(404).json({
            message: 'oops.. Not found',
            error: err.message
        });
    }
});

export default router;