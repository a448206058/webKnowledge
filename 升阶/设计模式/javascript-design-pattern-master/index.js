/* 构造器模式 */
function User(name, age, career) {
    this.name = name;
    this.age = age;
    this.career = career;
}

/* 工厂模式 */
function Factory(name, age, career) {
    let work;
    switch(career) {
        case 'coder':
            work =  ['write code', 'write doc', 'fix bug'];
            break;
        case 'product manager':
            work = ['book meetingroom', 'write PRD', 'push process'];
            break;
        case 'boss':
            work = ['drink tea', 'read paper', 'meet client'];
            break;
        case 'xxx':
            work = [];
            break;
        default:
            break;
	}

	return new User(name, age, career, work);
}

/* 单例模式 */
class SingleDog {
    show() {
    	console.log(SingleDog.instance);
    	console.log('I\'m a single instance object');
    }
    static getInstance() {
    	// 判断是否已经new过1个实例
    	if(!SingleDog.instance) {
    		// 若这个唯一的实例不存在，就先创建它
    		SingleDog.instance = new SingleDog();
    	}
    	// 如果这个唯一的实例已经存在，就直接返回
    	return SingleDog.instance;
    }
}

const s1 = SingleDog.getInstance();
const s2 = SingleDog.getInstance();

console.log(s1 === s2);

// class Storage {
//     static getInstance() {
//         if(!Storage.instance) {
//             Storage.instance = new Storage();
//         }
//         return Storage.instance;
//     }
//     getItem(key) {
//         return localStorage.getItem(key);
//     }
//     setItem(key, value) {
//         return localStorage.setItem(key, value);
//     }
// }

// const storage1 = Storage.getInstance();
// const storage2 = Storage.getInstance();

// storage1.setItem('name', 'Lilei');
// storage1.getItem('name');
// storage2.getItem('name');
// storage1 === storage2

function StorageBase() {}
StorageBase.prototype.getItem = function(key) {
    return localStorage.getItem(key);
}
StorageBase.prototype.setItem = function(key, value) {
    return localStorage.setItem(key, value);
}

/*StorageBase.getInstance = (function {
    // ...
});*/

const Storage1 = (function() {
    let instance = null;
    return function() {
        if(!instance) {
            instance = new StorageBase();
        }
        return instance;
    }
})();

// const storage3 = new Storage1();
// const storage4 = new Storage1();

// storage3.setItem('name', 'Lilei');
// storage3.getItem('name');
// storage4.getItem('name');
// storage3 === storage4