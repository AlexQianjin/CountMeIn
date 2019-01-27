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
				url: '../chooseLib/chooseLib'
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

	onReserve: function(e) {
		console.log('reserve');
		console.log(e.currentTarget.dataset.item);
		console.log(this.data.courses[0]);
		this.checkCellphone(e.currentTarget.dataset.item);
	},

	generateRecord: function(selectedCourse, userInfo) {
		let record = {};
		let course = this.data.courses[0];
		record.year = course.year;
		record.month = course.month;
		record.dayIndex = course.dayIndex;
		record.dayofweek = course.dayofweek;
		record.name = userInfo.name;
		record.cellphone = userInfo.cellphone;
		record.valid = false;
		record.course = selectedCourse;

		return record;
	},

	addReserveRecord: function(record) {
		const db = wx.cloud.database();
		db.collection('reserveRecord').add({
			data: record,
			success: res => {
				// 在返回结果中会包含新创建的记录的 _id
				this.setData({
					counterId: res._id,
					count: 1
				});
				wx.showToast({
					title: '预约成功'
				});
				console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id);
			},
			fail: err => {
				wx.showToast({
					icon: 'none',
					title: '新增记录失败'
				});
				console.error('[数据库] [新增记录] 失败：', err);
			}
		});
	},

	checkCellphone: function(selectedCourse) {
		wx.getStorage({
			key: localMemberInfoKey,
			success: res => {
				let data = res.data;
				console.log(data);
				if (data && data.cellphone) {
					if (data.miniGroup === 0 && ["APT", "蹦床"].findIndex(i => i === selectedCourse.name) !== -1) {
						wx.showToast({
							icon: 'none',
							title: '需要购买小团体课程'
						});
						return;
					}
					let record = this.generateRecord(selectedCourse, data);
					this.addReserveRecord(record);
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
		const _ = db.command;
		let date = new Date();
		db.collection('courses')
			.where(
				_.and([
					{
						year: date.getFullYear()
					},
					{
						month: date.getMonth() + 1
					},
					{
						dayIndex: (date.getDay() + 6) % 7
					}
				])
			)
			.get({
				success: res => {
					this.setData({
						courses: res.data
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
		this.getTodayCourses();
	}
});
