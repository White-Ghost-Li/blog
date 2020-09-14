var express=require('express');
var router=express.Router();
var User=require('../models/User');
var Category=require('../models/Category');
var Content=require('../models/Content');

router.use(function(req,res,next){
    if(!req.userInfo.isAdmin){
        res.send('对不起，您没有权限进入管理页面');
        return;
    }
    next();
});
//首页（路由）
router.get('/',function(req,res,next){
    res.render('admin/index',{
        userInfo:req.userInfo
    });
});
//用户管理（路由）
router.get('/user',function(req,res){
    /*
     * 从数据库中读取所有的用户数据
     * limit(Number) : 限制获取的数据条数
     * skip(2) : 忽略数据的条数
     * 每页显示2条
     * 1 : 1-2 skip:0 -> (当前页-1) * limit
     * 2 : 3-4 skip:2
     * */
    var page=Number(req.query.page||1);
    var limit=7;
    var pages=0;
    var mudi;
    User.count().then(function(count){
        pages=Math.ceil(count/limit);
        page=Math.min(page,pages);
        page=Math.max(page,1);
        var skip=(page-1)*limit;
        User.find().limit(limit).skip(skip).then(function(users){
            res.render('admin/user_index',{
                userInfo: req.userInfo,
                users:users,
                mudi:'user',
                count:count,
                page:page,
                pages:pages,
                limit:limit
            });
        });
    });
});
router.get('/category',function(req,res){
    var page=Number(req.query.page||1);
    var limit=5;
    var pages=0;
    var mudi;
    Category.count().then(function(count){
        pages=Math.ceil(count/limit);
        page=Math.min(page,pages);
        page=Math.max(page,1);
        var skip=(page-1)*limit;
        Category.find().sort({_id: -1}).limit(limit).skip(skip).then(function(cates){
            res.render('admin/category_index',{
                userInfo: req.userInfo,
                cates: cates,
                mudi:'category',
                count:count,
                page:page,
                pages:pages,
                limit:limit
            });
        });
    });
});
router.get('/categoryAdd',function(req,res){
    res.render('admin/category_add', {
        userInfo: req.userInfo
    });
});
router.post('/categoryAdd',function(req,res){
    var name=req.body.name||'';
    if(name===''){
        res.render('admin/error',{
            userInfo: req.userInfo,
            message:'名称不能为空！'
        });
        return;
    }
    Category.findOne({
        name: name
    }).then(function(category){
        if(category){
                res.render('admin/error',{
                    userInfo: req.userInfo,
                    message: '该分类已经存在！'
                });
                return Promise.reject();
        }else{
            return new Category({
                name: name
            }).save();
        }
    }).then(function(newCategory){
        console.log(newCategory);
            res.render('admin/success',{
                userInfo: req.userInfo,
                message: '分类保存成功',
                url: '/admin/category'
            });
    });
});
router.get('/categoryEdit',function(req,res){
    var id=req.query.id||'';
    Category.findOne({
        _id:id
    }).then(function(category){
        if(!category){
            res.render('admin/error',{
                userInfo: req.userInfo,
                message:'分类信息不存在'
            });
        }else{
            res.render('admin/category_edit',{
                userInfo: req.userInfo,
                category: category
            });
        }
    });
});
router.post('/categoryEdit',function(req,res){
    var name=req.body.name||'';
    var id=req.query.id||'';
    if(name==''){
        res.render('admin/error',{
            userInfo: req.userInfo,
            message:'名称不能为空！'
        });
        return;
    }
    Category.findOne({
        _id:id
    }).then(function(category){
        if(!category){
           res.render('admin/error',{
                userInfo: req.userInfo,
                message: '该分类不存在！'
            });
            return Promise.reject();
        }else{
            if(name==category.name){
                res.render('admin/success',{
                    userInfo: req.userInfo,
                    message: '修改成功！',
                    url: '/admin/category'
                });
                return Promise.reject();
            }else{
                Category.findOne({
                    _id: {$ne: id},
                    name:name
                }).then(function(category){
                    if(category){
                        res.render('admin/error',{
                            userInfo: req.userInfo,
                            message: '数据库中已经存在同名分类！'
                        });
                        return Promise.reject();
                    }else{
                        return Category.update({
                            _id:id
                        },{
                            name:name
                        });
                    }
                });
            }
        }
    }).then(function(newCategory){
        if(newCategory){
            res.render('admin/success',{
                userInfo: req.userInfo,
                message: '分类修改成功',
                url: '/admin/category'
            });
        }
    });
});
router.get('/categoryDelete',function(req,res){
    var id=req.query.id||'';
    Category.findOne({
        _id:id
    }).then(function (category) {
        if (!category) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '该条信息删除失败'
            });
        } else {
            Category.remove({
                _id: id
            }).then(function () {
                res.render('admin/success', {
                    userInfo: req.userInfo,
                    message: '该条信息删除成功',
                    url: '/admin/category'
                });
            });
        }
    });
});
router.get('/content',function(req,res){
    var page=Number(req.query.page||1);
    var limit=5;
    var pages=0;
    var mudi;
    Content.count().then(function(count){
        pages=Math.ceil(count/limit);
        page=Math.min(page,pages);
        page=Math.max(page,1);
        var skip=(page-1)*limit;
        Content.find().limit(limit).skip(skip).populate(['category','user']).then(function(contents){
            res.render('admin/content_index',{
                userInfo: req.userInfo,
                contents: contents,
                mudi:'content',
                count:count,
                page:page,
                pages:pages,
                limit:limit
            });
        });
    });
});
router.get('/contentAdd', function (req,res){
    Category.find().then(function (categories) {
        res.render('admin/content_add',{
            userInfo: req.userInfo,
            categories:categories
        });
    });
});
router.post('/contentAdd', function (req,res) {
    if(req.body.category==''||req.body.title==''){
        res.render('admin/error',{
            userInfo:req.userInfo,
            message:'分类或标题不能为空！'
        });
        return Promise.reject();
    }
    Content.findOne({
        title:req.body.title
    }).then(function (content) {
        if(content){
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '有同名标题内容存在'
            });
            return Promise.reject();
        }else {
            new Content({
                category: req.body.category,
                title: req.body.title,
                user: req.userInfo._id,
                description: req.body.description,
                content: req.body.content
            }).save().then(function (rs) {
                    res.render('admin/success', {
                        userInfo: req.userInfo,
                        message: '内容添加成功',
                        url: '/admin/content'
                    });
            });
        }
    });
});
router.get('/contentEdit', function (req,res) {
    var id=req.query.id||'';
    Category.find().then(function (categories) {
        Content.findOne({
            _id:id
        }).then(function(content){
            if(!content){
                res.render('admin/error',{
                    userInfo: req.userInfo,
                    message:'内容信息不存在'
                });
                return Promise.reject();
            }else{
                res.render('admin/content_edit',{
                    userInfo: req.userInfo,
                    content: content,
                    categories:categories
                });
            }
        });
    });
});
router.post('/contentEdit', function (req,res) {
    var title=req.body.title||'';
    var category=req.body.category||'';
    var id=req.query.id||'';
    if(category==''||title==''){
        res.render('admin/error',{
            userInfo:req.userInfo,
            message:'分类或标题不能为空！'
        });
        return Promise.reject();
    }
    Content.findOne({
        _id:id
    }).then(function(category){
        if(!category){
            res.render('admin/error',{
                userInfo: req.userInfo,
                message: '该内容不存在！'
            });
            return Promise.reject();
        }else{
                Content.findOne({
                    _id: {$ne: id},
                    title:title
                }).then(function(content){
                    if(content){
                        res.render('admin/error',{
                            userInfo: req.userInfo,
                            message: '数据库中已经存在同名标题，请更改标题！'
                        });
                        return Promise.reject();
                    }else{
                        return Content.update({
                            _id:id
                        },{
                            category:req.body.category,
                            title:req.body.title,
                            description:req.body.description,
                            content:req.body.content
                        }).then(function(newContent){
                            if(newContent){
                                res.render('admin/success',{
                                    userInfo: req.userInfo,
                                    message: '分类修改成功',
                                    url: '/admin/content'
                                });
                            }
                        });
                    }
                });
        }
    });
});
router.get('/contentDelete', function (req,res) {
    var id=req.query.id||'';
    Content.findOne({
        _id:id
    }).then(function (content) {
        if(!content){
            res.render('admin/error',{
                userInfo: req.userInfo,
                message: '该条信息删除失败'
            });
            return Promise.reject();
        }else{
            Content.remove({
                _id:id
            }).then(function(){
                res.render('admin/success',{
                    userInfo: req.userInfo,
                    message: '该条信息删除成功',
                    url:'/admin/content'
                });
            });
        }
    });
});
module.exports=router;