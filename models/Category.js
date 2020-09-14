/**
 * Created by Administrator on 2019/7/26.
 */
var mongoose=require('mongoose');
var categorySchema=require('../schemas/category');

module.exports=mongoose.model('Category',categorySchema);