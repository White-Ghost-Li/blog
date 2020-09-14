var express=require('express');
var router=express.Router();
var user=require('../models/User');
var content=require('../models/Content');
var responseData;
router.use( function(req,res,next){
    responseData={
        code: 0,
        message: ''
    };
    next();
});
router.post('/user/register',function(req,res,next){
    var username=req.body.username;
    var password=req.body.password;
    var repassword=req.body.repassword;
    if(username==''){
        responseData.code=1;
        responseData.message='账号不能为空';
        res.json(responseData);
        return;
    }
    if(password==''){
        responseData.code=2;
        responseData.message='密码不能为空';
        res.json(responseData);
        return;
    }
    if(repassword!=password){
        responseData.code=3;
        responseData.message='两次密码不一致';
        res.json(responseData);
        return;
    }
    user.findOne({
        username:username
    }).then(function(userInfo){
        if(userInfo){
            responseData.code=4;
            responseData.message='用户名已经注册';
            res.json(responseData);
            return;
        }
        var use=new user({
            username:username,
            password:password
        });
        return use.save();
    }).then(function(newUserInfo){
        if(newUserInfo) {
            req.cookies.set('userInfo',JSON.stringify({
                _id: newUserInfo._id,
                username: newUserInfo.username
            }));
            responseData.message = '注册成功！';
            res.json(responseData);
        }
    });
});
router.use('/user/login',function(req,res){
    var username=req.body.username;
    var password=req.body.password;
    if(username==''||password==''){
        responseData.code=1;
        responseData.message='用户名或密码不能为空';
        res.json(responseData);
        return;
    }
    user.findOne({
        username: username,
        password: password
    }).then(function(userInfo){
        if(!userInfo){
            responseData.code=2;
            responseData.message='用户名或密码错误！';
            res.json(responseData);
            return;
        }
        responseData.message='登陆成功';
        responseData.userInfo={
            _id:userInfo._id,
            username: userInfo.username,
            isAdmin: userInfo.isAdmin
        };
        req.cookies.set('userInfo',JSON.stringify({
            _id:userInfo._id,
            username: userInfo.username,
            isAdmin: userInfo.isAdmin
        }));
        res.json(responseData);
        return;
    });
});
router.get('/user/logout',function(req,res){
   req.cookies.set('userInfo',null);
    res.json(responseData);
});
//评论
router.get('/comment',function (req, res) {
    var contentID= req.query.contentID || '';
    content.findOne({
        _id:contentID
    }).then(function (content) {
        if(content){
            responseData.data=content.comments;
            res.json(responseData);
        }
    });
});
router.post('/comment/post', function (req, res) {
    var contentID=req.body.contentID||'';
    var postData={
        username: req.userInfo.username,
        postTime: new Date(),
        comment: req.body.comment
    };
    console.log(postData.postTime);
    content.findOne({
        _id: contentID
    }).then(function (content) {
        if(!content){
           res.render('admin/error',{
               userInfo:req.userInfo,
               message:'操作失误，评论失败！'
           });
           return Promise.reject();
        }else if(postData.comment==''){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'评论内容不能为空！'
            });
            return Promise.reject();
        }
        content.comments.push(postData);
        return content.save();
    }).then(function (newContent) {
        responseData.message='评论成功';
        responseData.data=newContent;
        res.json(responseData);
    });
});
module.exports=router;