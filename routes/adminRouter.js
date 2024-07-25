const express=require('express')
const router=express.Router()

const {registerAdmin, loginAdmin, currentAdmin}=require('../controllers/adminController')
const { isAuthenticated } = require('../middlewares/auth')

router.post('/register',registerAdmin)

router.post('/login',loginAdmin)

router.post('/currentAdmin',isAuthenticated,currentAdmin)

module.exports=router