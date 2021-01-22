
// 礼物
const present = {
	type: '巧克力',
	value: 60
}

// 未知妹子
const girl = {
	// 姓名
	name: '小美',
	// 自我介绍
	aboutMe: '...',
	// 年龄
	age: 24,
	// 职业
	career: 'teacher',
	// 假头像
	fakeAvatar: 'xxxx',
	// 真实头像
	avatar: 'xxxx',
	// 手机号
	phone: 123456,

	// 为用户增开presents字段存储礼物
	// 礼物数组
	presents: [],
	// 拒绝50块以下的礼物
	bottomValue: 50,
	// 记录最近一次收到的礼物
	lastPresent: present
};

// 普通私密信息
const baseInfo = ['age', 'career'];
// 最私密信息
const privateInfo = ['avatar', 'phone'];

// 用户对象实例
const user = {
	// ... 一些必要的个人信息
	isValidated: true,
	isVIP: false
}

// 婚介所
const JuejinLovers = new Proxy(girl, {
	get: function(girl, key) {
		// baseInfo.includes(key)
		if(baseInfo.indexOf(key) !== -1 && !user.isValidated) {
			console.log('您还没有完成验证哦');
			return;
		}

		// ... 其他各种校验逻辑

		// 此处设定只有验证过的用户才可以购买VIP
		if(user.isValidated && privateInfo.indexOf(key) !==-1 && !user.isVIP) {
			console.log('只有VIP才可以查看该信息哦');
			return;
		}
	},
	// 假设婚介所推出了小礼物功能
	set: function(girl, key, val) {
		if(key === 'lastPresent') {
			if(val.value < girl.bottomValue) {
				console.log('sorry，您的礼物被拒收了');
				return;
			}

			// 如果没有拒收，则赋值成功，同时并入presents数组
			girl.lastPresent = val;
			girl.presents = [...girl.presents, val];
		}
	}
});

console.log(JuejinLovers.name);
JuejinLovers.lastPresent = {
	type: '巧克力',
	value: 100
}