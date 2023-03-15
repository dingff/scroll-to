import { Switch } from 'antd'
import { useEffect, useState } from 'react'
import { useUpdateEffect } from 'ahooks'
import { SCROLL_TO_MAP } from '@/common/constants'
import coolIcon from '@/assets/imgs/popup/cool.png'
import laughIcon from '@/assets/imgs/popup/laugh.png'
import errorIcon from '@/assets/imgs/popup/error.png'
import { getExistKey, getStorage } from '@/common/utils'
import styles from './index.less'

declare let chrome: any

export default function Popup() {
  const [location, setLocation] = useState<any>(null) // window.location
  const [checked, setChecked] = useState<boolean>()
  const [notSupport, setNotSupport] = useState<boolean>(false)
  const [validUrl, setValidUrl] = useState('')
  const callContentAdd = () => {
    return new Promise((resolve) => {
      chrome.tabs.query({
        active: true,
        currentWindow: true,
      }, (tabs: any) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'add',
          data: {
            validUrl,
          },
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
        currentWindow: true,
      }, (tabs: any) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'delete',
          data: {
            validUrl,
          },
        }).then((res: boolean) => {
          resolve(res)
        }).catch(() => {})
      })
    })
  }
  const updateData = () => {
    getStorage(SCROLL_TO_MAP).then((res: any = {}) => {
      const existKey = getExistKey(res, location.href)
      setValidUrl(existKey || `${location.origin}${location.pathname}`)
      setChecked(!!existKey)
    })
  }
  const getLocation = () => {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({
        active: true,
        currentWindow: true,
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
  useUpdateEffect(() => {
    updateData()
  }, [location])
  useEffect(() => {
    getLocation().then((res: any) => {
      setLocation(res)
    }).catch(() => {
      setNotSupport(true)
    })
  }, [])
  return (
    <div className={styles.container}>
      {checked !== undefined && (
        <>
          <div className={styles.url}>{validUrl}</div>
          <Switch className={styles.switch} checked={checked} onChange={handleSwitchChange}></Switch>
          {checked ? (
            <div className={styles.info}>
              <img src={laughIcon} alt=""></img>
              报告，已经记在小本本上了～
            </div>
          ) : (
            <div className={styles.info}>
              <img src={coolIcon} alt=""></img>
              要记住阅读进度吗？
            </div>
          )}
        </>
      )}
      {notSupport && (
        <>
          <img style={{ width: 50 }} src={errorIcon} alt=""></img>
          <div style={{ marginTop: 6 }}>
            这个页面不行～
          </div>
        </>
      )}
    </div>
  )
}
