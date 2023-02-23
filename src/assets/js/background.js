const SCROLL_TO_MAP = 'SCROLL_TO_MAP'
chrome.tabs.onActivated.addListener((e) => {
  chrome.tabs.get(e.tabId, (tab) => {
    chrome.storage.sync.get([SCROLL_TO_MAP]).then((res) => {
      const dataMap = res[SCROLL_TO_MAP]
      chrome.action.setIcon({ path: dataMap[tab.url] ? '../imgs/logo.png': '../imgs/logo_gray.png' })
    })
  })
})
