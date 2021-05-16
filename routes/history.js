const express = require('express')
const router = express.Router()
const controllers = require('../controllers/history/history')
const { deletionByIdRules, validate } = require('../controllers/validator')
const { authorization } = require('../middleware/authorization')

router.get('/', /*authorization,*/ controllers.getAllHistory)

router.delete('/delete/:id', deletionByIdRules(), validate, /*authorization,*/ controllers.deleteHistory)

router.delete('/clearHistory', /*authorization,*/ controllers.clearHistory)

module.exports = router