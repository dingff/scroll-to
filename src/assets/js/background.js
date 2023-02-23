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
      resolve(res[SCROLL_TO_MAP] || {})
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
const updateLogoByTabId = (tabId) => {
  getStorage().then((dataMap) => {
    getTabUrl(tabId).then((url) => {
      chrome.action.setIcon({ path: dataMap[url] ? '../imgs/logo.png': '../imgs/logo_gray.png' })
    })
  })
}
chrome.tabs.onActivated.addListener((e) => {
  updateLogoByTabId(e.tabId)
})
chrome.tabs.onUpdated.addListener(debounce((tabId) => {
  updateLogoByTabId(tabId)
  chrome.tabs.sendMessage(tabId, {
    type: 'urlChange',
  }).catch(() => {})
}))
const updateLogoForCurrTab = () => {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, (tabs) => {
    const tabId = tabs[0].id
    updateLogoByTabId(tabId)
  })
}
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId !== -1) {
    updateLogoForCurrTab()
  }
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'updateLogo') {
    updateLogoForCurrTab()
    sendResponse(true)
  }
})