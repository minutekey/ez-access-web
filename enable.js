var EzCustomColor;
chrome.extension.sendRequest({
	localstorage: "ezHighlightColor"
}, function (response) {
	EzCustomColor = response.ezHighlightColor;
});

chrome.extension.sendRequest({
	localstorage: "ssml"
}, function (response) {
	SSML = response.ssml === "true";
});

var ezSessionDisable = sessionStorage["ezSessionDisable"];

function checkingIfEz() {
	if(ezSessionDisable == "true") {
		chrome.extension.sendRequest({
			ezShow: "true"
		}, function (response) {});
	} else if(document.body.getAttribute('data-ez') !== null) {
		// The regular expression produced a match, so notify the background page.
		load_ez();
		chrome.extension.sendRequest({
			ezShow: "true"
		}, function (response) {});
	} else {
		// No match was found.
		chrome.extension.sendRequest({
			localstorage: "ezNavigate"
		}, function (response) {
			ezNavigate = response.ezNavigate;
			if(ezNavigate == 'all') {
				load_ez();
				chrome.extension.sendRequest({
					ezShow: "true"
				}, function (response) {});
			}
		});
	}
}

setTimeout(function () {
	checkingIfEz();
}, 5);

// Storing whether to disable for this session
chrome.extension.onRequest.addListener(
	function (request, sender, sendResponse) {
		if(request.ezSessionDisable == "true") {
			sessionStorage["ezSessionDisable"] = "true";
			stopEZ();
			sendResponse({});
			window.location.reload();
		} else if(request.ezSessionDisable == "false") {
			sessionStorage["ezSessionDisable"] = "false";
			load_ez();
			sessionStorage.setItem("EZ_Toggle", "1");
			ez_navigateToggle = true;
			sounds[getElementAudio()].feed.play();
			drawSelected(selectElements[currIndex]);
			voice(selectElements[currIndex], 'point');
			sendResponse({});
		} else if(request.ezSessionDisable == "state") {
			var packet = String(sessionStorage["ezSessionDisable"]);
			sendResponse({
				ezSessionState: packet
			});
		} else if(request.ezHighlightDisable == "true") {
			stopEZ();
			sendResponse({});
		} else if(request.ezTtsState == "done") {
			auto_advance_decide();
		} else if(request.ezVolume !== undefined) {
			audioVolume = parseFloat(request.ezVolume);
			sessionStorage.setItem("EZ_Volume", audioVolume);
			set_volume();
			sounds[AUDIO_MOVE].feed.play();
			voice("Volume... " + audioVolume + " percent");
		} else if(request.volume == 'getter') {
			sendResponse({
				volume: audioVolume
			});
		}
	}
);