const offerSchema = require('../model/offerModel')

module.exports = {
    //Getting offers
    getOffers:async(req,res)=>{
        try{
            const offers=await offerSchema.find()
            res.render('admin/offers',{
                offers:offers,
                now:new Date(),
                admin:true
            })
        }catch(error){
            res.redirect('/500')
        }
    },
    getAddOffer:async(req,res)=>{
        try{
            res.render('admin/add-offer',{
                err:req.flash('err'),
                admin:true
            })
        }catch(error){
            res.redirect('/500')
        }
    },
    //Adding offer
    addOffer:async(req,res)=>{
        try{
            const {search,page}=req.query
            const {startingDate,expiryDate,percentage}=req.body
            const name=req.body.name.toUpperCase()
            const offerExist=await offerSchema.findOne({name:name})
            if(offerExist){
                req.flash('err','offer already exists!!!')
                res.redirect('/admin/add-offer')
            }else{
                const offer=new offerSchema({
                    name:name,
                    startingDate:startingDate,
                    expiryDate:expiryDate,
                    percentage:percentage,
                    search:search,
                    page:page
                })
                await offer.save()
                res.redirect('/admin/offers')
            }
        }catch(error){
            res.redirect('/500')
        }
    },
    geteditOffer : async(req,res) =>{
        try{
            const {id}=req.params
            const offer=await offerSchema.findOne({_id:id})
            res.render('admin/edit-offer',{
                admin:true,
                offer:offer
            })
        }catch(error){
            console.log(error);
        }
    },
    posteditOffer : async(req,res) =>{
        try{
            const {id,name,startingDate,expiryDate,percentage}=req.body
            await offerSchema.updateOne({_id:id},{
                $set:{
                    name:name.toUpperCase(),
                    startingDate:startingDate,
                    expiryDate:expiryDate,
                    percentage:percentage
                }})
                res.redirect('/admin/offers')
        }catch(error){
            console.log(error);
        }
    },
    cancelOffer : async(req,res) =>{
        try{
            const {offerId} = req.body
            await offerSchema.updateOne({_id : offerId},{
                $set : {
                    status : false 
                }
            })
            res.json({cancelled : true})
        }catch(error){
            console.log(error);
        }
    },
    activateOffer : async(req,res) =>{
        try{
            const {offerId} = req.body
            await offerSchema.updateOne({_id : offerId},{
                $set : {
                    status : true
                }
            })
            res.json({activated : true})
        }catch(error){
            console.log(error);
        }
    },
}