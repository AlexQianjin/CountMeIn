//index.js
const app = getApp();
const localMemberInfoKey = 'localMemberInfo';

Page({
	data: {
		userInfo: {},
		logged: false,
    requestResult: '',
		courses: []
	},

	onLoad: function() {
		console.log(localMemberInfoKey);
		if (!wx.cloud) {
			wx.redirectTo({
				url: '../login/login'
			});
			return;
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
					});
				}
			}
		});
		return;
  },

	onCancelReserve: function(e) {
		this.removeReserveRecord(e.currentTarget.dataset.item);
	},

	removeReserveRecord: function(record) {
		const db = wx.cloud.database();
		db.collection('reserveRecord')
			.doc(record._id)
			.remove({
				success: res => {
					wx.showToast({
						title: '取消预约成功'
					});
					this.setData({
						courses: this.data.courses.filter(i => i._id !== record._id)
					});
					console.log('[数据库] [删除记录] 成功，');
				},
				fail: err => {
					wx.showToast({
						icon: 'none',
						title: '删除记录失败'
					});
					console.error('[数据库] [删除记录] 失败：', err);
				}
			});
	},

	checkCellphone: function() {
		wx.getStorage({
			key: localMemberInfoKey,
			success: res => {
				let data = res.data;
				console.log(data);
				if (data && data.cellphone) {
					this.getReservedCourses(data);
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

	getReservedCourses: function(data) {
		const db = wx.cloud.database();
		const _ = db.command;
		let date = new Date();
		db.collection('reserveRecord')
			.where(
				_.and([
					{
						year: date.getFullYear()
					},
					{
						month: date.getMonth() + 1
					},
					{
						cellphone: data.cellphone
					}
				])
			)
			.orderBy('createTime', 'desc')
			.get({
				success: res => {
					this.setData({
						courses: res.data.map(i => {
              i.createTime = i.createTime.toLocaleDateString();
              return i;
            }),
            userInfo: data
					});

					console.log('[数据库] [查询记录] 成功: ', res.data);
				},
				fail: err => {
					wx.showToast({
						icon: 'none',
						title: '查询记录失败'
					});
					console.error('[数据库] [查询记录] 失败：', err);
				}
			});
	},

	onShow: function() {
		this.checkCellphone();
  },
  
  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {
    this.checkCellphone();
  }
});
