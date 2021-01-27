/**
 *  变量
 *      使用有意义并且可读的变量名称
 */
    const currentDate = new Date();
/**
 *      为相同类型的变量使用相同的词汇。
  */
  //bad
  getUserInfo();
  getClientData();
  getCustomerRecord();
  //good
  getUser();
/**
 *      使用可搜索的名称
  */
  //bad 86400000???
  setTimoeout(blastOff, 86400000);
  //good
  const MILLLISECONDS_IN_A_DAY = 86400000;
  setTimeout(blastOff, MILLLISECONDS_IN_A_DAY);
/**
 *      使用解释性的变量
  */
  // bad
  const address = 'One Infinite Loop, Cupertino 95014';
  const cityZipCodeRegex = /^[^, \\]+[,\\\s]+(.+?)\s*(\d{5})?$/;
  saveCityZipCode(address.match(cityZipCodeRegex)[1], address.match(cityZipCodeRegex)[2]);
  // good
  const address = 'One Infinite Loop, Cupertino 95014';
  const cityZipCodeRegex = /^[^, \\]+[,\\\s]+(.+?)\s*(\d{5})?$/;
  const [, city, zipCode] = address.match(cityZipCodeRegex) || [];
  saveCityZipCode(city, zipCode);
/**
 *      避免心理映射
 *      显示比隐式更好
  */
  // bad
  const locations = ['Austin', 'New York', 'San Francisco'];
  locations.forEach((l) => {
      doStuff();
      doSomeOtherStuff();
      // l???
      dispatch(l);
  })
  // good
 const locations = ['Austin', 'New York', 'San Francisco'];
 locations.forEach((location) => {
    doStuff();
    doSomeOtherStuff();
    dispatch(location);
 })
/**
 *      不添加不必要的上下文
 *      如果你的类名/对象名有意义，不要在变量名上再重复
 */
 // bad
 const Car = {
    carMake: 'Honda',
    carModel: 'Accord',
    carColor: 'Blue'
 };
 function paintCar(car) {
     car.carColor = 'Red';
 }
 // good
 const Car =  {
     make: '',
     model: '',
     color: ''
 }
/**
 *      使用默认变量替代短路运算或条件
 */
// bad
 function createMicrobrewery(name) {
     const breweryName = name || 'Hipster Brew Co.';
     // ...
}
// good
function createMicrobrewery(breweryName = 'Hipster Brew Co.') {

}

/**
 * 函数
 *      函数参数
 *      限制函数参数的个数是非常重要的，因为这样将使你的函数容易进行测试。一旦超过三个参数将会导致组合爆炸，因为
 *      你不得不编写大量针对每个参数的测试用例。
 *
 *      没有参数是最理想的，一个或者俩个参数也是可以的，三个参数应该避免，超过三个应该被重构。通常，如果你有一个超过俩个
 *      函数的参数，那就意味着你的函数尝试做太多的事情。如果不是，多数情况下一个更高级对象可能会满足需求。
 *
 *      由于JavaScript允许我们不定义类型/模板就可以创建对象，当你发现你自己需要大量的参数时，你可以使用一个对象。
 */
// bad
 function createMenu(title, body, buttonText, cancellable) {

}
 // good
const menuConfig = {
     title: 'Foo',
    body: 'Bar',
    buttonText: 'Baz',
    cancellable: true
};

 function createMenu(config) {

 }

/**
 *      函数应当只做一件事情
 *      这是软件工程中最重要的一条规则，当函数需要做更多的事情时，它们将会更难进行编写、测试和推理。
 *      当你能将一个函数隔离到只有一个动作，他们将能够被容易的进行重构并且你的代码将会更容易阅读。如果你
 *      严格遵守本指南中的这一条，你将会领先于许多开发者。
 */
 // bad
 function emailClients(clients) {
     clients.forEach((client) => {
         const clientRecord = database.lookup(client);
         if (clientRecord.isActive()) {
             email(client);
         }
     })
}
// good
function emailClients(clients) {
     clients
         .filter(isClientActive)
         .forEach(email);
}

function isClientActive(client) {
     const clientRecord = database.lookup(client);
     return clientRecord.isActive();
}

/**
 *      函数名称应该说明它要做什么
 */
 // bad
function addToDate(data, month) {
    //...
}
const date = new Date();
addToDate(date, 1)
// good
function addMonthToDate(month, date){

}
const date = new Date();
addMonthToDate(1,date);
/**
 *      函数应该只有一个抽象级别
 *      当在你的函数中有多于一个抽象级别时，你的函数通常做了太多事情。拆分函数将会提升重用性和测试性。
 */
// bad
function parseBetterJSAlternative(code) {
    const REGEXES = [
        // ...
    ];

    const statements = code.split(' ');
    const tokens = [];
    REGEXES.forEach((REGEXES) => {
        statements.forEach((statement) => {
            // ...
        });
    });

    const ast = [];
    tokens.forEach((token) => {
        // lex...
    });

    ast.forEach((node) => {
        // parse...
    })
}
// good
function tokenize(code) {
    const REGEXES = [
        // ...
    ];

    const statements = code.split(' ');
    const tokens = [];
    REGEXES.forEach((REGEX) => {
        statements.forEach((statement) => {
            tokens.push()
        })
    });

    return tokens;
}

function lexer(tokens) {
    const ast = [];
    tokens.forEach((token) => {
        ast.push();
    });
    return ast;
}

