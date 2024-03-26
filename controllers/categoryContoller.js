
const paginationHelper=require('../helpers/paginationHelper')

const categorySchema = require('../model/categoryModel')

const offerSchema = require('../model/offerModel')

const flash = require('express-flash')


module.exports ={
    getCategory : async(req,res)=>{
        try{
            const {search , sortData , sortOrder} = req.query
            let page = Number(req.query.page)
            if(isNaN(page) || page < 1){
                page = 1;
            }

            const condition = {}
            if(search){
                condition.$or = [{
                    category : {$regex : search , $options :'i' }
                }]
            }

            let sort = {}; // Initialize an empty object for sorting

if (sortData) {
    // Check if sortData exists
    if (sortOrder === 'Ascending') {
        sort[sortData] = 1; 
    } else {
        sort[sortData] = -1; 
    }
}

//  sort object in  query
            const availabileOffers = await offerSchema.find({ status : true, expiryDate : { $gte : new Date() }})
            const categoryCount = await categorySchema.find(condition).sort(sort).count();


              const category = await categorySchema.find( condition ).populate('offer')
            .sort( sort ).skip(( page - 1 ) * paginationHelper.CATEGORY_PER_PAGE ).limit( paginationHelper.CATEGORY_PER_PAGE )
            res.render( 'admin/category', {
                admin : req.session.admin,
                category : category,
                // err : req.flash('categoryExist'),
                // success : req.flash('success'),
                currentPage : page,
                hasNextPage : page * paginationHelper.CATEGORY_PER_PAGE < categoryCount,
                hasPrevPage : page > 1,
                nextPage : page + 1,
                prevPage : page -1,
                lastPage : Math.ceil( categoryCount / paginationHelper.CATEGORY_PER_PAGE ),
                search : search,
                sortData : sortData,
                sortOrder : sortOrder,
                availabileOffers : availabileOffers

            } )
        
        }catch(error){
            console.log(error);
        }
    },
    addCategory :async(req,res)=>{
        try {
            const cat = req.body.category.toUpperCase();
            const category = await categorySchema.findOne({ category: cat });
            if (category) {
                req.flash('categoryExist', 'Category already exists');
                // res.redirect('/admin/category');
            } else {
                // Declare and initialize categoryName here
                const categoryName = new categorySchema({ category: cat });
                await categoryName.save();
                
                res.redirect('/admin/category');
            }
        } catch (error) {
            res.redirect(error);
        }
        
    },
    // geteditCategory : async(req,res)=>{
    //     try {
    //         const categories = await categorySchema.findOne({ _id: req.params.id });
    //         console.log(category)
    //         req.session.admin = true; 
    //         //session assignment, replace with your actual session logic
    //         res.render('admin/edit-category', { categories: categories , admin: req.session.admin }); // Pass category data to the view
    //     } catch (error) {
    //         console.log(error);
    //     }
        
    // },
    
    geteditCategory: async (req, res) => {
        try {
            const category = await categorySchema.findOne({ _id: req.params.id });
            console.log(category); // Logging category, not categories
            req.session.admin = true; // Session assignment, replace with your actual session logic
            res.render('admin/edit-category', { category: category, admin: req.session.admin }); // Pass category data to the view
        } catch (error) {
            console.log(error);
        }
    },
    

    editCategory :async(req,res)=>{
        try{
            const updatedCategory=req.body.category.toUpperCase()
            console.log(updatedCategory)
            console.log(req.body.categoryId)
            const same=await categorySchema.findOne({category:updatedCategory})
            if(same){
                res.send("Category already exist")
                req.flash('categoryExist','Category already exist')
                res.redirect('/admin/category');
            }else{
            await categorySchema.updateOne({_id:req.body.categoryId},{
                $set:{
                    category:updatedCategory
                }
            })
        }
            res.redirect('/admin/category')
        }catch(error){
            res.redirect(error)
        }
    },
    
    listCategory: async (req, res) => {
        try {
            await categorySchema.updateOne({ _id: req.params.id }, { $set: { status: true } });
            res.redirect('/admin/category');
        } catch (error) {
            console.log(error);
        }
    },
    

    //soft delete
    unlistCategory:async(req,res)=>{
        try{
            await categorySchema.updateOne({_id:req.params.id},{$set:{status:false}})
            res.redirect('/admin/category')
        }catch(error){
            res.redirect('/500')
        }
    },
    deleteCategory :async(req,res)=>{
        try{
            await categorySchema.deleteOne({_id:req.params.id})
            res.redirect('/admin/category')
        }catch(error){
            console.log(error);
        }
    }
}