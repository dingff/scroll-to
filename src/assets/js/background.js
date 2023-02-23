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
const getStorage = () => {
  return new Promise((resolve) => {
    chrome.storage.sync.get([SCROLL_TO_MAP]).then((res) => {
      resolve(res[SCROLL_TO_MAP])
    })
  })
}
const getTabUrl = (tabId) => {
  return new Promise((resolve) => {
    chrome.tabs.get(tabId, (tab) => {
      resolve(tab.url)
    })
  })
}
const changeIconByTabId = (tabId) => {
  getStorage().then((dataMap) => {
    getTabUrl(tabId).then((url) => {
      chrome.action.setIcon({ path: dataMap[url] ? '../imgs/logo.png': '../imgs/logo_gray.png' })
    })
  })
}
chrome.tabs.onActivated.addListener((e) => {
  changeIconByTabId(e.tabId)
})
chrome.tabs.onUpdated.addListener(debounce((tabId) => {
  changeIconByTabId(tabId)
  chrome.tabs.sendMessage(tabId, {
    type: 'urlChange',
  })
}))
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId !== -1) {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, (tabs) => {
      const tabId = tabs[0].id
      changeIconByTabId(tabId)
    })
  }
})