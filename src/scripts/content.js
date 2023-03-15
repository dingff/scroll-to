import { SCROLL_TO_MAP } from '../common/constants'
import { debounce, getExistKey, getStorage } from '../common/utils'

class ContentScript {
  currMap = {}
  existKey = ''
  constructor() {
    window.onload = () => {
      getStorage(SCROLL_TO_MAP).then((v = {}) => {
        this.currMap = v
      })
    }
    this.initMessageListener()
  }
  initScrollFn() {
    window.onscroll = debounce(() => {
      if (!this.existKey || this.existKey !== getExistKey(this.currMap, window.location.href)) return
      this.currMap[this.existKey].top = window.scrollY
      this.updateStorage(this.currMap)
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
        this.currMap[validUrl] = {
          url: window.location.href,
          top: window.scrollY,
        }
        this.initScrollFn()
        this.updateStorage(this.currMap).then(() => {
          this.updateLogo()
          sendResponse(true)
        })
      }
      if (message.type === 'delete') {
        delete this.currMap[message.data.validUrl]
        window.onscroll = null
        this.updateStorage(this.currMap).then(() => {
          this.updateLogo()
          sendResponse(true)
        })
      }
      if (message.type === 'getLocation') {
        sendResponse(window.location)
      }
      if (message.type === 'urlChange') {
        console.log('urlChange')
        this.existKey = getExistKey(this.currMap, window.location.href)
        if (this.existKey) {
          const current = this.currMap[this.existKey]
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
            this.currMap[this.existKey].url = window.location.href
            this.updateStorage(this.currMap)
          }
        } else {
          window.onscroll = null
        }
        sendResponse(true)
      }
      return true
    })
  }
}
// eslint-disable-next-line no-new
new ContentScript()
