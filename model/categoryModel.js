const { default: mongoose } = require('mongoose')
const moongose = require('mongoose')

const Schema = mongoose.Schema

const categorySchema = Schema({
    category : {
        type : String,
        required : true 
    },
    status : {
        type : Boolean,
        default : true
    },
    offer : {
        type : mongoose .Schema.Types.ObjectId,
        ref : 'offer'
    }
})

module.exports = mongoose.model('category',categorySchema)