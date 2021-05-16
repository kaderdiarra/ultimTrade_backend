const express = require('express')
const controllers = require('../controllers/trade/trade')
const { tradingRules, validate } = require('../controllers/validator')
const router = express.Router()
const { authorization } = require('../middleware/authorization')

router.post('/', tradingRules(), validate, authorization, controllers.trade)

module.exports = router