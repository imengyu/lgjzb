const config = require('../../utils/const.js')
const request = require('../../utils/request.js')
const app = getApp()

Page({
  data: {
    child_id: 0,
    cate_id: 0,
    loadStatus: 'loading',
    current_uid: 0,
    search_keyword: '',
    type: '',
  },
  onLoad: function (options) {
    if (options.type == 'cate'){
      wx.setNavigationBarTitle({ title: '来个兼职 ' + options.title })
      this.setData({
        type: 'cate',
        child_id: options.child_id,
        cate_id: options.cate_id,
        current_uid: app.globalData.userInfoServerId
      });
    } else if (options.type == 'search') {
      wx.setNavigationBarTitle({ title: '搜索兼职 ' + options.search_keyword })
      this.setData({
        type: 'search',
        search_keyword: options.search_keyword,
        current_uid: app.globalData.userInfoServerId
      });
    }
    this.load();
  },
  bindTapRelaod: function(e) {
    this.load();
  },
  bindTapBack: function (e) {
    wx.navigateBack({})
  },
  load: function () {
    if (this.data.type == 'cate') {
      this.loadItems();
    } else if (this.data.type == 'search') {
      this.loadSearchItems();
    }
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
        if (res.data.data.length > 0) {
          for (var i = 0; i < res.data.data.length; i++) {
            res.data.data[i].open = false;
            res.data.data[i].always_open = false;
            res.data.data[i].signuped = false;
          }
          that.setData({
            items: res.data.data,
            loadStatus: 'loaded'
          })
        } else that.setData({ loadStatus: 'none' })
      },
      fail: function(res) {
        that.setData({
          loadStatus: 'failed'
        });
      },
      complete: function(res) {},
    })
  },
  loadSearchItems: function () {
    var that = this;
    that.setData({ loadStatus: 'loading' })
    request.request({
      url: config.API_URL + '/search-jobs?keyword=' + that.data.search_keyword,
      data: 'get',
      header: {},
      method: 'GET',
      dataType: 'json',
      responseType: 'json',
      success: function (res) {  
        if (res.data.data.length > 0){
          for (var i = 0; i < res.data.data.length; i++) {
            res.data.data[i].always_open = true;
            res.data.data[i].signuped = false;
          }
          that.setData({
            items: res.data.data,
            loadStatus: 'loaded'
          })
        } else that.setData({ loadStatus: 'none' })
      },
      fail: function (res) {
        that.setData({
          loadStatus: 'failed'
        });
      },
      complete: function (res) { },
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