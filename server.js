import 'dotenv/config';

import express from 'express';
const app = express();
app.use(express.json());

import router from './Routes/routes.js';
app.use(router);

import Loginroute from './Routes/loginRoute.js';
app.use(Loginroute);

import cartRoute from './Routes/cart.js';
app.use(cartRoute);

import mongoose from 'mongoose';
mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log('Database connected..');
        app.listen(3000, () => {
            console.log('server: http://localhost:3000');
        });
    })
    .catch((err) => {
        console.log(err.message);
});
