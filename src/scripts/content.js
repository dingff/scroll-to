import { SCROLL_TO_MAP } from '../common/constants'
import { debounce, getExistKey, getStorage } from '../common/utils'

class ContentScript {
  existKey = ''
  constructor() {
    this.initMessageListener()
  }
  initScrollFn() {
    window.onscroll = debounce(() => {
      getStorage(SCROLL_TO_MAP).then((currMap = {}) => {
        if (!this.existKey || this.existKey !== getExistKey(currMap, window.location.href)) return
        currMap[this.existKey].top = window.scrollY
        this.updateStorage(currMap)
      })
    }, 1000)
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
        console.log('urlChange')
        getStorage(SCROLL_TO_MAP).then((currMap = {}) => {
          this.existKey = getExistKey(currMap, window.location.href)
          if (this.existKey) {
            const current = currMap[this.existKey]
            if (this.existKey === window.location.href && current.url === window.location.href) {
              window.scrollTo({
                top: current.top,
                behavior: 'smooth',
              })
              this.initScrollFn()
            }
            if (this.existKey === window.location.href && current.url !== window.location.href) {
              window.location.replace(current.url)
            }
            if (this.existKey !== window.location.href && current.url !== window.location.href) {
              currMap[this.existKey].url = window.location.href
              this.updateStorage(currMap)
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
