const userSchema = require('../model/userModels')
const paginationHelper=require('../helpers/paginationHelper')
const { contains } = require('jquery')

module.exports = {
    usersList : async(req,res)=>{
        try {
            const { search, sortData, sortOrder } = req.query;
        
            let page = Number(req.query.page);
            if (isNaN(page) || page < 1) {
                page = 1;
            }
        
            const condition = { isAdmin: 0 };
        
            const sort = {};
            if (sortData) {
                if (sortOrder === "Ascending") {
                    sort[sortData] = 1;
                } else {
                    sort[sortData] = -1;
                }
            }
        
            if (search) {
                condition.$or = [
                    { firstName: { $regex: search, $options: "i" } },
                    { lastName: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                    { mobile: { $regex: search, $options: "i" } },
                ];
            }
        
            const userCount = await userSchema.countDocuments(condition);
            const userList = await userSchema.find(condition)
                .sort(sort)
                .skip((page - 1) * paginationHelper.USERS_PER_PAGE)
                .limit(paginationHelper.USERS_PER_PAGE);
        
            res.render('admin/userList', {
                userList: userList,
                admin: req.session.admin,
                currentPage: page,
                hasNextPage: page * paginationHelper.USERS_PER_PAGE < userCount,
                hasPrevPage: page > 1,
                nextPage: page + 1,
                prevPage: page - 1,
                lastPage: Math.ceil(userCount / paginationHelper.USERS_PER_PAGE),
                search: search,
                sortData: sortData,
                sortOrder: sortOrder
            })    

        }catch(error){
            console.log(error);
        }
    },
    blockUser: async (req, res) => {
        try {
            const userId = req.params.id;
            const userData = await userSchema.findByIdAndUpdate(userId);
            await userData.updateOne({ $set: { isBlocked: true } });
            res.redirect('/admin/userList'); 
        } catch (error) {
            console.log(error); 
        }
    },
    unblockUser : async(req,res) =>{
        try{
            const userId = req.params.id;
            const userData = await userSchema.findById(userId);
            await userData.updateOne({ $set: { isBlocked: false } });
            res.redirect('/admin/userList');
        }catch(error){
            console.log(error);
        }
    }
    
    
}