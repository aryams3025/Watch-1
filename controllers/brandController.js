const brandSchema  = require('../model/brandModel')
const paginationHelper = require('../helpers/paginationHelper')


module.exports = {
    
    getaddBrand: async (req, res) => {
        try {
            const { search, sortData, sortOrder } = req.query;
            let page = Number(req.query.page) || 1; // Using default page 1 if page is not provided or invalid

            const condition = {};
            if (search) {
                condition.brand = { $regex: search, $options: 'i' };
            }

            let sort = {};
            if (sortData) {
                if (sortOrder === 'Ascending') {
                    sort[sortData] = 1;
                } else {
                    sort[sortData] = -1;
                }
            }

            const brandCount = await brandSchema.countDocuments(condition);

            const brands = await brandSchema.find(condition)
                .sort(sort)
                .skip((page - 1) * paginationHelper.BRAND_PER_PAGE)
                .limit(paginationHelper.BRAND_PER_PAGE);

            res.render('admin/brand', {
                admin: req.session.admin,
                brand: brands,
                currentPage: page,
                hasNextPage: page * paginationHelper.BRAND_PER_PAGE < brandCount,
                hasPrevPage: page > 1,
                nextPage: page + 1,
                prevPage: page - 1,
                lastPage: Math.ceil(brandCount / paginationHelper.BRAND_PER_PAGE),
                search: search,
                sortData: sortData,
                sortOrder: sortOrder,
            });
        } catch (error) {
            console.error(error);
            
        }
    },
    addBrand: async (req, res) => {
        try {
            const brandName = req.body.brand.toUpperCase(); // Use req.body.brand for brand name
            const brand = await brandSchema.findOne({ brand: brandName });
            if (brand) {
                // Brand already exists
                res.redirect('/admin/brand');
            } else {
                // Brand doesn't exist, so create a new one
                const newBrand = new brandSchema({ brand: brandName });
                await newBrand.save();
                res.redirect('/admin/brand');
            }
        } catch (error) {
           
            console.error(error);
           
        }
    },
    geteditBrand : async(req,res) =>{
        try {
            const brand = await brandSchema.findOne({ _id: req.params.id });
            console.log(brand)
            req.session.admin = true; 
            //session assignment, replace with your actual session logic
            res.render('admin/edit-brand', { brand : brand }); // Pass brand data to the view
        } catch (error) {
            console.log(error);
        }
    },
    editBrand :async(req,res)=>{
        try{
            const updatedBrand=req.body.brand.toUpperCase()
            console.log(updatedBrand)
            console.log(req.body.brandId)
            const same=await brandSchema.findOne({brand:updatedBrand})
            if(same){
                req.flash('BrandExist','Brand already exist')
            }else{
            await brandSchema.updateOne({_id:req.body.brandId},{
                $set:{
                    brand:updatedBrand
                }
            })
        }
            res.redirect('/admin/brand')
        }catch(error){
            res.redirect(error)
        }
    },
    // listBrand : async(req,res)=>{
    //     try{
    //         await brandSchema.updateOne({_id : req.params.id})
    //         res.redirect('/admin/brand')
    //     }catch(error){
    //         console.log(error);
    //     }
    // },

    listBrand: async (req, res) => {
        try {
            await brandSchema.updateOne({ _id: req.params.id },{ $set: { status: true } })
            res.redirect('/admin/brand');
        } catch (error) {
            console.log(error);
        }
    },
    unlistBrand:async(req,res)=>{
        try{
            await brandSchema.updateOne({_id:req.params.id},{$set:{status:false}})
            res.redirect('/admin/brand')
        }catch(error){
            res.redirect(error)
        }
    }

    
}