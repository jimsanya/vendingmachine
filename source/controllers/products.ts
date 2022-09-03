import { Request, Response, NextFunction } from 'express';
import { buyProductpayload, getVendingMachine} from "../VendingMachine";


const buyProduct = async (req: Request, res: Response, next: NextFunction) => {
    const data:buyProductpayload=req.body
    try {
        const machine=getVendingMachine()
        if (machine.Initialized) {
            const BuyRes =machine.buyProduct(data)
            if (BuyRes?.status==200) {
                return res.json(
                    BuyRes
                )
            } else {
                return res.status(BuyRes!.status).json(
                    BuyRes
                )
            }
            
        } else {
            return res.status(403).json({
                code:"403",
                error:"Machine Is not Initialized"
            })
        }
       
    } catch (error) {
        return res.status(400).json({
            code:"400",
            error:error
        })
    }
    
};



export default { buyProduct};