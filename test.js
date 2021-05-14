//https://api.binance.com/api/v3/
//https://testnet.binance.vision/api/v3

const obj = [1,2,3,4,5,6,7]

function myFunc(value) {
    const result = 0
    const tmp = obj.reduce((accumulator, currentValue) => {
        if (currentValue === 7)
            return currentValue
        return result
    }, result)
    return tmp
}

console.log('res:', ((10*50)/100))