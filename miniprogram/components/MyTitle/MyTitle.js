// components/MyTitle/MyTitle.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    searchContent: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    searchInput: function (e) {
      this.setData({
        searchContent: e.detail.value
      })
    },
    search: function(e) {
      if(this.data.searchContent == '') wx.showToast({ title: '请输入您要搜索的信息哦', icon: 'none' })
      else wx.navigateTo({ url: '../jobs/jobs?type=search&search_keyword=' + this.data.searchContent })
    },
  }
})
