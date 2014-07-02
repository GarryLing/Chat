var socket = io.connect(location.origin);
socket.on('connection', function(){
	scope.me = socket.socket.sessionid;
	scope.$digest();
});
socket.on('message', function (data) {
	data.time = new Date(data.time).toLocaleString();
	data.personalMessage = data.text.lastIndexOf(socket.socket.sessionid) != -1;
	scope.messages.push(data);
	var needToScroll = getScrolledDown();
	scope.$digest();
	if (needToScroll && document.hasFocus()) scrollDown();
	if ((!document.hasFocus() || !getScrolledDown()) && !data.info) {
		scope.unread++;
		scope.sound.play();
	}
});
socket.on('updateUsers', function (data) {
	scope.users = data.users;
	scope.$digest();
});
socket.on('history', function (data) {
	if (!data.messages)
		return;
	var i, m;
	for (i in data.messages) {
		m = data.messages[i];
		m.time = new Date(m.time).toLocaleString();
	}
	scope.messages = scope.messages.concat(data.messages);
	scope.$digest();
});

var scope;

function titleBlink () {
	if (document.hasFocus() && getScrolledDown()) {
		scope.unread = 0;
		document.title = 'Chat';
	}
	else if (scope.unread) {
		if (document.title == 'Chat') {
			document.title = scope.unread + ' unread messages';
		}
		else {
			document.title = 'Chat';
		}
	}
}

function getScrolledDown () {
	var el = document.getElementsByClassName('messages_block')[0];
	var elHeight = el.getClientRects()[0].height;
	var top = el.scrollTop;
	var height = el.scrollHeight;
	var topMustBe = height - elHeight;
	//var needScroll = (topMustBe == top);
	return topMustBe == top;
}

function scrollDown () {
	var el = document.getElementsByClassName('messages_block')[0];
	el.scrollTop = el.scrollHeight;
}

setInterval(titleBlink, 1000);

function ChatCtrl ($scope) {
	$scope.users = [];
	$scope.me = '';
	$scope.message = '';
	$scope.messages = [];
	scope = $scope;
	$scope.unread = 0;
	$scope.sound = new Audio();
	$scope.sound.src = 'audio/message.mp3';

	$scope.sayTo = function (user) {
		$scope.message += user + ': ';
		document.getElementsByTagName('input')[0].focus();
	};

	$scope.sendMessage = function () {
		if (!$scope.message)
			return;
		socket.emit('message', {text: $scope.message});
		scrollDown();
		$scope.message = '';
	};
}