const User = require("../models/userModel")
const Token = require("../models/tokenModel")

let userService={}

/** 
 * query to find single user.
 */
userService.findAUser = async (criteria)=>{
    return  await User.findOne(criteria).lean();
}

/** 
 * query to find user by id.
 */
userService.findUserById = async (id)=>{
    return  await User.findById(id).lean();

}

/**
 * query to find token with user id
 */
userService.findTokenForUser = async (criteria)=>{
    return await Token.findOne(criteria).lean();
}

/**
 * query to update user with id.
 */
userService.updateUserById = async (id,update,options)=>{
    return await  User.findByIdAndUpdate(id,update,options)
}

/**
 * query to update user.
 */
userService.updateUser = async (criteria,update,options)=>{
    return await User.updateOne(criteria,update,options)
}

/**
 * query to get last message 
 */
userService.lastMessage = async (socket_id) =>{
    return  await User.aggregate([
        {
            $lookup:{
            from:"message",
            let :{sid:socket_id},
            as:"mssgOutput",
            pipeline:[
                {
                    $match:{
                        $expr:{ $or:
                                    [{$eq:['$senderId','$$sid']},{$eq:['$reciverId','$$sid']}]
                            }
                        }
                    },{
                        $addFields:{
                            conversationWith:{
                                $cond:{
                                    if : {$eq:['$senderId','$$sid']},
                                    then:'$reciverId',
                                    else:'$senderId'
                                    }
                                },
                                lastMessage:{
                                    Mssg:"$content",
                                    Date:"$createdAt"
                                    }
                            }
                        },{$sort:{'createdAt':-1}},
                        {$group:{_id:'$conversationWith',msg:{$first:'$$ROOT'}}},
                        {$project:{'_id':0,'msg.reciverId':0,'msg.content':0,'msg.createdAt':0}}
                ]   
        } 
         },{$project:{'_id':0,'name':0,'email':0,'__v':0,'password':0,'photo':0}},
         {$unwind:'$mssgOutput'},
         {$replaceRoot:{newRoot:'$mssgOutput.msg'}}
         ])
}

module.exports = userService;