function parseBetterJSAlternative(code) {
    const tokens = tokenize(code);
    const ast = lexer(tokens);
    ast.forEach((node) => {
       // parse...
    });
}

/**
 *      移除冗余代码
 */

/**
 *      使用Object.assign设置默认对象
 */
 //bad
const menuConfig = {
    title: null,
    body: 'Bar',
    buttonText: null,
    cancellable: true
};

function createMenu(config) {
    config.title = config.title || 'Foo';
    config.body = config.body || 'Bar';
    config.buttonText = config.buttonText || 'Baz';
    config.cancellable = config.cancellable = undefined ? config.cancellable : true;
}

createMenu(menuConfig);

// good
const menuConfig = {
    title: 'Order',
    buttonText: 'Send',
    cancellable: true
};

function createMenu(config) {
    config = Object.assign({
        title: 'Foo',
        body: 'Bar',
        buttonText: 'Baz',
        cancellable: true
    }, config)
}
createMenu(menuConfig);

/**
 *      不要使用标记位做为函数参数
 *          标记位是告诉你的用户这个函数做了不只一件事情。函数应该只做一件事情。
 *          如果你的函数因为一个布尔值出现不同的代码路径，请拆分它们。
 */
// bad
function createFile(name, temp) {
    if (temp){
        fs.create(`./temp/${name}`);
    } else {
        fs.create(name);
    }
}

// good
function createFile(name) {
    fs.create(name);
}

function createTempFile(name) {
    createFile(`./temp/${name}`);
}

/**
 *      避免副作用
 *          如果一个函数做了除接受一个值然后返回一个值或多个值之外的任何事情，它将会产生副作用，它可能是写入一个文件，
 *          修改一个全局变量，或者意外的把你所有的钱连接到一个陌生人哪里。
 *
 *          现在在你的程序中确实偶尔需要副作用，就像上面的代码，你也许需要写入到一个文件，你需要做的是集中化你要做的事情，
 *          不要让多个函数或者类写入一个特定的文件，用一个服务来实现它，一个并且只有一个。
 *
 *          重点是避免这些常见的易犯的错误，比如在对象之间共享状态而不使用任何结构，使用任何地方都可以写入的可变的数据类型，
 *          没有集中化作用。
 */

//bad
let name = 'Ryan McDermott';

function splitIntoFirstAndLastName() {
    name = name.split(' ');
}

splitIntoFirstAndLastName();

console.log(name); // ['Ryan', 'McDermott'];

// good
function splitIntoFirstAndLastName(name) {
    return name.split(' ');
}

const name = 'Ryan McDermott';
const newName = splitIntoFirstAndLastName(name);

console.log(name); //'Ryan McDermott';
console.log(newName); // ['Ryan', 'McDermott']

/**
 *      不要写入全局函数
 *          污染全局在JavaScript中是一个不好的做法，因为你可能会和另外一个类库冲突，你的API的用户可能不够聪明，
 *          直到他们在生产环境得到一个异常。一个例子是：假设你要扩展JavaScript的原生Array，添加一个可以显式俩个数组
 *          的不同之处的diff方法，你可以在Array.prototype中写一个新的方法，但是它可能会和尝试做相同事情的其它类库发生冲突。
 *          如果有另外一个类库仅仅使用diff方法来查找数组的第一个元素和最后一个元素之间的不同之处呢？这就是为什么使用ES2015/ES6
 *          的类是一个更好的做法的原因，只要简单的扩展全局的Array即可。
 */

//bad
Array.prototype.diff = function diff(comparisonArray) {
    const hash = new Set(comparisonArray);
    return this.filter(elem => !hash.has(elem));
}

//good
class SuperArray extends Array {
    diff(comparisonArray) {
        const hash = new Set(comparisonArray);
        return this.filter(elem => !hash.has(elem));
    }
}

/**
 *      函数式编程优于指令式编程
 *          函数式语言更加简洁并且更容易进行测试
 */
// bad
const programmerOutput = [
    {
        name: 'Uncle Bobby',
        linesOfCode: 500
    }, {
        name: 'Suzie Q',
        linesOfCode: 1500
    }, {
        name: 'Jimmy Gosling',
        linesOfCode: 150
    }, {
        name: 'Gracie Hopper',
        linesOfCode: 1000
    }
];

let totalOutput = 0;

for (let i = 0; i < programmerOutput.length; i++){
    totalOutput += programmerOutput[i].linesOfCode;
}

//good
const programmerOutput = [
    {
        name: 'Uncle Bobby',
        linesOfCode: 500
    }, {
        name: 'Suzie Q',
        linesOfCode: 1500
    }, {
        name: 'Jimmy Gosling',
        linesOfCode: 150
    }, {
        name: 'Gracie Hopper',
        linesOfCode: 1000
    }
];

const totalOutput = programmerOutput
    .map((programmer) => programmer.linesOfCode)
    .reduce((acc, linesOfCode) => acc + linesOfCode, 0);

/**
 *      封装条件语句
 */

// bad
if (fsm.state === 'fetching' && isEmpty(listNode)) {
    //...
}

//good
function shouldShowSpinner(fsm, listNode) {
    return fsm.state === 'fetching' && isEmpty(listNode)
}
if (shouldShowSpinner(fsmInstance, listNodeInstance)) {
    //...
}
