const config = require('../../utils/const.js')
const request = require('../../utils/request.js')
const app = getApp()

Page({
  data: {
    child_id: 0,
    cate_id: 0,
    loadStatus: 'loading',
    current_uid: 0,
  },
  onLoad: function (options) {
    this.setData({
      child_id: options.child_id,
      cate_id: options.cate_id,
      current_uid: app.globalData.userInfoServerId
    });
    this.loadItems();
  },
  bindTapRelaod: function(e) {
    this.loadItems();
  },
  loadItems: function() {
    var that = this;
    that.setData({  loadStatus: 'loading' })
    request.request({
      url: config.API_URL + '/jobs?cate_id=' + that.data.cate_id + '&child_id=' + that.data.child_id,
      data: 'get',
      header: {},
      method: 'GET',
      dataType: 'json',
      responseType: 'json',
      success: function(res) {
        for (var i = 0; i < res.data.length; i++) {
          res.data[i].open = false;
          res.data[i].signuped = false;
        }
        that.setData({
          items: res.data.data,
          loadStatus: 'loaded'
        })
      },
      fail: function(res) {
        that.setData({
          loadStatus: 'failed'
        });
      },
      complete: function(res) {},
    })
  },
  expandItem: function(e) {
    var index = e.currentTarget.dataset.index;
    var param = {};
    param['items[' + index + '].open'] = true;
    this.setData(param)
  },
  collapseItem: function (e) {
    var index = e.currentTarget.dataset.index;
    var param = {};
    param['items[' + index + '].open'] = false;
    this.setData(param)
  },
  signIteUpm: function (e) {
    var id = e.currentTarget.dataset.id;
    wx.showLoading({ title: '正在提交，请稍后', })
    request.request({
      url: config.API_URL + '/signup-job/' + id,
      method: 'post',
      success: function (res) {
        if (res.data.success) {
          var index = e.currentTarget.dataset.index;
          var param = {};
          param['items[' + index + '].signuped'] = true;
          this.setData(param)

          wx.hideLoading();
          wx.showToast({ title: '报名成功' })
        }
        else wx.showToast({ title: res.data.message, icon: 'none' })
      },
      fail: function (res) {
        wx.hideLoading();
        wx.showToast({ title: '报名失败，请稍后重试', icon: 'none' })
      },
    })
  },
})