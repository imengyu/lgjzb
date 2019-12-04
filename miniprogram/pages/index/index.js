const app = getApp()
const config = require('../../utils/const.js')
const request = require('../../utils/request.js')
const utils = require('../../utils/utils.js')

Page({
  data: {

    //所有一级、二级菜单的数据
    cateItems: [
      {
        cate_id: 1,
        cate_name: "教师",
        ishaveChild: true,
        children:
          [
            {
              child_id: 1,
              name: '小学家教',
              image: "/images/xxjj.jpg",
            },
            {
              child_id: 2,
              name: '初中家教',
              image: "/images/czjj.png"
            },
            {
              child_id: 3,
              name: '小学辅导班',
              image: "/images/xxfdb.png"
            },
            {
              child_id: 4,
              name: '初中辅导班',
              image: "/images/czfdb.jpg"
            }
          ]
      },
      {
        cate_id: 2,
        cate_name: "服务员",
        ishaveChild: true,
        children:
          [
            {
              child_id: 1,
              name: '餐厅服务',
              image: "/images/ctfw.jpg"
            },
            {
              child_id: 2,
              name: '酒店服务',
              image: "/images/jdfw.jpg"
            },

            
          ]
      },
      {
        cate_id: 3,
        cate_name: "零时工",
        ishaveChild: true,
        children:
          [
            {
              child_id: 1,
              name: '发传单',
              image: "/images/fcd.png"
            },
            {
              child_id: 2,
              name: '销售',
              image: "/images/tx.jpg"
            },
            {
              child_id: 3,
              name: '其他',
              image: "/images/qt.png"
            },
          ]
      },
      {
        cate_id: 4,
        cate_name: "其他",
        ishaveChild: true,
        children: [
          {
            child_id: 1,
            name: '客服',
            image: "/images/kf.jpg"
          },
          {
            child_id: 2,
            name: '教练',
            image: "/images/jl.png"
          },

        ]
      }
    ],

    curNav: 1,
    curIndex: 0,
    curTab: 0,

    //用户数据
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),

    sendCurrentIndex: 1,
    sendCurrentSubIndex: 1,

    //个人信息
    isEditingMyInfo: false,
    myInfo: null,
    sendFormDataname: '',
    sendFormDataaddress: '',
    sendFormDataprice: '',
    sendFormDatatime: '',
    sendFormDataphone: '',
    sendFormDatatreatment: '',
    
  },
  //事件处理函数  
  clickTab: function (e) {
    var that = this;
    var tar = e.currentTarget.dataset.current;
    if (tar == 1) this.loadMySendInfo();
    if (this.data.curTab == tar) return false;
    else {
      that.setData({
        curTab: tar
      })
    }
  },
  bindSendPickerChange: function (e) {
    this.setData({
      sendCurrentIndex: e.detail.value,
      sendCurrentSubIndex: 0
    })
  }, 
  bindSendSubPickerChange: function (e) {
    this.setData({
      sendCurrentSubIndex: e.detail.value
    })
  },
  switchRightTab: function (e) {
    // 获取item项的id，和数组的下标值  
    let id = e.target.dataset.id,
      index = parseInt(e.target.dataset.index);
    // 把点击到的某一项，设为当前index  
    this.setData({
      curNav: id,
      curIndex: index
    })
  },
  loadMyInfo: function (e) {
    var that = this;
    request.request({
      url: config.API_URL + '/myinfo',
      method: 'get',
      success: function (res) {
        if (res.data.success){ 
          that.setData({ 
            myInfo: res.data.data,
            sendFormDataname: '',
            sendFormDataaddress: res.data.data.address,
            sendFormDataprice: '',
            sendFormDatatime: '',
            sendFormDataphone: res.data.data.phone,
            sendFormDatatreatment: '',
          })
        }
        else wx.showToast({ title: '无法加载您的个人信息：' + res.data.message, icon: 'none' })
      },
      fail: function (res) {
        wx.showToast({ title: '无法加载您的个人信息，请稍后重试', icon: 'none' })
      },
    })
  },
  loadMySendInfo: function (e) {
    if (this.data.sendFormDataaddress == '' && this.data.sendFormDataphone == '')
      this.setData({
        sendFormDataaddress: this.data.myInfo.address,
        sendFormDataphone: this.data.myInfo.phone,
      })
  },
  myInfoFormSubmi: function (data) {
    var that = this;
    request.request({
      url: config.API_URL + '/myinfo',
      method: 'post',
      data: data.detail.value,
      success: function (res) {
        if (res.data.success) {
          wx.showToast({ title: '修改成功' })
          that.setData({ isEditingMyInfo: false })
          that.loadMyInfo();
        }
        else wx.showToast({ title: '修改失败：' + res.data.message, icon: 'none' })
      },
      fail: function (res) {
        wx.showToast({ title: '修改失败，请稍后重试', icon: 'none' })
      },
    })
  },
  formSendSubmit: function (data) {
    var that = this;
    var keys = Object.keys(data.detail.value);
    for (var i = 0; i < keys.length;i++){
      if (data.detail.value[keys[i]] == ''){
        console.log(data.detail.value[keys[i]] + ' key : ' + keys[i]);
        wx.showToast({ title: '请完善您的信息再发布哦', icon: 'none' })
        return;
      }
    }

    data.detail.value.parent_cate_id = this.data.sendCurrentIndex + 1;
    data.detail.value.parent_child_id = this.data.sendCurrentSubIndex + 1;

    wx.showLoading({ title: '正在提交，请稍后', })
    request.request({
      url: config.API_URL + '/jobs',
      method: 'post',
      data: data.detail.value,
      success: function (res) {
        if (res.data.success) {
          that.setData({
            sendFormDataname: '',
            sendFormDataprice: '',
            sendFormDatatime: '',
            sendFormDatatreatment: '',
          })
          wx.hideLoading();
          wx.showToast({ title: '发布成功' })
        }
        else wx.showToast({ title: res.data.message, icon: 'none' })
      },
      fail: function (res) {
        wx.hideLoading();
        wx.showToast({ title: '发布失败，请稍后重试', icon: 'none' })
      },
    })
  },
  editMyInfo: function (e) { this.setData({ isEditingMyInfo: true }) },
  unsaveEditMyInfo: function (e) {
    this.setData({ isEditingMyInfo: false })
    this.loadMyInfo();
  },


  //加载
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.loadMyInfo();
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.loadMyInfo();
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.loadMyInfo();
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
})
