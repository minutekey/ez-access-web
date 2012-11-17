// If not initialized
if(localStorage.ezHighlightColor === undefined) {
	localStorage.ezHighlightColor = "#0000FF";
}

// SETTINGS STORAGE
chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse) {
		if (request.localstorage == "ezNavigate") {
			sendResponse({ezNavigate: localStorage.ezNavigate});
		} else if(request.localstorage == "ezHighlightColor") {
			sendResponse({ezHighlightColor: localStorage.ezHighlightColor});
		} else if(request.tts !== undefined) {
			chrome.tts.speak(request.tts);
		} else if(request.ezShow == "true") {
			chrome.pageAction.show(sender.tab.id);
		} else {
			sendResponse({}); // snub them.
		}
});