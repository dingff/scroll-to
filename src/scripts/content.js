import { SCROLL_TO_MAP } from '../common/constants'

class ContentScript {
  constructor() {
    this.currMap = {}
    window.onload = () => {
      this.getStorage().then((v) => {
        this.currMap = v
        if (this.currMap[window.location.href]) {
          this.scrollTo(this.currMap[window.location.href].top)
          this.initScrollFn()
        }
      })
    }
    this.initMessageListener()
  }
  initScrollFn() {
    if (this.currMap[window.location.href]) {
      window.onscroll = this.debounce(() => {
        if (!this.currMap[window.location.href]) return
        this.currMap[window.location.href].top = window.scrollY
        this.updateStorage(this.currMap)
      })
    }
  }
  debounce(fn, delay = 200) {
    let timer
    return (...args) => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        fn(...args)
      }, delay)
    }
  }
  updateStorage(next) {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [SCROLL_TO_MAP]: next }).then(() => {
        resolve()
        // console.log(`${SCROLL_TO_MAP}`, this.currMap)
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
        this.currMap[window.location.href] = {
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
        delete this.currMap[window.location.href]
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
        if (this.currMap[window.location.href]) {
          this.scrollTo(this.currMap[window.location.href].top)
          this.initScrollFn()
        } else {
          window.onscroll = null
        }
        sendResponse(true)
      }
      return true
    })
  }
  scrollTo(top) {
    window.scrollTo({
      top,
      behavior: 'smooth',
    })
  }
  getStorage() {
    return new Promise((resolve) => {
      chrome.storage.sync.get([SCROLL_TO_MAP]).then((res) => {
        resolve(res[SCROLL_TO_MAP] || {})
      })
    })
  }
}
// eslint-disable-next-line no-new
new ContentScript()
