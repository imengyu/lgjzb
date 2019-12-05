// components/HighLightText.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    textClass: {
      type: String,
      value: '',
    },
    text: {
      type: String,
      value: '',
      observer: 'loadText'
    },
    highlightText: {
      type: String,
      value: '',
      observer: 'loadText'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    items: [],
  },

  /**
   * 组件的方法列表
   */
  methods: {
    loadText: function() {
      var arr = [];
      if(this.properties.text != ''){
        var strArr = this.properties.text.split(this.properties.highlightText);
        if (strArr.length > 1) {
          for (var i = 0; i < strArr.length; i++) {
            if (i > 0) 
              arr.push(this.properties.highlightText);
            arr.push(strArr[i]);
          }
          this.setData({
            items: arr
          })
        }
      }

    }
  }
})
