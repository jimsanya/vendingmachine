import express from 'express';
import controller from '../controllers/vendingMachine';
const router = express.Router();

router.post('/admin/init', controller.initMachine);
router.get('/admin/status', controller.machineState);
router.get('/admin/reset', controller.resetMachine);
router.patch('/admin/setPrice', controller.setPrice);
router.patch('/admin/setCount', controller.setCount);
router.put('/admin/updatecoins', controller.updateCoins);
export {router}