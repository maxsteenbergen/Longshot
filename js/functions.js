/////////////////////////////////
//	Initial setup
/////////////////////////////////

var globalShotID = '';
var playerID='';
var commentsShown = false;
var profileShown = false;
var streamPageShown = false;
var currentPage = "main";
var landscapeViewport = false;
var errorCounter = 0;


function init(){
	if (!navigator.standalone) {
		$('body').css("width", $(window).width());
		$('body').css("height", $(window).height());
		$('#promo').css("width", $(window).width());
		$('#promo').css("height", $(window).height());
		$("#promo").css("display", "block");
		$("#container").css("display", "none");
	}
	else{
		$("#promo").css("display", "none");
		$("#container").css("display", "block");
		if($('#container').width() >= $('#container').height()){
			landscapeViewport = true;
		}
		else{
			landscapeViewport = false;	
		}

		var fullurl = document.URL;
		var reloadedShotID = fullurl.substring(fullurl.indexOf('?')+1, fullurl.length);
		getShot(reloadedShotID);
		
		var $element = $("#getShotButton").bind("webkitAnimationEnd", function(){
			this.style.webkitAnimationName = "";
		});

		var $element = $("#shotButtonShadow").bind("webkitAnimationEnd", function(){
			this.style.webkitAnimationName = "";
		});
	
		//Add Swipe listeners
		//$('#shotContainer').swipe({
     	//	swipeLeft: function() {getStreamShots('popular');},
     	//	swipeRight: function() {getStreamShots('everyone');}
		//})



		//Add Shake listener
		if (typeof window.DeviceMotionEvent != 'undefined') {
			// Shake sensitivity (a lower number is more)
			var sensitivity = 25;

			// Position variables
			var x1 = 0, y1 = 0, z1 = 0, x2 = 0, y2 = 0, z2 = 0;

			// Listen to motion events and update the position
			window.addEventListener('devicemotion', function (e) {
				x1 = e.accelerationIncludingGravity.x;
				y1 = e.accelerationIncludingGravity.y;
				z1 = e.accelerationIncludingGravity.z;
			}, false);

			// Periodically check the position and fire
			// if the change is greater than the sensitivity
			setInterval(function () {
				var change = Math.abs(x1-x2+y1-y2+z1-z2);

				if (change > sensitivity) {
					getShot();
				}

			// Update new position
			x2 = x1;
			y2 = y1;
			z2 = z1;
			}, 150);
		}
	}
}

function boo(){
	var reloadURL = "http://maxsteenbergen.com/longshot?"+ globalShotID;  
	switch(window.orientation){  
		case 0: window.location.href= reloadURL;
		break;

		case -90: window.location.href= reloadURL;
		break;  

		case 90: window.location.href= reloadURL;  
		break;  
	}
}

function reloadGetShot(){
	getShot();
}

/////////////////////////////////
//	AJAX Calls
/////////////////////////////////

function getShot(reqShotID){
	//Check for internet connection

	var online = window.navigator.onLine;
	if (!online || errorCounter >= 15){
		$("#noConnectionModal").css("display", "block");
		errorCounter = 0;
		//alert('You are not currently connected to the internet. Please try again later.');
	}
	else{
		$("#shotImage").css("webkitAnimationName", "fadeOut");
		$("#titleAndName").css("webkitAnimationName", "fadeOut");
		$("#noConnectionModal").css("display", "none");
		$("#getShotButton").css("webkitAnimationDuration", "0.5s");
		$("#getShotButton").css("webkitAnimationName", "bounceBall");
		$("#shotButtonShadow").css("webkitAnimationName", "ballShadow");
	
		var shotID = '';
		if (reqShotID == undefined || reqShotID == ''){
			for(i=0;i<6;i++){
				if(i==0){
					var randomnumber=Math.floor(Math.random()*5).toString();	
				}
				else{
					var randomnumber=Math.floor(Math.random()*10).toString();
				}
				shotID = shotID+randomnumber;
			}
		}
		else{
			shotID = reqShotID;
		}

		var generatedShotURL = 'http://api.dribbble.com/shots/' + shotID;
			$.ajax({
			dataType: 'jsonp',
			url: generatedShotURL,
			type: 'GET',
			timeout: 750,
			error: function(){
				reloadGetShot();
				errorCounter++;
			},
			success: function(shot){
			//	$("#getShotButton").css("webkitAnimationDuration", "1.5s");
			//	$("#getShotButton").css("webkitAnimationName", "shootBall");
				errorCounter = 0;
				playerID = shot.player.id;					
				$('#shotImageLink').attr('href', shot.url);
				
				//Set shot's image as background to enable inset shadow
				$('#shotImage').css('background-image', 'url(' + shot.image_url + ')');
				$('#shotImage').css('width', shot.width + 'px');
				$('#shotImage').css('height', shot.height + 'px');
				$('#shotImage').css('margin-top', 90 + ((300 / 2) - (shot.height / 2)) + 'px');
				$('#shotImage').css('margin-left', -(shot.width / 2) + 'px');

				$('#shotTitle').text(shot.title);
				$('#shotPlayer').text(shot.player.name);

				var tweetLink = "https://twitter.com/share?text=Check out this awesome shot by @" + shot.player.twitter_screen_name + " on @dribbble!&url="+shot.short_url;
				$('#tweetButton').attr('href', tweetLink);

				var encodedURL = encodeURIComponent(shot.short_url);
				var fbLikeLink = "http://www.facebook.com/sharer.php?u="+encodedURL;
				$('#fbButton').attr('href', fbLikeLink);

				getShotComments(shotID);
				getPlayerProfile();
				$("#shotImage").css("webkitAnimationName", "fadeIn");
				$("#titleAndName").css("webkitAnimationName", "fadeIn");
			}
		});
		globalShotID = shotID;
	}
}

