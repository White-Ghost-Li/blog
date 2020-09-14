/**
 * Created by Administrator on 2019/7/26.
 */
var mongoose=require('mongoose');
var usersSchema=require('../schemas/users');

module.exports=mongoose.model('User',usersSchema);