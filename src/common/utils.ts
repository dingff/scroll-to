declare const chrome: any

export const debounce = (fn: any, delay = 200) => {
  let timer: any
  return (...args: any[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}
// 获取当前存储的数据
export const getStorage = (key: string) => {
  return new Promise((resolve) => {
    chrome.storage.sync.get([key]).then((res: any) => {
      resolve(res[key])
    })
  })
}
export const getExistKey = (obj: any, href: string) => {
  let existKey = ''
  Object.keys(obj).forEach((item) => {
    if (href.includes(item) && item.length > existKey.length) {
      existKey = item
    }
  })
  return existKey
}
