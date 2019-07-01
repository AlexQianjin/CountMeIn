// pages/login/login.js
Page({

  /**
   * Page initial data
   */
  data: {
    logged: false
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    wx.clearStorage();
  },

  onGetUserInfo: function (e) {
    if (!this.logged && e.detail.userInfo) {
      console.log('onGetUserInfo');
      console.log(e.detail.userInfo);
      // this.setData({
      //   logged: true,
      //   avatarUrl: e.detail.userInfo.avatarUrl,
      //   userInfo: e.detail.userInfo
      // });
      wx.switchTab({
        url: '../index/index',
        success: function (res) {
          // success
          console.log("跳转成功");
        },
        fail: function (res) {
          // fail
          console.log("跳转失败", res);
        },
        complete: function (res) {
            // complete
        }
    })}
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