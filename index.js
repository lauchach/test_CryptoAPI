const express = require('express')
const axios = require('axios')
const NodeCache = require('node-cache')
const yf = require('yahoo-finance2').default

const app = express()
const port = 3000
const cache = new NodeCache({ stdTTL: 300 })

app.use(express.json())

app.get('/stock/:ticker', async (req, res) => {
    // console.log('GET stock', req)
    const ticker = req?.params?.ticker.toUpperCase()
    const cacheKey = `stock_${ticker}`
    
    if (cache.has(cacheKey)) return res.json(cache.get(cacheKey))
    
    try {
        const quote = await yf.quote(ticker)
        cache.set(cacheKey, quote)
        res.json(quote)
    } catch (error) {
        // console.log('GET stock error', error)
        res.status(500).json({ error: error.message })
    }
})

app.get('/crypto/:symbol', async (req, res) => {
    const symbol = req?.params?.symbol.toUpperCase()
    const cacheKey = `crypto_${symbol}`
    // console.log('GET crypto', symbol)
    if (cache.has(cacheKey)) return res.json(cache.get(cacheKey))
    
    try {
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd`
        const response = await axios.get(url)
        const price = response.data[symbol.toLowerCase()]
        cache.set(cacheKey, price)
        res.json(price)
    } catch (error) {
        // console.log('GET crypto error', error)
        res.status(500).json({ error: error.message })
    }
})

app.listen(port, () => {
    console.log(`Server Running at http://localhost:${port}`)
})