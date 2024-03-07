const multer =  require('multer')
const path = require('path')

//initializes a  storage engine for multer
const storage = multer.diskStorage({
    destination:(req,file,callback)=>{
        callback(null,path.join(__dirname , '../public/images/product-images'))
    },
    filename : (req,file, callback) =>{
        // const uniqueName = date.now() + '_' + file.originalName 
        const uniqueName = Date.now() + '_' + file.originalName;

        callback(null, uniqueName)
    }
})


module.exports = multer({storage : storage})

