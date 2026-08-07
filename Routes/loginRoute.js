import express from 'express';
const Loginroute = express.Router();

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import { Register } from '../Database/users.js';

//middleware
const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    if (req.user.role !== requiredRole) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

//Read token from Authorization 
const VerifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization

    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token missing..' })
    }

    //verify the token 
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token missing..' });
  }
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch(err){
        return res.status(401).json({ message: 'oops.. you are not Authorized person' });
    }
}

//login check up if user exits ot not 
Loginroute.post('/api/login', async(req, res) => {
    const { email, password } = req.body;
    try{
        const user = await Register.findOne({email});
        if(!user){
            return res.status(404).json({
                message: 'oops.. user not found'
            })
        }
        //compare plain password with bycrypt one
        const Ismatched = await bcrypt.compare(password, user.password)
        if(!Ismatched){
            return res.status(401).json({
                message: 'wrong..password'
            })
        }
        const token = jwt.sign({

            id: user._id, 
            role: user.role,
            username: user.username

        }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });
        res.json({
            message: 'Login Succesfully..',
            token
        })
}
    catch(err){
        res.status(401).json({
            message: 'oops.. someting went wrong',
            err
        })
    }
});

//signup Route 
Loginroute.post('/api/signup', async(req, res) => {
    try{
        const {username, email, password, role} = req.body;

        //if user didn't type any field it shows to fill instead of crash 
        if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await Register.findOne({
        $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(409).json({
            message: "User already exists"
            });
        }

        const hashedPass = await bcrypt.hash(password, 12);
        const user = new Register({
            username,
            email,
            password: hashedPass,
            role
        })
        const result = await user.save();
        res.json({message: 'you signed up.. succesfully', user: result});
    }
    catch(err){
        res.status(500).json({
            message: 'oops.. cant login you try again',
            err
        })
    }
});

//forgot password route
Loginroute.put('/api/user/forgot-password', VerifyToken ,async(req, res) => {
    try{
        const { username, email, NewPassword } = req.body
        const user = await Register.findOne({ username, email});
        if(!user){
            return res.status(404).json({
                message:'USER NOT FOUND..'
            });
        }

        const hashedpassword = await bcrypt.hash(NewPassword, 10);
        user.password = hashedpassword;
        await user.save();
        res.status(200).json({ message: `Password succesfully changed by ${username}` })
    }
    catch(err){
        res.status(501).json({message: 'oops.. something went wrong', err})
    }
})

export default Loginroute;