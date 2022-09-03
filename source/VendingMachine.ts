
//payload to initialize the Vending machine
interface initialData {
    slots: productSlot[],
    change: Change[],
    allowedCoins: string[]
}
interface buyProductpayload {
    slot: number,
    coins: Change[]
}
//the slots inthe machine
interface productSlot {
    slot: number,
    price: number,
    count: number
}
//Coin Model
interface Coin {
    name: string
    value: number
}
//Available change
interface Change {
    coin: string,
    count: number
}
//This is the Class representing a venting machine and the operations that can pe perfomed 
class VendingMachine {
    /**
     *
     */
    constructor(public AvailableChange: Change[], public acceptedCoins: string[], public Slots: productSlot[]) {

    }
    private initialized: boolean = false;
    private coins: Coin[] = [{ name: "5C", value: 0.05 }, { name: "10C", value: 0.10 }, { name: "25C", value: 0.25 }, { name: "50C", value: 0.50 }]
    public get Initialized() {
        return this.initialized
    }
    //this method will initialize the machine and make it available to use
    initialize(data: initialData) {
        this.AvailableChange = data.change;
        this.acceptedCoins = data.allowedCoins
        this.Slots = data.slots
        this.initialized = true;


    }
    //Set the price
    setPrice(slotNumber: number, price: number) {
        const slot = this.Slots.find(s => s.slot == slotNumber)
        if (slot) {
            slot.price = price
            return slot
        } else {
            return undefined
        }
    }
    //Adjust the number of items available for a product slot
    setSlotCount(slotNumber: number, count: number) {
        const slot = this.Slots.find(s => s.slot == slotNumber)
        if (slot) {
            slot.count = count
            return slot
        } else {
            return undefined
        }
    }
    //Update available Coins using the maintenance interface
    updateCoins(change: Change[]) {


        for (let coin of change) {
            if (!this.acceptedCoins.includes(coin.coin)) {
                return { status: "fail", message: `${coin.coin} coin is not allowed`, data: undefined }
            }
        }
        console.log(change)
        this.AvailableChange = change
        return { status: "Success", message: "Change Updated", data: this.AvailableChange }
    }
    //Check if the machin can dispense exact change
    CheckforExactChange(receivedCoins:Change[],price:number){
        const priceIncents=price*100;
        //totalAmountPresented
        const amountReceivedIncents=this.getTotalAmountTendered(receivedCoins)*100
        let changeDue=amountReceivedIncents-priceIncents
        //get the coin values in cents
        const coinValuesIncents=this.AvailableChange.map(co=>{
            const value=this.coins.find(c=>c.name===co.coin)!.value*100
            return {value,count:co.count,name:co.coin}
        })


        coinValuesIncents.sort((a,b)=>b.value-a.value)
        const changeCoins:Change[]=[] as Change[]
        for (let index = 0; index < coinValuesIncents.length; index++) {
            console.log("99",coinValuesIncents[index].value)
            if (coinValuesIncents[index].value<=changeDue && coinValuesIncents[index].count>0) {
                let multiple=0;
                console.log("102 changeCoins",changeCoins)

                if (changeDue%coinValuesIncents[index].value==0) {
                     multiple=changeDue/coinValuesIncents[index].value
                    if (multiple<=coinValuesIncents[index].count) {
                        changeCoins.push({coin:coinValuesIncents[index].name,count:multiple})
                        console.log("102 changeCoins",changeCoins)
                        return{status:"success",change:changeCoins}
                    } else {
                        changeDue -=coinValuesIncents[index].value*coinValuesIncents[index].count
                        changeCoins.push({coin:coinValuesIncents[index].name,count:coinValuesIncents[index].count})
                    }
                } else {
                    multiple= Math.floor(changeDue/coinValuesIncents[index].value)
                    changeDue -=coinValuesIncents[index].value*multiple
                    changeCoins.push({coin:coinValuesIncents[index].name,count:multiple})
                }
                
            }

            
        }

        return{status:"failed",change:[]}
    }
    //Attempt to perfom purchase
    buyProduct(purchaseData: buyProductpayload) {

        if (this.ValidateTenderedCoins(purchaseData.coins).status === "Success") {
            const tenderedAmount = this.getTotalAmountTendered(purchaseData.coins)
            const availableChange=this.getTotalAmountTendered(this.AvailableChange)
            
            const slot = this.Slots.find(s => s.slot === purchaseData.slot)
            if (slot) {
                if (slot.count<1) {
                    return {status:404,message:"Slot is empty",change:purchaseData.coins}
                }
                if (slot.price<=tenderedAmount) {
                    const ChangeDue=tenderedAmount-slot.price
                    
                    if (ChangeDue===0) {
                        slot.count--
                        this.updateSell(purchaseData.coins)
                        return {status:200,message:"Purchase Complete",change:[] as Change[]}
                    } else {
                        console.log("138",tenderedAmount)
                        const canGiveChange=this.CheckforExactChange(purchaseData.coins,slot.price)
                        if (canGiveChange.status==="success") {
                            slot.count--
                            this.updateSell(purchaseData.coins)
                            this.updateSellAfterGiveChange(canGiveChange.change)
                            return {status:200,message:"Purchase Complete",canGiveChange}
                        } else {
                            return {status:406,message:"No change ",change:purchaseData.coins}
                        }
                    }

                } else {
                    //insufficient Funds
                    return {status:406,message:"Funds Not Enough",change:purchaseData.coins}
                }
            } else {
                return {status:404,message:"Slot Not Found",change:purchaseData.coins}
            }
            
        } else {
            return {status:403,message:"Invalid Coins Tendered",change:purchaseData.coins}
        }
        return undefined
    }
    //Update the available coins after a sell
    updateSell(coins: Change[]) {
        for (let coin of coins) {
            this.AvailableChange.find(co=>co.coin===coin.coin)!.count+=coin.count
        }
    }
    updateSellAfterGiveChange(coins: Change[]) {
        for (let coin of coins) {
            this.AvailableChange.find(co=>co.coin===coin.coin)!.count-=coin.count
        }
    }
    //Calculate the tootal value of coins presented
    getTotalAmountTendered(coinsTendered: Change[]) {
        return coinsTendered.map(c => {
            const coinValue = this.coins.find(co => co.name === c.coin)?.value
            return coinValue! * c.count
        }).reduce((x, y) => x + y)
    }
    //Check If all coins presented are acceptable
    ValidateTenderedCoins(coinsTendered: Change[]) {
        for (let coin of coinsTendered) {
            if (!this.acceptedCoins.includes(coin.coin)) {
                return { status: "fail", message: `${coin.coin} coin is not allowed` }
            }
        }
        return { status: "Success", message: "All Coins Valid" }
    }
}
const coinsAccepted: string[] = [] as string[]
const productSlots: productSlot[] = [] as productSlot[]
const change: Change[] = [] as Change[]

let VM = new VendingMachine(change, coinsAccepted, productSlots)
const resetVendingMachine = () => {
    VM = new VendingMachine(change, coinsAccepted, productSlots)
}
const getVendingMachine = () => VM;

export { resetVendingMachine, getVendingMachine, productSlot, VendingMachine, Coin, Change, initialData, buyProductpayload }