function getShotComments(shotID){
	var generatedShotURL = 'http://api.dribbble.com/shots/' + shotID + "/comments?per_page=30";
	$.ajax({
		dataType: 'jsonp',
		url: generatedShotURL,
		type: 'GET',
		success: function(shot){
			var html = [];
			$('#toggleShotCommentsButton').text(shot.total);
			if(shot.total == 0){
					html.push('<h4 id="noCommentsNotice">No comments.</h4>');
					$('#shotComments').html(html.join(''));
				}
			else{
				$.each(shot.comments, function (i, comment) {
					//alert(shot.comments.page);
					html.push('<div class="comment">');
						html.push('<a href="' + comment.player.url + '"><img class="commenterAvatar" src="' + comment.player.avatar_url + '"></a>');
						html.push('<h3 class="commenterName">' + comment.player.name + '</h3><br>');
						html.push('<p class="commentBody">' + comment.body + '</p>');
					html.push('</div>');
				});
				$('#shotComments').html(html.join(''));
			}
		}
	});
}


function getPlayerProfile(){
	var playerProfileURL = 'http://api.dribbble.com/players/' + playerID;
	var playersLatestShotsURL = 'http://api.dribbble.com/players/' + playerID + '/shots';
	var html = [];
	$.ajax({
		dataType: 'jsonp',
		url: playerProfileURL,
		type: 'GET',
		success: function(profile){
					html.push('<a href="' + profile.url + '"><img id="playerProfileAvatar" src="' + profile.avatar_url + '"></a>');
					html.push('<h3 id="playerProfileName">' + profile.name + '</h3><br>');
					html.push('<span id="latestShotsSpan">Latest shots:</span>');
			//$('#playerProfile').html(html.join(''));
		}
	});
	$.ajax({
		dataType: 'jsonp',
		url: playersLatestShotsURL,
		type: 'GET',
		success: function(shots){
			html.push('<div id="playerProfileShots">');
			for(i=0;i<=11;i++){
				var shot = shots.shots[i];
				html.push('<img class="shotPreview" onclick="getShot('+shot.id+'); toggleProfile();" src="' + shot.image_url + '">');
			}
			html.push('</div>');
			$('#playerProfile').html(html.join(''));
		}
	}); 
}



function getStreamShots(orderType){
	if(orderType == "popular"){
		$('#streamTitle').html("Popular Shots");
	}
	else{
		$('#streamTitle').html("Latest Shots");
	}

	var html = [];
	var streamShotsURL = 'http://api.dribbble.com/shots/' + orderType + '?per_page=30';
		$.ajax({
		dataType: 'jsonp',
		url: streamShotsURL,
		type: 'GET',
		//timeout: 1000,
		error: function(){
			alert("fail");
			//reloadGetShot();
		},
		success: function(stream){
			var streamCount = 0;
			if (landscapeViewport == true){
				streamCount = 7;
			}
			else{
				streamCount = 8;
			}
			for(i=0;i<=streamCount;i++){
				var shot = stream.shots[i];
				//html.push('<a class="streamLink" href="' + shot.url + '">');
					html.push('<div class="streamShot" onclick="getShot('+shot.id+'); togglePages();" style="background-image: url('+ shot.image_teaser_url +')">');
						html.push('<h3>'+shot.title+'</h3>');
						html.push('<h4>'+shot.player.name+'</h4>');
					html.push('</div>');
				//html.push('</a>');
			}
			$('#shotsStream').html(html.join(''));
		}
	});
	if (!streamPageShown){
		togglePages(orderType);
		currentPage = orderType;
	}
}


