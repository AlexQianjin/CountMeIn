const app = getApp()

// pages/monthPlan/monthPlan.js
Page({

  /**
   * Page initial data
   */
  data: {
    courses: []
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../login/login',
      })
      return
    }

    const db = wx.cloud.database();
    const _ = db.command
    let date = new Date();
    db.collection('courses').where(_.and([
      {
        year: date.getFullYear()
      },
      {
        month: date.getMonth() + 1
      }
  ])).get({
      success: res => {
        this.setData({
          courses: res.data
        })
        console.log('[数据库] [查询记录] 成功: ', res.data)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    });

  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {

  }
})