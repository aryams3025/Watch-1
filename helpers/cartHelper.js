const cartSchema = require('../model/cartModel');
const orderSchema = require('../model/orderModel')
const mongoose = require('mongoose');
async function calculateOrderedQuantity(productId) {
    try {
        // Fetch orders where the product ID matches and sum up the quantities
        const orders = await orderSchema.find({ productId: productId });
        let totalOrderedQuantity = 0;
        orders.forEach(order => {
            totalOrderedQuantity += order.quantity;
        });
        return totalOrderedQuantity;
    } catch (error) {
        console.log(error);
        return 0; // Return 0 in case of an error
    }
}
async function calculateTotalDiscountAmount() {
    try {
        const orders = await orderSchema.find({}); // Fetch all orders
        let totalDiscountAmount = 0;

        // Iterate through each order and sum up the discounted amount
        orders.forEach(order => {
            totalDiscountAmount += order.discount;
        });

        console.log('Total overall discount amount:', totalDiscountAmount);
        return totalDiscountAmount;
    } catch (error) {
        console.error('Error calculating total discount amount:', error);
        throw error;
    }
}

// Call the function to calculate the total overall discount amount
calculateTotalDiscountAmount();
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
    },
    calculateOrderedQuantity: calculateOrderedQuantity

};