/////////////////////////////////
//	Toggles
/////////////////////////////////
function toggleShotComments(){
	//If Portrait
	if($('#container').width() <= 640){
		if( commentsShown == false){
			$("#background_bottom").css("webkitAnimationName", "openCommentsDrawer")
			$("#tweetButton").css("webkitAnimationName", "openCommentsDrawer")
			$("#fbButton").css("webkitAnimationName", "openCommentsDrawer")
			commentsShown = true;
		}
		else{
			$("#background_bottom").css("webkitAnimationName", "closeCommentsDrawer")
			$("#tweetButton").css("webkitAnimationName", "closeCommentsDrawer")
			$("#fbButton").css("webkitAnimationName", "closeCommentsDrawer")
			commentsShown = false;
		}
	}

	//If Landscape
	else{
		if(commentsShown == false){
			$("#imageContainer").css("webkitAnimationName", "scrollToComments");
			commentsShown = true;
		}
		else{
			$("#imageContainer").css("webkitAnimationName", "scrollToShot");
			commentsShown = false;
		}
	}
	
}

function toggleProfile(){
	if(profileShown == false){
		$("#playerProfile").css("webkitAnimationName", "profileOpen");
		profileShown = true;
	}
	else{
		$("#playerProfile").css("webkitAnimationName", "profileClose");
		profileShown = false;
	}
}

function togglePages(nextPage){
	var slideAnimName = "";

	if(streamPageShown == false){
		$("#shotsStreamPage").css("display","block");
		$("#shotsStreamPage").css("webkitAnimationName", "slidePageLeft");
		//$("#shotContainer").css("webkitAnimationName", "slidePageLeft");
		$("#backButton").css("webkitAnimationName", "slideBackButtonIn");
		$("#mainPageControls").css("webkitAnimationName", "slideMainPageControlsOut");
		//$("#getShotButton").css("webkitAnimationName", "fadeOut");
		//$("#shotButtonShadow").css("webkitAnimationName", "fadeOut");
		streamPageShown = true;
	}
	else{
		$("#shotsStreamPage").css("webkitAnimationName", "slidePageRight");
		//$("#shotContainer").css("webkitAnimationName", "slidePageRight");
		$("#backButton").css("webkitAnimationName", "slideBackButtonOut");
		$("#mainPageControls").css("webkitAnimationName", "slideMainPageControlsIn");
		//$("#getShotButton").css("webkitAnimationName", "fadeIn");
		//$("#shotButtonShadow").css("webkitAnimationName", "fadeIn");
		setTimeout(function(){
			$("#shotsStreamPage").css("display","none")
			}, 500);
		streamPageShown = false;
	}
}







/*
function getMultiPageComments(generatedShotURL,amountCommentPages){
	alert("amount of comments pages: " + amountCommentPages);
	var commentsPage = generatedShotURL + '?page=';
	var html = [];
	for(i=1; i<=amountCommentPages;i++){
		alert(commentsPage+i);
		$.ajax({
			dataType: 'jsonp',
			url: commentsPage+i,
			type: 'GET',
			success: function(shot){
				$.each(shot.comments, function (i, comment) {
					html.push('<div class="comment">');
						html.push('<a href="' + comment.player.url + '"><img class="commenterAvatar" src="' + comment.player.avatar_url + '"></a>');
						html.push('<h3 class="commenterName">' + comment.player.name + '</h3><br>');
						html.push('<p class="commentBody">' + comment.body + '</p>');
						alert(comment.body.toString());
					html.push('</div>');
				})
			}
		});
	}
	$('#shotComments').html(html.join(''));
}
*/


/* @timmolendijk hack 

var fetchComments = function(shot, comments, page) {
    comments = comments || [];
    page = page || 1;
    return $.ajax({
        url: 'http://api.dribbble.com/shots/' + shot + '/comments',
        data: { page: page },
        dataType: 'jsonp'
    }).pipe(function(data) {
        [].push.apply(comments, data.comments);
        return (data.page < data.pages) ? fetchComments(shot, comments, data.page + 1) : comments;
    });
};

var renderComments = function(shot) {
    fetchComments(shot).done(function(comments) {
        var html = [];
        $('#shotComments').contents().filter(function() { return this.nodeType === 8; }).each(function() {
            $(this).after(_.template(this.nodeValue, comments));
        });
    });
};


renderComments('389492'); //non-empty list
//renderComments('123416'); //empty list

*/