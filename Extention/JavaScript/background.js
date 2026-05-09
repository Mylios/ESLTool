

// Listen for requests from the popup
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	
	if(message.action === "read"){
		chrome.storage.local.set({"receipts": message.list});
	}

	if(message.action === "write"){
		chrome.storage.local.get("receipts", (result) => {
		sendResponse(result)	
		});		
	}
       
});