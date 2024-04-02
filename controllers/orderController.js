const orderSchema =require('../model/orderModel')
const cartSchema = require('../model/cartModel')
const productSchema = require('../model/productModel')
const userSchema = require('../model/userModels')
const cartHelper = require('../helpers/cartHelper')
const couponHelper = require('../helpers/couponHelper')
const paginationHelper=require('../helpers/paginationHelper')
const couponSchema=require('../model/couponModel')
const {RAZORPAY_KEY_SECRET}=process.env
const crypto=require('crypto')
const paymentHelper = require('../helpers/paymentHelper')
const { log } = require('console')

module.exports = {
    placeOrder : async ( req, res ) => {
        try {
            const { user } = req.session
            const products =  await cartHelper.totalCartPrice( user )
            const { paymentMethod, addressId, walletAmount } = req.body
            const productCount = await cartHelper.updateQuantity( user )
            if( productCount){
                //If product is not available when we are at checkout
                req.session.productCount-=productCount
            res.json({outofStock:true})
            }else{
            let walletBalance
            if( walletAmount ){
                walletBalance = Number( walletAmount )
            }
            const productItems = products[0].items
            //Inserting individual product details
            const cartProducts = productItems.map( ( items ) => ({
                productId : items.productId,
                quantity : items.quantity,
                price : ( items.totalPrice )
            }))
            const cart = await cartSchema.findOne({ userId : user })
            const totalAmount = await cartHelper.totalCartPrice( user )
            let  discounted={}
            if( cart && cart.coupon && totalAmount && totalAmount.length > 0 ) {
                discounted = await couponHelper.discountPrice( cart.coupon, totalAmount[0].total )
                await couponSchema.updateOne({ _id : cart.coupon},{
                    $push : {
                        users : user
                    }
                })
            }
            let discountAmount=0
            if(discounted.discountAmount>0){
                console.log('hai');
             discountAmount=discounted.discountAmount
            }
            const totalPrice = discounted && discounted.discountedTotal ? discounted.discountedTotal : totalAmount[0].total
            let walletUsed, amountPayable
            if( walletAmount ) {
                if( totalPrice > walletBalance ) {
                    amountPayable = totalPrice - walletBalance
                    walletUsed = walletBalance
                } else if( walletBalance > totalPrice ) {
                    amountPayable = 0
                    walletUsed = totalPrice
                }
            } else {
                amountPayable = totalPrice
            }
            const generatedID = Math.floor(100000 + Math.random() * 900000);
            let existingOrder = await orderSchema.findOne({ orderId: generatedID });
    
            // Loop until a unique order ID is generated
            while (existingOrder) {
                generatedID = Math.floor(100000 + Math.random() * 900000);
                existingOrder = orderSchema.findOne({ orderId: generatedID });
            }
    
            // Use the generated unique orderId for the new order
            const orderId = `ORD${generatedID}`;
            
            // paymentMethod === 'COD' ? orderStatus = 'Confirmed' : orderStatus = 'Pending';
            // if( amountPayable === 0) { orderStatus = 'Confirmed' }
            if (paymentMethod === 'COD' || amountPayable === 0) {
                orderStatus = 'Confirmed';
            } else if (paymentMethod === 'razorpay') {
                orderStatus = 'Confirmed'; // Update this line to set status to 'Confirmed' for Razorpay
            }
            const order = new orderSchema({
                userId : user,
                orderId:orderId,
                products : cartProducts,
                totalPrice : totalPrice,
                paymentMethod : paymentMethod,
                orderStatus : orderStatus,
                address : addressId,
                walletUsed : walletUsed,
                amountPayable : amountPayable,
                discounted:discountAmount
            })
            const ordered= await order.save()
            // Decreasing quantity
            for( const items of cartProducts ){
                const { productId, quantity } = items
                await productSchema.updateOne({_id : productId},
                    { $inc : { quantity :  -quantity  }})
                } 
            // Deleting cart
            await cartSchema.deleteOne({ userId : user })
            req.session.productCount = 0
            if(  paymentMethod === 'COD' || amountPayable === 0 ){
                // COD
                    if( walletAmount ) {
                        await userSchema.updateOne({ _id : user }, {
                            $inc : {
                                wallet : -walletUsed
                            },
                            $push : {
                                walletHistory : {
                                    date : Date.now(),
                                    amount : -walletUsed,
                                    message : 'Used for purachse'
                                }
                            }
                        })
                    }
                    return res.json({ success : true})
            }
             else if( paymentMethod === 'razorpay'){
                // Razorpay 
                const payment = await paymentHelper.razorpayPayment( ordered._id, amountPayable )
                res.json({ payment : payment , success : false  })
            }
        }
        } catch ( error ) {
            res.redirect('/500')
        }
    },
    //Invoice
    getConfirmOrder:async(req,res)=>{
        try{
            const {user}=req.session
            await cartHelper.totalCartPrice(user)
            const orders=await orderSchema.find({userId:user}).sort({date:-1}).limit(1) .populate({
                path: 'products.productId',
                populate: {
                  path: 'brand',
                },
              }).populate('address')
            
            if(orders.orderStatus=='Pending'){
                await orderSchema.updateOne({_id:orders._id},{
                    $set:{
                        orderStatus:'Confirmed'
                    }
                })
            }
            
            const lastOrder=await orderSchema.find({userId:user}).sort({date:-1}).limit(1).populate('address').populate({
                path: 'products.productId',
                populate: {
                  path: 'brand',
                },
              })
            res.render('shop/confirm-order',{
                order:lastOrder,
                products:lastOrder[0].products,
            })
        }catch(error){
            res.redirect('/500')
            
        }
    },

    getOrder : async(req,res) =>{
        try{
            const {user} = req.session
            const orders = await orderSchema.find({userId : user}).sort({date : -1}).populate('address').populate({
                path : 'products.productId',
                populate : {
                    path : 'brand'
                }
            })
            const userDetails = await userSchema.findOne({_id : user})
            res.render('user/orders',{
                orders : orders,
                user : userDetails,
                now : new Date()
            })
        }catch(error){
            console.log(error);
        }
    },


    userOrderProducts : async(req,res) =>{
        try{
            const {id} = req.params
            const order = await orderSchema.findOne({_id : id}).populate('address').populate('address').populate({
                path : 'products.productId',
                populate :{
                    path : 'brand' 
                }
            })

            res.render('user/order-products',{
                order : order,
                products : order.products
            })
        }catch(error){
            console.log(error);
        }
    },

    cancelOrder : async(req,res) =>{
        try{
            const {orderId,status} = req.body
            const {user} = req.session
            const order = await orderSchema.findOne({_id:orderId})
            for(let products of order.products){
                await productSchema.updateOne({_id:products.productId},{$inc:{quantity:products.quantity}})
            }
            if(order.orderStatus !=='pending' && order.paymentMethod==='COD'){
                if(order.walletUsed && order.walletUsed>0){
                    await userSchema.updateOne({_id:user},{
                        $inc:{
                            wallet:order.walletUsed
                        },
                        $push:{
                            walletHistory:{
                                date:Date.now(),
                                amount:order.walletUsed,
                                message:"Deposited while cancelled order"
                            }
                        }
                    })
                }
            }
            await orderSchema.findOneAndUpdate({_id:orderId},{$set:{orderStatus:status}})
            const newStatus=await orderSchema.findOne({_id:orderId})
            res.status(200).json({success:true,status:newStatus.orderStatus})
        }catch(error){
            console.log(error);
        }
    },
    getreturnOrder : async(req,res) =>{
        const orderId=req.params.id
    console.log(orderId)
    res.render('shop/return',{orderId:orderId})
    },

    returnOrder:async(req,res)=>{
        const orderId=req.query.orderId
        const {user}=req.session
        const reason=req.body.returnReason
        const message=req.body.message
        const order=await orderSchema.findOne({_id:orderId})
        if(reason === 'Other'){
            for(let products of order.products){
                await productSchema.updateOne({_id:products.productId},{
                    $inc:{
                        quantity: products.quantity
                    }
                })
            }
        }
        await orderSchema.updateOne({_id:orderId},{
            $set:{
                orderStatus:'Returned',ReturnReason:message
            }
        })
        await userSchema.updateOne({_id:user},{
            $inc:{
                wallet:order.totalPrice
            },
            $push:{
                walletHistory:{
                    date:new Date(),
                    amount:order.totalPrice,
                    message:"Deposit on return"
                }
            }
        },)
        res.redirect('/user/orders')
        
       },



    getAdminOrderList : async(req,res) =>{
        try{
            const {sortData , sortOrder} = req.query
            let page = Number(req.query.page)
            if(isNaN(page) || page < 1){
                page = 1
            }
            const sort = {}
            if(sortData) {
                if(sortOrder === "Ascending"){
                    sort[sortData] = 1
                }else{
                    sort[sortData] = -1
                }
            }else{
                sort['date'] = -1
            }

            const ordersCount = await orderSchema.find().count()
            const orders = await orderSchema.find().sort(sort)
            .skip((page - 1)*paginationHelper.ORDER_PER_PAGE)
            .populate('userId')
            .populate('products.productId')
            .populate('address')

            res.render('admin/orders',{
                orders : orders,
                currentPage: page,
                hasNextPage: page * paginationHelper.ORDER_PER_PAGE < ordersCount,
                hasPrevPage: page > 1,
                nextPage: page + 1,
                prevPage: page - 1,
                lastPage: Math.ceil(ordersCount / paginationHelper.ORDER_PER_PAGE),
                // search: search,
                sortData: sortData,
                sortOrder: sortOrder,
            })
        }catch(error){
            console.log(error);
        }
    },
    orderDetails : async(req,res) =>{
        try{
            const {id} = req.params
            const order = await orderSchema.findOne({_id:id})
            .populate('products.productId')
            .populate('address')
            .populate({
                path : 'products.productId',
                populate : {
                    path : 'brand'
                }
            })

            res.render('admin/order-products',{
                order : order ,
                 products : order.products,
                 admin : true
            })
        }catch(error){
            console.log(error);
        }
    },
    changeOrderStatus : async(req,res) =>{
        try{
            const {status,orderId} = req.body
            if(status === 'Cancelled'){
                // if the order is cancelled 
                const order = await orderSchema.findOne({_id : orderId})
                for(let products of order.products){
                    await productSchema.updateOne({_id : products.productId},{$inc : {quantity : products.quantity}})

                }
                await orderSchema.findOneAndUpdate({_id : orderId},{$set : {orderStatus : status}})
            }else {
                await orderSchema.findOneAndUpdate({_id : orderId},{$set : {orderStatus : status}})
            }

            const newStatus = await orderSchema.findOne({_id : orderId})
            res.status(200).json({success : true , status : newStatus.orderStatus})
        }catch(error){
            console.log(error);
        }
    },
    getSalesReport: async (req, res) => {
    try {
        const { from, to, seeAll, sortData, sortOrder } = req.query;
        const orders = await orderSchema.find();
        const overallSalesCount = orders.length;

        let overallOrderAmount = 0;
        //let overallDiscount = 0;
        //let overallCouponDeduction = 0;

        for (const order of orders) {
            overallOrderAmount += order.totalPrice;
            //overallDiscount += order.discount || 0; // Ensure discount is always a number
            //overallCouponDeduction += order.couponDeduction || 0; // Ensure couponDeduction is always a number
        }
        let page = Number(req.query.page);
        if (isNaN(page) || page < 1) {
            page = 1;
        }
        const conditions = {};
        if (from && to) {
            conditions.date = {
                $gte: from,
                $lte: to
            };
        } else if (from) {
            conditions.date = {
                $gte: from
            };
        } else if (to) {
            conditions.date = {
                $lte: to
            };
        }

        const sort = {};
        if (sortData) {
            if (sortOrder === "Ascending") {
                sort[sortData] = sortData === "totalPrice" ? 1 : sortOrder;

            } else if (sortOrder === "Descending") {
                sort[sortData] = -1;
            }
        } else {
            sort['date'] = sortOrder === "Ascending" ? 1 : -1;
        }

        const orderCount = await orderSchema.countDocuments();
        const limit = seeAll === "seeAll" ? orderCount : paginationHelper.SALES_PER_PAGE;
        const filteredOrders = await orderSchema.find(conditions)
            .sort(sort)
            .skip((page - 1) * paginationHelper.ORDER_PER_PAGE.limit)
            .limit(limit);

        res.render('admin/sales-report', {
            admin: true,
            orders: filteredOrders,
            from: from,
            to: to,
            seeAll: seeAll,
            currentPage: page,
            hasNextPage: page * paginationHelper.SALES_PER_PAGE < orderCount,
            hasPrevPage: page > 1,
            nextPage: page + 1,
            prevPage: page - 1,
            lastPage: Math.ceil(orderCount / paginationHelper.SALES_PER_PAGE),
            sortData: sortData,
            sortOrder: sortOrder,
            overallSalesCount: overallSalesCount,
            overallOrderAmount: overallOrderAmount,
            //overallDiscount: overallDiscount,
            //overallCouponDeduction : overallCouponDeduction
        });
    } catch (error) {
        console.log(error);
    }
}
}