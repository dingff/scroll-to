import { Switch } from 'antd'
import { useEffect, useRef, useState } from 'react'
import coolIcon from '../../assets/imgs/cool.png'
import laughIcon from '../../assets/imgs/laugh.png'
import styles from './index.less'

declare var chrome: any

export default function Index() {
  const SCROLL_TO_MAP = 'SCROLL_TO_MAP'
  const locationRef = useRef<any>(null) // window.location
  const [checked, setChecked] = useState(false)
  const callContentAdd = () => {
    return new Promise((resolve) => {
      chrome.tabs.query({
        active: true,
        currentWindow: true
      }, (tabs: any) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'add',
        }, (res: boolean) => {
          resolve(res)
        })
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
        }, (res: boolean) => {
          resolve(res)
        })
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
    return new Promise((resolve) => {
      chrome.tabs.query({
        active: true,
        currentWindow: true
      }, (tabs: any) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'getLocation',
        }, (res:any) => {
          resolve(res)
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
    })
  }, [])
  return (
    <div className={styles.container}>
      <Switch className={styles.switch} checked={checked} onChange={handleSwitchChange}></Switch>
      {checked ? (
        <div className={styles.info}>
          <img src={laughIcon}></img>
          报告，已经记在小本本上了～
        </div>
      ) : (
        <div className={styles.info}>
          <img src={coolIcon}></img>
          需要记录阅读位置嘛？
        </div>
      )}
    </div>
  )
}
