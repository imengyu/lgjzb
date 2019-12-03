Page({
  data: {
    child_id: 0,
    cate_id: 0,
    loadStatus: 'loading',
  },
  onLoad: function (options) {
    this.setData({
      child_id: options.child_id,
      cate_id: options.cate_id
    });
    this.loadItems();
  },
  bindTapRelaod: function(e) {
    this.loadItems();
  },
  loadItems: function() {
    var that = this;
    that.setData({  loadStatus: 'loading' })
    wx.request({
      url: 'http://localhost:3010/getData?cate_id=' + that.data.cate_id + '&child_id=' + that.data.child_id,
      data: 'get',
      header: {},
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function(res) {
        for (var i = 0; i < res.data.length; i++) 
          res.data.open = false;
        that.setData({
          items: res.data,
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
    
  },
})