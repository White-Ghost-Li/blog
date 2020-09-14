/**
 * Created by Administrator on 2019/7/26.
 */
var mongoose=require('mongoose');

module.exports=new mongoose.Schema({
    username:String,
    password:String,
    isAdmin:{
        type:Boolean,
        default:false
    }
});