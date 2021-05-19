const { body, param, query, validationResult } = require('express-validator')
const ObjectId = require('mongoose').Types.ObjectId
const { isValidApiKey, isValidSecretKey } = require('../utils/validate-keys')

const isAlphaWithSpace = value => value.match(/^[A-Za-zÀ-ÖØ-öø-ÿ ]+$/)
const isAlphaNumWithSpace = value => value.match(/^$|^[0-9A-Za-zÀ-ÖØ-öø-ÿ ]+$/)

const isValidObjectId = (id) => {
    if (ObjectId.isValid(id)) {
        if ((String)(new ObjectId(id)) === id)
            return true
        return false;
    }
    return false;
}

const containsValue = (value, container) => container?.includes(value)

const verifySymbols = (symbol, element) => {
    return containsValue(symbol?.name, element)
}

const clientValidationRules = () => {
    return [
        body('firstName', 'Invalid first name').notEmpty().isString().custom(isAlphaWithSpace).isLength({ min: 3, max: 30 }).toLowerCase(),
        body('lastName', 'Invalid last name').notEmpty().isString().custom(isAlphaWithSpace).isLength({ min: 3, max: 30 }).toLowerCase(),
        body('email', 'Invalid email').notEmpty().isEmail(),
        body('description', 'Invalid description').exists().isString().custom(isAlphaNumWithSpace).isLength({ max: 256 }),
        body('picture', 'Invalid picture').exists().isString(),
        body('apiKey', 'Invalid api key').notEmpty().isString().isLength({ min: 64, max: 64 }).custom(isValidApiKey),
        body('secretKey', 'Invalid secret key').notEmpty().isString().isLength({ min: 64, max: 64 }).custom(isValidSecretKey),
    ]
}

const userLoginValidationRules = () => {
    return [
        body('email', 'Invalid email').notEmpty().isEmail(),
        body('password', 'Invalid password format').notEmpty().isString().isStrongPassword().isLength({ max: 16 }),
    ]
}

const userCreationValidationRules = () => {
    return [
        body('firstName', 'Invalid first name').notEmpty().isString().custom(isAlphaWithSpace).isLength({ min: 3, max: 30 }).toLowerCase(),
        body('lastName', 'Invalid last name').notEmpty().isString().custom(isAlphaWithSpace).isLength({ min: 3, max: 30 }).toLowerCase(),
        body('email', 'Invalid email').notEmpty().isEmail(),
        body('password', 'Invalid password format').notEmpty().isString().isStrongPassword().isLength({ max: 16 }),
        body('confirmPassword', 'Invalid confirmation password').notEmpty().isString().isStrongPassword().isLength({ max: 16 }),
    ]
}

const deletionByIdRules = () => {
    return (
        param('id', 'Invalid id').notEmpty().isString().isAlphanumeric().custom(isValidObjectId)
    )
}

const clientUpdateRules = () => {
    return [
        param('_id', 'Invalid id').notEmpty().isString().isAlphanumeric().custom(isValidObjectId),
        body('firstName', 'Invalid first name').optional().isString().custom(isAlphaWithSpace).isLength({ min: 3, max: 30 }).toLowerCase(),
        body('lastName', 'Invalid last name').optional().isString().custom(isAlphaWithSpace).isLength({ min: 3, max: 30 }).toLowerCase(),
        body('email', 'Invalid email').optional().isEmail(),
        body('description', 'Invalid description').optional().isString().custom(isAlphaNumWithSpace).isLength({ max: 256 }),
        body('picture', 'Invalid picture').optional().isString(),
        body('apiKey', 'Invalid api key').optional().isString().isLength({ min: 64, max: 64 }).custom(isValidApiKey),
        body('secretKey', 'Invalid secret key').optional().isString().isLength({ min: 64, max: 64 }).custom(isValidSecretKey),
    ]
}

const tradingRules = () => {
    return [
        body('clientsId', 'Invalid clients id').notEmpty().isArray(),
        body('clientsId.*', 'Invalid clients id').isString().isAlphanumeric().custom(isValidObjectId),
        body('symbol', 'Invalid symbol').notEmpty().isObject().custom(value => verifySymbols(value, ['BTCUSDT', 'ZECUSDT', 'HIVEUSDT', 'ICXUSDT', 'COTIUSDT', 'NEOUSDT', 'DIAUSDT', 'XLMUSDT'])),
        body('side', 'Invalid side').notEmpty().isString().isAlpha().custom(value => containsValue(value, ['SELL', 'BUY'])),
        body('type', 'Invalid type').notEmpty().isString().custom(value => containsValue(value, ['LIMIT', 'MARKET'])),
        body('quoteOrderQty', 'Invalid quoteOrderQty').optional().isNumeric(),
        body('amountPercentage', 'Invalid amount percentage').notEmpty().toInt().custom(value => (value >= 0 && value <= 100 ? true : false)),
        body('amountType', 'Invalid amount type').notEmpty().isString().isAlpha().custom(value => containsValue(value, ['PERCENTAGE', 'QUANTITY'])),
        //body("timeInForce", "Invalid timeInForce").optional().isString().custom(value => containsValue(value, ['GTC'])),
        //body("quantity", "Invalid quantity").optional().isNumeric(),
        //body("price", "Invalid price").optional().isNumeric(),
    ]
}

const searchClientRules = () => {
    return (
        query('toSearch', 'Invalid search value').exists().isString().isLength({ max: 60 }).toLowerCase()
    )
}

const validate = (req, res, next) => {
    const errors = validationResult(req, { strictParams: ['body'] })

    if (errors.isEmpty())
        return next();

    const extractedErrors = []
    errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }))

    return res.status(422).json({
        errors: extractedErrors,
    })
}

module.exports = {
    clientValidationRules,
    deletionByIdRules,
    clientUpdateRules,
    searchClientRules,
    userLoginValidationRules,
    userCreationValidationRules,
    tradingRules,
    validate,
}
