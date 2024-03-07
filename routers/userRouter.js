const express = require('express')
const userController = require('../controllers/userController')

const isAuth = require('../middleware/isAuth')
const isBlocked = require('../middleware/isBlocked')



const router = express.Router()

