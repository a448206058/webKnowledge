class StaffFactory {
	doWork() {
		throw new Error('抽象工厂方法不允许直接调用，需要重写！');
	}

	getAuth() {
		throw new Error('抽象工厂方法不允许直接调用，需要重写！');
	}
}

// Boss
class BossFactory extends StaffFactory {
	doWork() {
		const computer = new MacBookPro();
	}

	getAuth() {}
}

// 后勤人员
class LogisticsFactory extends StaffFactory {
	doWork() {
		const computer = new NormalNotebook();
	}

	getAuth() {}
}

// 外包人员
class OutSourcingFactory extends StaffFactory {
	doWork() {
		const computer = new NormalNotebook();
	}

	getAuth() {}
}

// 普通办公室职工
class OfficeStaffFactory extends StaffFactory {
	doWork() {
		const computer = new MacBookAir();
	}

	getAuth() {}
}


class Computer {
	runSoftware() {
		throw new Error('抽象产品方法不允许直接调用，需要重写!');
	}
}

class NormalNotebook extends Computer {
	runSoftware() {
		console.log('用普通方式运转');
	}
}

class MacBookAir extends Computer {
	runSoftware() {
		console.log();
	}
}

class MacBookPro extends Comment {
	runSoftware() {
		console.log();
	}
}