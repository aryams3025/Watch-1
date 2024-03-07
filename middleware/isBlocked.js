const User=require('../model/userModels')
module.exports={
isBlocked : async(req,res,next)=>{
   try {
   if(req.session.user){  
       const user = await User.findById(req.session.user)
       if(!user.isBlocked){
           
           next();
          
       }else{
           req.session.destroy((err) => {
               if (err) {
                   console.log(err);
               } else {
                   res.redirect('/login'); // Redirect to a different route after destroying the session
               }})
       }
   }else{
       next()

   }     
   } catch (error) {
       console.log(error.message);
   }
}
}