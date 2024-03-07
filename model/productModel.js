const mongoose = require('mongoose')

const Schema = mongoose.Schema

const productSchema = Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
        required: true
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'brand',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: Array,
        required: true
    },
    status: {
        type: Boolean,
        default: true
    },
    offer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'offer'
    },
    review: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        rating: {
            type: Number
        },
        comment: {
            type: String
        }
    }]
});
const Product = mongoose.model('product', productSchema);

module.exports = Product;