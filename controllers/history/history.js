const { matchedData } = require('express-validator')
const History = require('../../models/history')

exports.getAllHistory = async(req, res) => {
    try {
        const histories = await History.find()
        console.log('[GET] => all history')
        res.status(200).send(histories)
    } catch (error) {
        console.log(error)
        res.status(500).end()
    }
}

exports.createHistory = async(history) => {
    try {
        const newHistory = new History({...history})
        const result = await newHistory.save()
        console.log('[CREATE] => history')
    } catch (error) {
        console.log(error)
    }
}

exports.deleteHistory = async(req, res) => {
    const params = matchedData(req, { locations: ['params'] })
    const id = params.id

    try {
        const response = await History.findByIdAndDelete(id)
        if (response) {
            console.log('[DELETE] => history')
            res.status(200).send(true)
        }
        else
            throw new Error('History not deleted or not find')
    } catch (error) {
        console.log(error)
        res.status(500).send(false)
    }
}

exports.clearHistory = async(req, res) => {
    try {
        const response = await History.deleteMany()
        if (response) {
            console.log('[CLEAR] => history')
            res.status(200).send(true)
        }
        else
            throw new Error('History not deleted or not find')
    } catch (error) {
        console.log(error)
        res.status(500).send(false)
    }
}