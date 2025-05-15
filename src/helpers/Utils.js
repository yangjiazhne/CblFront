// @ts-nocheck
import { message, Modal } from 'antd'
import store from '@/redux/store'
import { ERROR_MESSAGES } from '@/constants'

export const DUMMY_UID = '123'
export const DUMMY_TOKEN = '11111'

export const timeConverter = unixTimestamp => {
  if (!unixTimestamp) return ''
  const aaa = new Date(unixTimestamp * 1000)
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  const year = aaa.getFullYear()
  const month = months[aaa.getMonth()]
  const date = aaa.getDate()
  const time = date + ' ' + month + ' ' + year
  return time
}

export const timeConverter2 = unixTimestamp => {
  if (!unixTimestamp) return ''
  const aaa = new Date(unixTimestamp * 1000)
  const year = aaa.getFullYear()
  const month = aaa.getMonth() + 1
  const day = aaa.getDay()
  const time =
    year.toString().padStart(4, '0') +
    '-' +
    month.toString().padStart(2, '0') +
    '-' +
    day.toString().padStart(2, '0')
  return time
}

export const isEmail = str => {
  const reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
  return reg.test(str)
}

export const getImageSize = imgSrc => {

  return new Promise((resolve, reject) => {
    const image = document.createElement('img')
    image.src = imgSrc
    image.onload = async () => {
      // 获取图片的原始宽度
      // @ts-ignore
      const naturalWidth = image.naturalWidth
      // @ts-ignore
      const naturalHeight = image.naturalHeight
      resolve({
        naturalWidth,
        naturalHeight,
      })
    }
  })
}

export function hexToRgba(hex, opacity) {
  if (!hex) return ''
  return (
    'rgba(' +
    parseInt('0x' + hex.slice(1, 3)) +
    ',' +
    parseInt('0x' + hex.slice(3, 5)) +
    ',' +
    parseInt('0x' + hex.slice(5, 7)) +
    ',' +
    opacity +
    ')'
  )
}

export const getStrWithLen = (str, len) => {
  if (str.length < len) return str
  else return str.slice(0, len) + '...'
}

export const logOut = history => {
  store.dispatch({
    type: 'UPDATE_USER_LOGIN',
    payload: false,
  })

  history.replace('/entryPage')
  location.reload()
  window.sessionStorage.clear()
}

/**
 * 复制单行内容到粘贴板
 * content : 需要复制的内容
 * message : 复制完后的提示，不传则默认提示"复制成功"
 */
export function copyToClip(content, msg) {
  var aux = document.createElement('input')
  aux.setAttribute('value', content)
  document.body.appendChild(aux)
  aux.select()
  document.execCommand('copy')
  document.body.removeChild(aux)
  message.success(msg || '复制成功')
}

window.timer = null
export function debounce(fn, delay) {
  if (window.timer) {
    clearTimeout(window.timer) //保证只开启一个定时器
  }
  window.timer = setTimeout(function () {
    fn() //延迟delay，执行函数
  }, delay)
}

export function arraysEqualIgnoreOrder(a, b) {
  if (a.length !== b.length) {
    return false
  }
  const sortedA = Array.from(new Set(a)).sort()
  const sortedB = Array.from(new Set(b)).sort()
  for (let i = 0; i < sortedA.length; i++) {
    if (sortedA[i] !== sortedB[i]) {
      return false
    }
  }
  return true
}

// 异常处理
export const handleError = (errorCode) => {
  // 用户token过期
  if (errorCode === 705) {
    Modal.error({
      title: '提示',
      content: '您的登录已过期，请重新登陆',
      onOk: () => {
        store.dispatch({
          type: 'UPDATE_USER_LOGIN',
          payload: false,
        })
      
        window.location.href = "/#/entryPage";
        // location.reload()
        window.sessionStorage.clear()
      }
    })
    return;
  }

  // 对其他错误代码设置错误消息
  message.error(ERROR_MESSAGES[errorCode] || "发生未知错误")
};


export const handleUnauthorized = () => {
  Modal.error({
    title: '提示',
    content: '您的登录已过期，请重新登陆',
    onOk: () => {
      store.dispatch({
        type: 'UPDATE_USER_LOGIN',
        payload: false,
      })
    
      window.location.href = "/#/entryPage";
      // location.reload()
      window.sessionStorage.clear()
    }
  })
}