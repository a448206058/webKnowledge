### 含有多个条件的if语句
```JavaScript
// bad
if (x === 'abc' || x === 'def' || x === 'ghi' || x === 'jkl'){
    // login
}

// good
if (['abc', 'def', 'ghi', 'jki'].includes(x)){

}
```

### 对NULL、undefiend、empty检查
```JavaScript
// bad
if (test1 !== null || test1 !== undefined || test1 !== ''){
    let test2 = test1;
}

// good
let test2 = test1 || ''
```

### 聚合运算符
?? 如果左值为null或undefined 就返回右值。默认返回左值

### 为多个变量赋值
```JavaScript
let [test1, test2, test3] = [1, 2, 3];
```

### 多个条件的&&
```JavaScript
// bad
if (test1) {
    callMethod();
}

// good
test1 && callMethod();
```

### ||
test1 || callMethod()

### switch 缩写
```JavaScript
// bad
switch (data) {
    case 1:
        test1();
        break;
    case 2:
        test2();
        break;
    case 3:
        test3();
        break;
}

// good
var data = {
    1: test1,
    2: test2,
    3: test
}

data[something] && data[something]();
```

### 隐式返回缩写法
```JavaScript
// bad
function calculate(diameter) {
    return Math.PI * diameter
}

// good
calculate = diameter => (
    Math.PI * diameter
)
```

### 默认参数值
```JavaScript
// bad
add = (test1 = 1, test2 = 2) => (test1 + test2);
```

### 文本模板
```JavaScript
const welcome = `Hi ${test1} ${test2}`
```

### 多行文本
```JavaScript
const data = `a a a
              b b b`
```

### 解构赋值
```JavaScript
const {test1, test2, test3} = this.data;
```

### Array.find
```JavaScript
var fiteredData = data.find(data => data.type === 'test1' && data.name === 'fgh')
console.log(filteredData); // { type: 'test1', name: 'fgh' }
```

### 按位非
!~ == -1  ~ != -1

### 把一个字符串重复多次
'test'.repeat(5)
