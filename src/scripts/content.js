import { SCROLL_TO_MAP } from '../common/constants'
import { debounce, getExistKey, getStorage } from '../common/utils'

class ContentScript {
  constructor() {
    this.initMessageListener()
  }
  initScrollFn() {
    window.onscroll = debounce(() => {
      getStorage(SCROLL_TO_MAP).then((currMap = {}) => {
        const existKey = getExistKey(currMap, window.location.href)
        if (!existKey) return
        currMap[existKey].top = window.scrollY
        this.updateStorage(currMap)
      })
    }, 600)
  }
  updateStorage(next) {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [SCROLL_TO_MAP]: next }).then(() => {
        resolve()
      })
    })
  }
  updateLogo() {
    chrome.runtime.sendMessage({
      type: 'updateLogo',
    })
  }
  initMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'add') {
        const { validUrl } = message.data
        getStorage(SCROLL_TO_MAP).then((currMap = {}) => {
          currMap[validUrl] = {
            url: window.location.href,
            top: window.scrollY,
          }
          this.initScrollFn()
          this.updateStorage(currMap).then(() => {
            this.updateLogo()
            sendResponse(true)
          })
        })
      }
      if (message.type === 'delete') {
        getStorage(SCROLL_TO_MAP).then((currMap = {}) => {
          delete currMap[message.data.validUrl]
          window.onscroll = null
          this.updateStorage(currMap).then(() => {
            this.updateLogo()
            sendResponse(true)
          })
        })
      }
      if (message.type === 'getLocation') {
        sendResponse(window.location)
      }
      if (message.type === 'urlChange') {
        getStorage(SCROLL_TO_MAP).then((currMap = {}) => {
          const existKey = getExistKey(currMap, window.location.href)
          if (existKey) {
            const storageData = currMap[existKey]
            const currUrl = window.location.href
            switch (true) {
              case existKey === currUrl && storageData.url === currUrl:
                window.scrollTo({
                  top: storageData.top,
                  behavior: 'smooth',
                })
                this.initScrollFn()
                break
              case existKey === currUrl && storageData.url !== currUrl:
                window.location.replace(storageData.url)
                break
              case existKey !== currUrl && storageData.url !== currUrl:
                currMap[existKey].url = currUrl
                this.updateStorage(currMap)
                break
              default:
                break
            }
          } else {
            window.onscroll = null
          }
          sendResponse(true)
        })
      }
      return true
    })
  }
}
// eslint-disable-next-line no-new
new ContentScript()
