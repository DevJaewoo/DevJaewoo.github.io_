$(document).ready(function () {
	
	var pos = $(window).scrollTop();

	if(pos == 0) {
		$("#screen-block").addClass("hide");
	}
	else {
		$("#screen-block").css({"display": "none"});
	}

	var bars = document.getElementsByClassName("bar");

	for (var i = 0; i < bars.length; i++) {
		var max = parseFloat(bars[i].style.maxWidth) / 100;
		bars[i].style.transitionDelay = i * 0.2 + "s";
		bars[i].style.transitionDuration = (1 / max) + "s";
	}
});


$(".backup-image").on("error", function () {
	$(this).attr("src", "./images/file.png");
});

$(".page-link").on("click", function () {
	var anchor = $(this).attr("dest");
	$("html, body").animate(
		{ scrollTop: $("#" + anchor).offset().top }, 500
	);
});

$(".projects-type").on("click", function () {

	$(".projects-type.active").removeClass("active");
	$(this).addClass("active");

	var type = $(this)[0].classList[2];
	var all = $(".projects-item");
	var on = $(".projects-item." + type);
	var off = all.not(on);

	console.log("type: " + type + " on: " + on.length + " off: " + off.length);

	on.removeClass("hide");
	off.addClass("hide");
});

$(window).on("scroll", function () {
	var pos = $(window).scrollTop();
	var pos2 = pos + 300;

	if (pos >= $("#about").offset().top) {
		$("nav").addClass("fixed");
	}
	else {
		$("nav").removeClass("fixed");
	}

	if (pos >= $("#about").offset().top - 700) {
		$(".skills").addClass("animated");
	}

	// Link Highlighting
	if (pos2 >= $("#home").offset().top) {
		highlightLink("home");
	}

	if (pos2 >= $("#about").offset().top) {
		highlightLink("about");
	}

	if (pos2 >= $("#strength").offset().top) {
		highlightLink("strength");
	}

	if (pos2 >= $("#projects").offset().top) {
		highlightLink("projects");
	}

	if (pos2 >= $("#contact").offset().top
		|| pos2 >= $(document).height() - $(window).height() - 70) {
		highlightLink("contact");
	}
});

function highlightLink(anchor) {
	$("nav .active").removeClass("active");
	$("nav").find("[dest='" + anchor + "']").addClass("active");
}