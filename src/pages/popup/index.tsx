import { Switch } from 'antd'
import { useEffect, useRef, useState } from 'react'
import coolIcon from '@/assets/imgs/popup/cool.png'
import laughIcon from '@/assets/imgs/popup/laugh.png'
import errorIcon from '@/assets/imgs/popup/error.png'
import styles from './index.less'

declare var chrome: any

export default function Popup() {
  const SCROLL_TO_MAP = 'SCROLL_TO_MAP'
  const locationRef = useRef<any>(null) // window.location
  const [checked, setChecked] = useState<boolean>()
  const [notSupport, setNotSupport] = useState<boolean>(false)

  const callContentAdd = () => {
    return new Promise((resolve) => {
      chrome.tabs.query({
        active: true,
        currentWindow: true
      }, (tabs: any) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'add',
        }).then((res: boolean) => {
          resolve(res)
        }).catch(() => {})
      })
    })
  }
  const callContentDelete = () => {
    return new Promise((resolve) => {
      chrome.tabs.query({
        active: true,
        currentWindow: true
      }, (tabs: any) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'delete',
        }).then((res: boolean) => {
          resolve(res)
        }).catch(() => {})
      })
    })
  }
  // 获取当前存储的数据
  const getStorage = () => {
    return new Promise((resolve) => {
      chrome.storage.sync.get([SCROLL_TO_MAP]).then((res: any) => {
        resolve(res[SCROLL_TO_MAP] || {})
      })
    })
  }
  const updateData = () => {
    getStorage().then((res: any) => {
      setChecked(!!res[locationRef.current.href])
    })
  }
  const getLocation = () => {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({
        active: true,
        currentWindow: true
      }, (tabs: any) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'getLocation',
        }).then((res:any) => {
          resolve(res)
        }).catch(() => {
          reject()
        })
      })
    })
  }
  const handleSwitchChange = (open: boolean) => {
    if (open) {
      callContentAdd().then(() => {
        updateData()
      })
    } else {
      callContentDelete().then(() => {
        updateData()
      })
    }
  }
  useEffect(() => {
    getLocation().then((res: any) => {
      locationRef.current = res
      updateData()
    }).catch(() => {
      setNotSupport(true)
    })
  }, [])
  return (
    <div className={styles.container}>
      {checked !== undefined && (
        <>
          <Switch className={styles.switch} checked={checked} onChange={handleSwitchChange}></Switch>
          {checked ? (
            <div className={styles.info}>
              <img src={laughIcon}></img>
              报告，已经记在小本本上了～
            </div>
          ) : (
            <div className={styles.info}>
              <img src={coolIcon}></img>
              要记住阅读进度吗？
            </div>
          )}
        </>
      )}
      {notSupport && (
        <>
          <img style={{ width: 50 }} src={errorIcon}></img>
          <div style={{ marginTop: 6 }}>
            这个页面不行～
          </div>
        </>
      )}
    </div>
  )
}
