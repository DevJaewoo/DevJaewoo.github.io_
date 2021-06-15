// https://img.youtube.com/vi/[ID]/
// maxresdefault.jpg
// maxres1.jpg
// maxres2.jpg
// maxres3.jpg

var imgType = ["/maxresdefault.jpg", "/maxres1.jpg", "/maxres2.jpg", "/maxres3.jpg"];
var imgIndex = 0;
var currentImg;

function updateImage(refreshAll = false) {
    var img = $(".category-item img");
    var elementTop;
    var elementBottom;
    var viewportTop;
    var viewportBottom;
    var isInViewport;

    var currentElement;

    currentImg = imgType[imgIndex];
    imgIndex = (imgIndex + 1) % 4;
    
    for(var i=0; i<$(img).length; i++)
    {
        currentElement = $(img).eq(i);

        elementTop = currentElement.offset().top;
        elementBottom = elementTop + currentElement.outerHeight();

        viewportTop = $(window).scrollTop();
        viewportBottom = viewportTop + $(window).height();

        isInViewport = elementBottom > viewportTop && elementTop < viewportBottom;

        if(isInViewport == false && refreshAll == false) continue;
        
        currentElement.attr("src", "https://img.youtube.com/vi/" + currentElement.attr("vid") + currentImg);
    }
}

updateImage(true);
setInterval(updateImage, 2000);


$(".category-info").on("click", function() {
    $(this).parent().toggleClass("hide");
    if($(this).parent().hasClass("hide")) {
        $(this).parent().css("height", "40px");
    }
    else {
        $(this).parent().css("height", "265px");
    }
});

$(".category-move.left").on("click", function() {
    var list = $(this).siblings(".category-list");

    var left = parseInt(list.css("left"));
    left += (left <= -400) ? 400 : -left;

    list.animate({left: (left + "px")});
});

$(".category-move.right").on("click", function() {
    var container = $(this).parent();
    var list = $(this).siblings(".category-list");

    var left = parseInt(list.css("left"));
    var len = list.width() - container.width() + left;

    if(len <= 0) return;

    console.log("C: " + container.width() + " L: " + list.width());
    console.log("Left: " + left + ", Len: " + len);

    left -= (len >= 400) ? 400 : len;
    list.animate({left: (left + "px")});
});

$("nav .menu-item").on("click", function () {
	var anchor = $(this).attr("dest");
	$("html, body").animate({scrollTop: $("#" + anchor).offset().top}, 500);
});

$(".item-info .button").on("click", function() {
    console.log("https://www.youtube.com/watch?v=" + $(this).parent().siblings("img").attr("vid"));
    window.open("https://www.youtube.com/watch?v=" + $(this).parent().siblings("img").attr("vid"));
});


var category = ["adventure", "action", "rpg", "roguelike", "survive", "defense", 
                "multiplay", "sandbox", "strategy", "puzzle", "rhythm", "other"];

$(window).on("scroll", function () {
	var pos = $(window).scrollTop();
	var pos2 = pos + 300;

    if(pos >= $("#adventure").offset().top) {
        $("#menu").addClass("fixed");
    }
    else {
        $("#menu").removeClass("fixed");
    }

	// Link Highlighting
    for(var i=0; i<category.length; i++) {
        if(pos2 >= $("#" + category[i]).offset().top) {
            highlightLink(category[i]);
        }
    }
});

$(window).on("resize", function() {
	$(".category-list").css("left", "0px");
});

function highlightLink(anchor) {
    console.log("highlight " + anchor);
    $("nav .active").css("color", "#333333");
    $("nav .active").removeClass("active");

    var element = $("nav").find("[dest='" + anchor + "']");
	var color = $("#" + anchor + " .category-info").css("background-color");

    element.addClass("active");
    element.css("color", color);
}