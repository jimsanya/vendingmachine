import express from 'express';
import controller from '../controllers/products';
const router = express.Router();


router.post('/buyProduct', controller.buyProduct);
export {router}