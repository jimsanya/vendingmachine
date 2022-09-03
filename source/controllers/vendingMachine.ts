import { Request, Response, NextFunction } from 'express';
import { resetVendingMachine,getVendingMachine, initialData, Change, } from "../VendingMachine";



//Get Machine status
const machineState = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const machine=getVendingMachine();
        machine.AvailableChange
        return res.json(
            {
                initialized:machine.Initialized,
                slots:machine.Slots,
                change:machine.AvailableChange,
                allowedCoins:machine.acceptedCoins,
            }
        )
    } catch (error) {
        return res.status(400).json({
            code:"400",
            error:error
        })
    }
    
};

//Initialize the machine
const initMachine = async (req: Request, res: Response, next: NextFunction) => {

    let data:initialData = req.body;

    try {
        const machine=getVendingMachine()
        if (!machine.Initialized) {
            getVendingMachine().initialize(data);
            return res.status(204).send()
        } else {
            return res.status(403).json({
                code:"403",
                error:"Cannot Initialize Machine! Already initialized"
            })
        }
        
    } catch (error) {
        return res.status(400).json({
            code:"400",
            error:error
        })
    }
    
};
//Reset the Vending Machine status
const resetMachine = async (req: Request, res: Response, next: NextFunction) => {

    let data:initialData = req.body;

    try {
        const machine=getVendingMachine()
        if (machine.Initialized) {
            resetVendingMachine()
            return res.json(
                {
                    code:"200",
                    message:"Reset successful"
                }
            )
        } else {
            return res.status(403).json({
                code:"403",
                error:"Cannot Reset Machine! Uninitialized"
            })
        }
        
    } catch (error) {
        return res.status(400).json({
            code:"400",
            error:error
        })
    }
    
};
//Reset the Vending Machine status
const setPrice = async (req: Request, res: Response, next: NextFunction) => {

    let data:any = req.body;

    try {
        const machine=getVendingMachine()
        if (machine.Initialized) {
            const slot =machine.setPrice(data.slot,data.price)
            if (slot) {
                return res.json(
                    {
                        code:"200",
                        message:"Successful",
                        data:slot
                    }
                )
            } else {
                return res.json(
                    {
                        code:"404",
                        message:"Slot Not found",
                    }
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
//Adjust the number of items available for a product slot
const setCount = async (req: Request, res: Response, next: NextFunction) => {

    let data:any = req.body;

    try {
        const machine=getVendingMachine()
        if (machine.Initialized) {
            const slot =machine.setSlotCount(data.slot,data.count)
            if (slot) {
                return res.json(
                    {
                        code:"200",
                        message:"Successful",
                        data:slot
                    }
                )
            } else {
                return res.json(
                    {
                        code:"404",
                        message:"Slot Not found",
                    }
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
//Update the coins available in the machine for each type of coin
const updateCoins = async (req: Request, res: Response, next: NextFunction) => {

    let data:Change[] = req.body;
    try {
        const machine=getVendingMachine()
        if (machine.Initialized) {
            const changeRes =machine.updateCoins(data)
            if (changeRes.data) {
                return res.json(
                    {
                        code:"200",
                        message:"Successful",
                        data:changeRes.data
                    }
                )
            } else {
                return res.json(
                    {
                        code:"403",
                        message:changeRes.message,
                    }
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
export default {updateCoins, setCount,setPrice,initMachine ,machineState,resetMachine};