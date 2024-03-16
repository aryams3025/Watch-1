const orderSchema =require('../model/orderModel')
const cartSchema = require('../model/cartModel')
const productSchema = require('../model/productModel')
const userSchema = require('../model/userModels')
const cartHelper = require('../helpers/cartHelper')
const paginationHelper=require('../helpers/paginationHelper')

const crypto=require('crypto')
const { log } = require('console')

module.exports = {
    placeOrder : async (req,res) =>{
        try{
            

        }catch(error){
            console.log(error);
        }
    }
}