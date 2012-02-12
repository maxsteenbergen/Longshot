/////////////////////////////////
//	Core functionality
/////////////////////////////////

var shotID = '';

function init(){
	if (shotID == ''){
		getShot();
		$('#shotComments').hide();

		var $element = $("#getShotButton").bind("webkitAnimationEnd", function(){
		    this.style.webkitAnimationName = "";
		});
	}
}

function reloadGetShot(){
	getShot();
}

function getShot(){
	$("#getShotButton").css("webkitAnimationName", "spinBall");

	shotID = '';
	for(i=0;i<6;i++){
		var randomnumber=Math.floor(Math.random()*10).toString();
		shotID = shotID+randomnumber;
	}

	var generatedShotURL = 'http://api.dribbble.com/shots/' + shotID +'?callback=?';
		$.ajax({
		dataType: 'jsonp',
		url: generatedShotURL,
		type: 'GET',
		error: function(xhr, error){
			alert(xhr, error);
			//reloadGetShot();
		},
		success: function(shot){
			//Fade out all data
			//$('#shotImage').fadeOut(100);
//			$('#shotTitle').hide();
//			$('#shotPlayer').hide();
			
			$('#shotImageLink').attr('href', shot.url);
			
			//Set shot's image as background to enable inset shadow
			$('#shotImage').css('background-image', 'url(' + shot.image_url + ')');
			$('#shotImage').css('width', shot.width + 'px');
			$('#shotImage').css('height', shot.height + 'px');
			$('#shotImage').css('margin-top', 90 + ((300 / 2) - (shot.height / 2)) + 'px');
			$('#shotImage').css('margin-left', -(shot.width / 2) + 'px');

			$('#shotTitle').text(shot.title);
			$('#shotPlayer').text(shot.player.name)

//			//Fade all data back in
//			$('#shotImage').delay(1000).fadeIn(500);
//			$('#shotTitle').delay(1000).fadeIn(750);
//			$('#shotPlayer').delay(3000).fadeIn(1000);
			//getShotComments();
		}
	});
}

function getShotComments(){
	var generatedShotURL = 'http://api.dribbble.com/shots/' + shotID + "/comments";
	$.ajax({
		dataType: 'jsonp',
		url: generatedShotURL,
		type: 'GET',
		success: function(shot){
			var html = [];
			$.each(shot.comments, function (i, comment) {
				html.push('<div class="comment">');
					html.push('<a href="' + comment.player.url + '"><img class="commenterAvatar" src="' + comment.player.avatar_url + '"></a>');
					html.push('<h3 class="commenterName">' + comment.player.name + '</h3><br>');
					html.push('<p class="commentBody">' + comment.body + '</p>');
				html.push('</div>');
			});
			$('#shotComments').html(html.join(''));
			$('#toggleShotCommentsButton').text(shot.comments.length);
		}
	});
}

/////////////////////////////////
//	Usability
/////////////////////////////////
function toggleShotComments(){
	$('#shotComments').slideToggle(250, "linear");
}

