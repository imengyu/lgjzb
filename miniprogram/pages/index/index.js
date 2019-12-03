const app = getApp()

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

    sendCurrentIndex: 0,
    sendCurrentSubIndex: 0,

    //个人信息
    isEditingMyInfo: false,
    myInfo: {
      phone: '17606701376',
      address: '地址地址地址地址地址地址'
    },
  },
  //事件处理函数  
  clickTab: function (e) {
    var that = this;
    if (this.data.curTab == e.currentTarget.dataset.current) return false;
    else {
      that.setData({
        curTab: e.currentTarget.dataset.current
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
  editMyInfo: function (e) {
    this.setData({ isEditingMyInfo: true })
  },
  saveEditMyInfo: function (e) {


    this.setData({ isEditingMyInfo: false })
  },
  unsaveEditMyInfo: function (e) {
    this.setData({ isEditingMyInfo: false })
  },
  //加载
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
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
