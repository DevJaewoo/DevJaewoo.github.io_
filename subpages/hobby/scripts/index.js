// https://img.youtube.com/vi/[ID]/
// maxresdefault.jpg
// maxres1.jpg
// maxres2.jpg
// maxres3.jpg

var imgType = ["/maxresdefault.jpg", "/maxres1.jpg", "/maxres2.jpg", "/maxres3.jpg"];
var imgIndex = 0;
var currentImg;

$(document).ready(function() {

});

function updateImage() {
    var img = $(".category-item img");
    var elementTop;
    var elementBottom;
    var viewportTop;
    var viewportBottom;
    var isInViewport;

    var currentElement;

    imgIndex = (imgIndex + 1) % 4;
    currentImg = imgType[imgIndex];

    console.log(currentImg);
    
    for(var i=0; i<$(img).length; i++)
    {
        currentElement = $(img).eq(i);

        elementTop = currentElement.offset().top;
        elementBottom = elementTop + currentElement.outerHeight();

        viewportTop = $(window).scrollTop();
        viewportBottom = viewportTop + $(window).height();

        isInViewport = elementBottom > viewportTop && elementTop < viewportBottom;

        if(isInViewport == false) continue;

        console.log(i);
        currentElement.attr("src", "https://img.youtube.com/vi/" + currentElement.attr("vid") + currentImg);
    }
}

updateImage();
setInterval(updateImage, 3000);


$(".category-info").on("click", function() {
    $(this).parent().toggleClass("hide");
    if($(this).parent().hasClass("hide")) {
        $(this).parent().css("height", "40px");
        //$(this).next().slideUp(200);
    }
    else {
        $(this).parent().css("height", "265px");
        //$(this).next().slideDown(200);
    }
});