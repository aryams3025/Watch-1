// const cartSchema = require('../model/cartModel')

// const mongoose =  require('mongoose')


// module.exports = {
//     updateQuantity : async(user) => {
//         try{
//             const cartItems = await cartSchema .findOne({userId : user}).populate('items.productId')
//               if(cartItems){
//                 let removeCount = 0; 
//                 for(let items of cartItems.items){
//                     if(items && items.productId.quantity > 0 && items.productId.quantity < items.quantity ){
//                         newQuantity = items.productId.quantity;
//                         await cartSchema.updateOne(
//                             { userId: user, 'items.productId': items.productId._id },
//                             { $set: { 'items.$.quantity': newQuantity } }
//                         );
                        
//                     }else if(items && items.productId.quantity < 1){
//                         await cartSchema.updateOne({ userId: user, 'items.productId': items.productId._id }, { $pull: { items: { productId: items.productId._id } } });
//                         removeCount++;
//                     }
//                 }
//                 return removeCount;
//               }  
        
//         }catch(error){
//             console.log(error);
//         }
//     },
//     totalCartPrice: async (user) => {
//         try {
//             const totalPrice = await cartSchema.aggregate([
//                 // Matching the cart for a specific user
                
//                 { $match: { userId: mongoose.Types.ObjectId(user) } },

//                 // Unwinding the items array
//                 { $unwind: "$items" },
//                 // Looking up product information for each item using lookup
//                 {
//                     $lookup: {
//                         from: "products",
//                         localField: "items.productId",
//                         foreignField: "_id",
//                         as: "product"
//                     }
//                 },
//                 // Unwinding the product array
//                 { $unwind: "$product" },
//                 // Calculating the total price per item
//                 {
//                     $addFields: {
//                         totalPricePerItem: {
//                             $multiply: ["$product.price", "$items.quantity"]
//                         }
//                     }
//                 },
//                 // Grouping the items to calculate total price for the cart
//                 {
//                     $group: {
//                         _id: "$_id",
//                         userId: { $first: "$userId" },
//                         items: {
//                             $push: {
//                                 _id: "$items._id",
//                                 productId: "$items.productId",
//                                 productName: "$product.name",
//                                 quantity: "$items.quantity",
//                                 totalPrice: "$totalPricePerItem"
//                             }
//                         },
//                         total: { $sum: "$totalPricePerItem" }
//                     }
//                 }
//             ]);
//             return totalPrice;
//         } catch (error) {
//             console.log(error);
//         }
//     }
    
// }



const cartSchema = require('../model/cartModel');
const mongoose = require('mongoose');

module.exports = {
    updateQuantity: async (user) => {
        try {
            const cartItems = await cartSchema.findOne({ userId: user }).populate('items.productId');
            if (cartItems) {
                let removeCount = 0;
                for (let items of cartItems.items) {
                    if (items && items.productId.quantity > 0 && items.productId.quantity < items.quantity) {
                        const newQuantity = items.productId.quantity;
                        await cartSchema.updateOne(
                            { userId: user, 'items.productId': items.productId._id },
                            { $set: { 'items.$.quantity': newQuantity } }
                        );
                    } else if (items && items.productId.quantity < 1) {
                        await cartSchema.updateOne({ userId: user, 'items.productId': items.productId._id }, { $pull: { items: { productId: items.productId._id } } });
                        removeCount++;
                    }
                }
                return removeCount;
            }

        } catch (error) {
            console.log(error);
        }
    },
    totalCartPrice: async (user) => {
        try {
            const totalPrice = await cartSchema.aggregate([
                // Matching the cart for a specific user
                { $match: { userId: mongoose.Types.ObjectId.createFromHexString(user) } },
                // Unwinding the items array
                { $unwind: "$items" },
                // Looking up product information for each item using lookup
                {
                    $lookup: {
                        from: "products",
                        localField: "items.productId",
                        foreignField: "_id",
                        as: "product"
                    }
                },
                // Unwinding the product array
                { $unwind: "$product" },
                // Calculating the total price per item
                {
                    $addFields: {
                        totalPricePerItem: {
                            $multiply: ["$product.price", "$items.quantity"]
                        }
                    }
                },
                // Grouping the items to calculate total price for the cart
                {
                    $group: {
                        _id: "$_id",
                        userId: { $first: "$userId" },
                        items: {
                            $push: {
                                _id: "$items._id",
                                productId: "$items.productId",
                                productName: "$product.name",
                                quantity: "$items.quantity",
                                totalPrice: "$totalPricePerItem"
                            }
                        },
                        total: { $sum: "$totalPricePerItem" }
                    }
                }
            ]);
            return totalPrice;
        } catch (error) {
            console.log(error);
        }
    }
};