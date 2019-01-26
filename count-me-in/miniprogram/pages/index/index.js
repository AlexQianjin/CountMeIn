//index.js
const app = getApp();
const localMemberInfoKey = 'localMemberInfo';

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    courses: []
  },

  onLoad: function() {
    console.log(localMemberInfoKey);
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // this.getTodayCourses();
        } else {
          console.log('need to get user info');
          wx.redirectTo({
            url: '../login/login'
          })
        }
      }
    })
    return;
  },

  onReserve: function() {
    console.log('reserve');
    this.checkCellphone();
  },

  checkCellphone: function() {
    wx.getStorage({
      key: localMemberInfoKey,
      success: res => {
        let data = res.data;
        console.log(data);
        if (data && data.cellphone) {
          console.log('to reserve');
        } else {
          wx.switchTab({
            url: '../userConsole/userConsole'
          });
          return;
        }
      },
      fail: res => {
        console.log('cellphone failed');
        wx.switchTab({
          url: '../userConsole/userConsole'
        });
        return;
      }
    });
  },

  getTodayCourses: function() {
    const db = wx.cloud.database();
    const _ = db.command
    let date = new Date();
    db.collection('courses').where(_.and([
      {
        year: date.getFullYear()
      },
      {
        month: date.getMonth() + 1
      },
      {
        "week.dayIndex": (date.getDay() + 6) % 7
      }
    ])).get({
      success: res => {
        this.setData({
          courses: res.data
        })

        console.log('[数据库] [查询记录] 成功: ', res.data);
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

  onShow: function () { 
    this.getTodayCourses();
  }
})
