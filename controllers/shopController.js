const productSchema = require('../model/productModel')
const categorySchema = require('../model/categoryModel')
const brandSchema = require('../model/brandModel')
const paginationHelper = require('../helpers/paginationHelper')
const {search} = require('../routers/shopRouter')

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
}
}