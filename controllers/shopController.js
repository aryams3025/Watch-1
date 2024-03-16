const productSchema = require('../model/productModel')
const categorySchema = require('../model/categoryModel')
const brandSchema = require('../model/brandModel')
const paginationHelper = require('../helpers/paginationHelper')
const {search} = require('../routers/shopRouter')
const cartSchema = require('../model/cartModel')
const addressSchema = require('../model/addressModel')
const userSchema = require('../model/userModels')
const cartHelper = require('../helpers/cartHelper')

module.exports = {

    getShop:async(req,res)=>{
        try{
            const {cat,brand,search}=req.query
            const userLoggedin=req.session.user
            let page=Number(req.query.page);
            if(isNaN(page)|| page<1){
                page=1;
            }
            const condition = {
                status: true
              };
              if(cat){
                condition.category=cat
            }
            if(brand){
                condition.brand=brand
            }
            if(search){
                condition.$or=[
                    {name:{$regex:search,$options:"i"}},
                    {description:{$regex:search,$options:"i"}}
                ]
            }
            const productCount=await productSchema.find(condition).count()
            const products = await productSchema.find(condition)
            .populate({
                path: "category",
                match: { status: true }
            })
            .populate({
                path: "brand",
                match: { status: true }
            })
            .skip((page - 1) * paginationHelper.ITEMS_PER_PAGE)
            .limit(paginationHelper.ITEMS_PER_PAGE);
            const filteredProducts = products.filter(product => product.category && product.brand);  // Pagination
            const category = await categorySchema.find({ status: true }) 
            const brands = await brandSchema.find({status:true})
            const startingNo = (( page - 1) * paginationHelper.ITEMS_PER_PAGE ) + 1
            const endingNo = Math.min(startingNo + paginationHelper.ITEMS_PER_PAGE)
            res.render( 'shop/shop', {
                userLoggedin:userLoggedin,
                products  : filteredProducts,
                category : category,
                brands : brands,
                totalCount : productCount,
                currentPage : page,
                hasNextPage : page * paginationHelper.ITEMS_PER_PAGE < productCount, // Checks is there is any product to show to next page
                hasPrevPage : page > 1,
                nextPage : page + 1,
                prevPage : page -1,
                lastPage : Math.ceil( productCount / paginationHelper.ITEMS_PER_PAGE||1 ),
                startingNo : startingNo,
                endingNo : endingNo,
                cat : cat,
                brand : brand,
                search : search
            })
        }catch(error){
            res.redirect('/500')
        }
    },
getSingleProduct : async(req,res)=>{
    try{
        const product = await productSchema.find({ _id : req.params.id, status : true })
        .populate({
            path : 'offer',
            match :  { startingDate : { $lte : new Date() }, expiryDate : { $gte : new Date() }}
        })
        .populate({
            path : 'category',
            populate : {
                path : 'offer',
                match : { startingDate : { $lte : new Date() }, expiryDate : { $gte : new Date() }}
            }
        }).populate({
            path: 'review.userId',
        });  
        res.render( 'shop/single-product', {
            product : product,})    
    }catch(error){
        console.log(error);
    }
},



// getCheckOut : async (req,res) => {
//     try{
//         //extracting the user object from the session
//         const {user} = req.session
    
//         const cart = await cartSchema.findOne({userId : user})
//         const cartAmount = cart ? cart.subtotal : 0;


//         const userDetails = await userSchema.findOne({_id: user})
        
        
//         const address = await userSchema.findOne({_id: user}).populate('address')
//         const addresses = address.address.reverse()


//         const flashMessage = req.flash()

//         res.render('shop/checkout',{
//             cartAmount: cartAmount,
//            // subtotalAmount : subtotalAmount,
//             address : addresses,
//             user : userDetails,
//             messages : flashMessage
//         })
//     }catch(error){
//         console.log(error);
//     }
// },

getCheckOut : async( req, res ) => {
    try {
        const { user } = req.session
        const cartAmount = await cartHelper.totalCartPrice( user )
        const cart = await cartSchema.findOne({ userId : user })
        const userDetails = await userSchema.findOne({ _id : user })
        let discounted
        if( cart && cart.coupon && cartAmount && cartAmount.length > 0 ) {
            discounted = await couponHelper.discountPrice( cart.coupon, cartAmount[0].total )
        }
        const address = await userSchema.findOne({ _id : user }).populate( 'address' )
        const addresses = address.address.reverse()
        const flashMessages = req.flash()
        res.render( 'shop/checkout', {
            cartAmount : cartAmount,
            address : addresses,
            discounted : discounted,
            user : userDetails,
             messages: flashMessages 

        })
    } catch ( error ) {
        console.log(error);
    }
},
getCheckoutAddAddress:async(req,res)=>{
    res.render('shop/checkout-address')
},


checkoutAddAddress : async (req,res) =>{
    try{
        const address = new addressSchema({
            fullName : req.body.fullName,
            mobile : req.body.mobile,
            street : req.body.street,
            village : req.body.village,
            city : req.body.city,
            pincode : req.body.pincode,
            landmark : req.body.landmark,
            state : req.body.state,
            country : req.body.country,
            userId : req.session.user

        })

        const result = await address.save()
        await userSchema.updateOne({_id:req.session.user},{$push :{address : result._id}})
        res.redirect('/checkout')
    }catch(error){
        console.log(error);
    }
}


}