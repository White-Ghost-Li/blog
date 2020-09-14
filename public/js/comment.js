var prepage = 5;
var pages=0;
var page=1;
var comments=[];

$('#messageBtn').on('click', function () {
    $.ajax({
        type: 'post',
        url: '/api/comment/post',
        data:{
            contentID:$('#contentId').val(),
            comment:$('#messageContent').val()
        },
        success: function (responseData) {
            $('#messageContent').val('');
            comments=responseData.data.comments.reverse();
            renderComment();
        }
    });
});
$.ajax({
    url: '/api/comment',
    data:{
        contentID:$('#contentId').val()
    },
    dataType:'json',
    success: function (responseData) {
        comments=responseData.data.reverse();
        renderComment();
    }
});
$('.pager').delegate('a','click', function () {
    if($(this).parent().hasClass('previous')){
        page--;
    }else{
        page++;
    }
    renderComment();
});
//显示评论函数
function renderComment(){
    $('#messageCount').html(comments.length);
    pages=Math.max(Math.ceil(comments.length / prepage),1);
    var start=Math.max(0,(page-1)*prepage);
    var end=Math.min(start+prepage,comments.length);
    var $lis=$('.pager li');
    $lis.eq(1).html(page+"/"+pages);
    if(page<=1){
        page=1;
        $lis.eq(0).html('<span>没有上一页了</span>');
    }else{
        $lis.eq(0).html('<a href="javascript:;">上一页</a>');
    }
    if(page>=pages){
        page=pages;
        $lis.eq(2).html('<span>没有下一页了</span>');
    }else{
        $lis.eq(2).html('<a href="javascript:;">下一页</a>');
    }
    if(comments.length==0){
        $('.messageList').html('<div class="messageBox"><p>暂时换没有评论</p></div>');
    }else{
        var html = '';
        for (var i=start; i<end; i++) {
            h= '<div class="messageBox">'+'<p class="name clear"><span class="fl">'+comments[i].username+'</span><span class="fr">'+ formatDate(comments[i].postTime) +'</span></p><p>'+comments[i].comment+'</p>'+'</div>';
            html =html+h;
        }
    $('.messageList').html(html);
    }
}
function formatDate(d){
    var date1=new Date(d);
    return date1.getFullYear()+'年'+(date1.getMonth()+1)+'月'+date1.getDate()+'日'+date1.getHours()+'：'+date1.getMinutes()+'：'+date1.getSeconds();
}