const userSchema = require('../model/userModels')

module.exports = {
    getHomepage : async(req,res)=>{
        res.render('shop/home')
    }
}