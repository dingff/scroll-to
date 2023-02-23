class ContentScript {
  SCROLL_TO_MAP = 'SCROLL_TO_MAP'
  currMap = {}
  constructor() {
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
      chrome.storage.sync.set({ [this.SCROLL_TO_MAP]: next }).then(() => {
        resolve()
        // console.log(`${this.SCROLL_TO_MAP}`, this.currMap)
      })
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
          sendResponse(true)
        })
      }
      if (message.type === 'delete') {
        delete this.currMap[window.location.href]
        window.onscroll = null
        this.updateStorage(this.currMap).then(() => {
          sendResponse(true)
        })
      }
      if (message.type === 'getLocation') {
        sendResponse(window.location)
      }
      return true
    })
  }
  scrollTo(top) {
    window.scrollTo({
      top,
      behavior: "smooth"
    })
  }
  getStorage() {
    return new Promise((resolve) => {
      chrome.storage.sync.get([this.SCROLL_TO_MAP]).then((res) => {
        resolve(res[this.SCROLL_TO_MAP] || {})
      })
    })
  }
}
new ContentScript()