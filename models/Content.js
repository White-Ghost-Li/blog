/**
 * Created by Administrator on 2019/7/26.
 */
var mongoose=require('mongoose');
var contentSchema=require('../schemas/content');

module.exports=mongoose.model('Content',contentSchema);