
//index.js
const app = getApp();
const localMemberInfoKey = 'localMemberInfo';

function daysBetween(date1, date2) {

  // The number of milliseconds in one day
  var ONE_DAY = 1000 * 60 * 60 * 24;

  // Convert both dates to milliseconds
  var date1_ms = date1.getTime();
  var date2_ms = date2.getTime();

  // Calculate the difference in milliseconds
  var difference_ms = Math.abs(date1_ms - date2_ms);

  // Convert back to days and return
  return Math.round(difference_ms / ONE_DAY);

}

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    memberInfo: {},
    hasValidated: false,
    logged: false,
    takeSession: false,
    cellphone: '',
    errorMessage: '',
    requestResult: ''
  },

  onLoad: function() {
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
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              console.log('getSetting');
              console.log(res.userInfo);
              this.setData({
                logged: true,
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
          console.log(this.data.logged);
          wx.getStorage({
            key: localMemberInfoKey,
            success: res => {
              let data = res.data;
              let startDate = new Date(data.startDate);
              let endDate = new Date(startDate.setMonth(startDate.getMonth() + data.month));
              let today = new Date();
              data.daysLeft = daysBetween(endDate, today);
              wx.setStorage({
                key: localMemberInfoKey,
                data: data
              })

              this.setData({
                memberInfo: data,
                hasValidated: true,
                logged: true,
              });
            }
          });
        } else {
          console.log('need to get user info');
          // this.onGetOpenid();
          wx.redirectTo({
            url: '../login/login'
          })
          this.setData({ logged: false});
        }
      }
    })
  },

  onGetUserInfo: function(e) {
    if (!this.logged && e.detail.userInfo) {
      console.log('onGetUserInfo');
      console.log(e.detail.userInfo);
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      });
      // this.onAddUser(e.detail.userInfo);
    }
  },

  onChange(event) {
    this.setData({
      cellphone: event.detail,
      errorMessage: ''
    });
  },

  validateMembership: function() {
    let phone = this.data.cellphone;
    console.log(phone);
    if (!phone) {
      this.setData({ errorMessage: '请输入手机号'});
      return;
    }
    if (!/^\d{11}$/.test(phone)) {
      this.setData({ errorMessage: '请输入完整手机号' });
      return;
    }
    this.getMemberInfo(phone);
  },

  getMemberInfo: function(phone) {
    const db = wx.cloud.database();
    db.collection('members').where({
      cellphone: phone
    }).get({
      success: res => {
        if (res.data.length === 0) {
          wx.showToast({
            icon: 'none',
            title: '无会员信息'
          })
          return;
        }
        let data = res.data[0];
        let startDate = new Date(data.startDate);
        data.start = startDate.toLocaleDateString();
        let endDate = new Date(startDate.setMonth(startDate.getMonth() + data.month));
        data.end = endDate.toLocaleDateString();
        let today = new Date();
        data.daysLeft = daysBetween(endDate, today);
        data.createTime = today.toString();
        wx.setStorage({
          key: localMemberInfoKey,
          data: data
        })
        this.setData({
          memberInfo: data,
          hasValidated: true
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

  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid);
        console.log(this.data.logged);
        app.globalData.openid = res.result.openid
        wx.navigateTo({
          url: '../userConsole/userConsole',
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },

  onHide: function() {
    wx.getStorage({
      key: localMemberInfoKey,
      success: res => {
        let data = res.data;
        if(data && data.cellphone) {
          console.log('refresh member info');
          this.getMemberInfo(data.cellphone);
        }
      }
    });
  }
})