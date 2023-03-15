import { SCROLL_TO_MAP } from '../common/constants'
import { debounce, getExistKey, getStorage } from '../common/utils'

const getTabUrl = (tabId) => {
  return new Promise((resolve, reject) => {
    chrome.tabs.get(tabId).then((tab) => {
      resolve(tab.url)
    }).catch(() => {
      reject()
    })
  })
}
const updateLogoByTabId = (tabId) => {
  getStorage(SCROLL_TO_MAP).then((dataMap = {}) => {
    getTabUrl(tabId).then((url) => {
      const existKey = getExistKey(dataMap, url)
      chrome.action.setIcon({ path: dataMap[existKey] ? './logo/logo.png' : './logo/logo_gray.png' })
    }).catch(() => {})
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
}, 600))
const updateLogoForCurrTab = () => {
  chrome.tabs.query({
    active: true,
    currentWindow: true,
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
