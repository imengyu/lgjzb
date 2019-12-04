module.exports = {
  login,
  checkServerLogged,
  doServerLogin
}

const config = require('./const.js')
const request = require('./request.js')

function setServerLoggedData(data) {
  getApp().globalData.userInfoServerId = data;
}
function checkServerLogged(callback) {
  request.request({
    url: config.API_URL + '/login',
    method: 'get',
    success(res) {
      if (res.data.success) {
        setServerLoggedData(res.data.data);
        callback(true);
      }
      else { 
        callback(false)
      }
    },
    fail() { 
      setServerLoggedData(null);
      callback(false) 
    }
  })
}
function doServerLogin(code) {
  request.request({
    url: config.API_URL + '/login',
    method: 'post',
    dataType: 'json',
    responseType: 'json',
    data: {
      code: code,
    },
    success(res) {
      if (res.data.success) setServerLoggedData(res.data.data);
      else wx.showToast({ title: res.data.message, icon: 'none' })
    },
    fail() { wx.showToast({ title: '无法连接服务器', icon: 'none' }) }
  })
}
function login() {
  wx.login({
    success(res) {
      if (res.code) doServerLogin(res.code); else {
        wx.showToast({
          title: '登录失败！' + res.errMsg,
          icon: 'error',
          duration: 2000
        })
      }
    }
  })
}