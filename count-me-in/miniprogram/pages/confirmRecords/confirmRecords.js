//index.js
const app = getApp();
const localMemberInfoKey = 'localMemberInfo';

Page({
	data: {
		userInfo: {},
		logged: false,
		requestResult: '',
		courses: [],
		reserveRecordsofToday: []
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

	onControlReserve: function(e) {
		this.controlReserveRecord(e.currentTarget.dataset.item);
	},

	controlReserveRecord: function(record) {
		const db = wx.cloud.database();
		db.collection('reserveRecord')
			.doc(record._id)
			.update({
				data: {
					valid: !record.valid
				},
				success: res => {
					wx.showToast({
						title: record.valid ? '取消确认成功' : '确认预约成功'
					});
					this.setData({
						courses: this.data.courses.map(i => {
							if (i._id === record._id) {
								i.valid = !i.valid;
							}

							return i;
						})
					});
					console.log('[数据库] [更新记录] 成功，', record._id);
				},
				fail: err => {
					wx.showToast({
						icon: 'none',
						title: '新记录失败'
					});
					console.error('[数据库] [新记录] 失败：', err);
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
					if (data.role !== 'trainer') {
						wx.switchTab({
							url: '../records/records'
						});
						return;
					}
					this.getReservedCourses(data.alias);
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

	getReservedCourses: function(alias) {
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
						'course.coach': alias
					}
				])
			)
			.orderBy('createTime', 'desc')
			.get({
				success: res => {
					let reserveRecords = this.caculateTodayReservedCount(res.data);
					this.setData({
						courses: res.data.map(i => {
							i.createTime = i.createTime.toLocaleDateString();
							return i;
						}),
						reserveRecordsofToday: reserveRecords
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

	caculateTodayReservedCount: function(courses) {
		let courseStatistic = [];
		let reserveRecordofToday = courses.filter(
			i => i.createTime.toLocaleDateString() === new Date().toLocaleDateString()
		);

		reserveRecordofToday.forEach(reserve => {
			let records = courseStatistic.filter(c => c.name === reserve.course.name);
			if (records.length === 0) {
				courseStatistic.push({ name: reserve.course.name, count: 1 });
			} else {
				records[0].count += 1;
			}
		});
		console.log(courseStatistic, 'courseStatistic');

		return courseStatistic;
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
