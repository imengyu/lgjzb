const request = function (obj) {
  let key = 'cookie'
  let cookie = wx.getStorageSync(key);

  if (!('fail' in obj)) {
    obj.fail = function (err) {
    }
  }
  if (!('complete' in obj)) {
    obj.complete = function (res) {
    }
  }

  wx.request({
    url: obj.url,
    data: obj.data,
    method: obj.method,
    header: {
      "Content-Type": "application/json",
      "Cookie": cookie
    },
    dataType: 'json',
    responseType: 'text',
    success: res => {
      if (res.header) {
        if ('Set-Cookie' in res.header) {
          wx.setStorageSync(key, res.header['Set-Cookie']);
        }
        else if ('set-cookie' in res.header) {
          wx.setStorageSync(key, res.header['set-cookie'])
        }
      }
      obj.success(res);
    },
    fail: err => {
      obj.fail(err);
    },
    complete: res => {
      obj.complete(res);
    }
  });
}

module.exports = {
  request: request
}