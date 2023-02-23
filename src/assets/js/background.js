const SCROLL_TO_MAP = 'SCROLL_TO_MAP'
const debounce = (fn, delay = 500) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}
const changeIconByTabId = (tabId) => {
  chrome.tabs.get(tabId, (tab) => {
    chrome.storage.sync.get([SCROLL_TO_MAP]).then((res) => {
      const dataMap = res[SCROLL_TO_MAP]
      chrome.action.setIcon({ path: dataMap[tab.url] ? '../imgs/logo.png': '../imgs/logo_gray.png' })
    })
  })
}
chrome.tabs.onActivated.addListener((e) => {
  changeIconByTabId(e.tabId)
})
chrome.tabs.onUpdated.addListener(debounce((tabId) => {
  console.log('onUpdated', tabId);
  changeIconByTabId(tabId)
}))