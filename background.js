chrome.runtime.onInstalled.addListener(() => {
  console.log('THIs is chrome!!!!!!!!!!!!!!!!!!!!!!!');
});

chrome.storage.sync.get(['TOKEN'], function (result) {
  console.log('Value currently is ' + JSON.stringify(result));
});
