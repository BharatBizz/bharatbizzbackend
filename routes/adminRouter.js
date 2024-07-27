const express=require('express')
const router=express.Router()

const {registerAdmin, loginAdmin, currentAdmin, getAllTransactions}=require('../controllers/adminController')
const { isAuthenticated } = require('../middlewares/auth')

router.post('/register',registerAdmin)

router.post('/login',loginAdmin)

router.post('/currentAdmin',isAuthenticated,currentAdmin)

router.get('/getAllTransactions',isAuthenticated,getAllTransactions)
module.exports=router