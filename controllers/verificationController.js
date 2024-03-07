const otpGenerator = require('otp-generator');
const {v4:uuidv4} = require('uuid')
const nodemailer = require('nodemailer')
require('dotenv').config()


const transporter = nodemailer.createTransport({
    service : 'gmail',
    auth : {
        user : process.env.USER_MAIL,
        pass : process.env.PASS
    }
})



//function for generating random otp 
function generatorOtp(){
    try{
        const otp = otpGenerator.generate(6,{
            upperCaseAlphabets : false,
            lowerCaseAlphabets : false ,
            specialChars : false
        })
        return otp
    }catch(error){
        console.log(error);
    }
}

module.exports = {
    sendMail : (email) =>{
        try{
            const otp = generatorOtp()
            transporter.sendMail({
                to : email ,
                from : process.env.USER_MAIL,
                subject : 'OTP verification',
                html:`<h1> Hey ,Your OTP is ${otp}</h1><br>
                <p> Note: The OTP only valid for 1 minute`
            })
            return otp
        }catch(error){
            console.log(error);
        }
    }
   
}