/*
当价格类型为“预售价”时，满 100 - 20，不满 100 打 9 折
当价格类型为“大促价”时，满 100 - 30，不满 100 打 8 折
当价格类型为“返场价”时，满 200 - 50，不叠加
当价格类型为“尝鲜价”时，直接打 5 折
*/

// 将四种价格标签化
/*
预售价 - pre
大促价 - onSale
返场价 - back
尝鲜价 - fresh
*/
/*
STEP 1
// 询价方法，接受价格标签和原价为入参
function askPrice(tag, originPrice) {
	if(tag === 'pre') {
		if(originPrice >= 100) {
			return originPrice - 20;
		}
		return originPrice * 0.9;
	}

	if(tag === 'onSale') {
		if(originPrice >= 100) {
			return originPrice - 30;
		}
		return originPrice * 0.8;
	}

	if(tag === 'back') {
		if(originPrice >= 200) {
			return originPrice - 50;
		}
		return originPrice;
	}

	if(tag === 'fresh') {
		return originPrice * 0.5;
	}

    // 新增 “新人价”
	if(tag === 'newUser') {
		if(originPrice >= 100) {
			return originPrice - 50;
		}
		return originPrice;
	}
}
*/

/*
STEP 2
提取四种询价逻辑
*/
/*
function prePrice(originPrice) {
	if(originPrice >= 100) {
		return originPrice - 20;
	}
	return originPrice * 0.9;
}

function onSalePrice(originPrice) {
	if(originPrice >= 100) {
		return originPrice - 30;
	}
	return originPrice * 0.8;
}

function backPrice(originPrice) {
	if(originPrice >= 200) {
		return originPrice - 50;
	}
	return originPrice;
}

function freshPrice(originPrice) {
	return originPrice * 0.5;
}

function newUserPrice(originPrice) {
	if(originPrice >= 100) {
		return originPrice - 50;
	}
	return originPrice;
}

function askPrice(tag, originPrice) {
	if(tag === 'pre') {
		return prePrice(originPrice);
	}

	if(tag === 'onSale') {
		return onSalePrice(originPrice);
	}

	if(tag === 'back') {
		return backPrice(originPrice);
	}

	if(tag === 'fresh') {
		return freshPrice(originPrice);
	}

	if(tag === 'newUser') {
		return newUserPrice(originPrice);
	}
}
*/

/*
STEP 3
把询价算法全都收敛到一个对象里
*/
// 定义一个询价处理器对象
const priceProcessor = {
	pre(originPrice) {
		if(originPrice >= 100) {
			return originPrice - 20;
		}
		return originPrice * 0.9;
	},
	onSale(originPrice) {
		if(originPrice >= 100) {
			return originPrice - 30;
		}
		return originPrice * 0.8;
	},
	back(originPrice) {
		if(originPrice >= 200) {
			return originPrice - 50;
		}
		return originPrice;
	},
	fresh(originPrice) {
		return originPrice * 0.5;
	},
};

// 询价函数
function askPrice(tag, originPrice) {
  return priceProcessor[tag](originPrice);
}

