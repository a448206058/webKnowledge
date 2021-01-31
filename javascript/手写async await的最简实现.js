/**
 *  这段代码主要是用来实现generator的自动执行以及返回Promise
 *  首先： 定义函数名称并接受一个参数
 *         参数是一个函数
 *          function asyncToGenerator(generatorFunc){}
 *
 *  第一步：返回一个新的函数
 *          return function(){}
 *
 *  第二步：调用函数生成实例
 *          实例名称为gen
 *          const gen = generatorFunc.apply(this, arguments)
 *
 *  第三步：返回一个 new Promise
 *          为什么要返回一个new Promise?
 *              因为外部是用.then或者await的方式去使用这个函数的返回值
 *          return new Promise((resolve, reject)=>{})
 *
 *  第四步：new promise中定义一个递归函数来一步步往下走
 *          名称是step 参数是key arg
 *          key包含next和throw俩种值，分别对应了
 *          arg参数则是用来把promise resolve出来的值交给下一个yield
 *          function step(key, arg){}
 *          step("next");
 *
 *  第五步：在step中 解析实例gen的值
 *          try{
 *              var info = gen[key](arg);
 *              var value = info.value;
 *          }catch(error){
 *              reject(error);
 *              return;
 *          }
 *
 *  第六步：根据解析的值进行下一步的操作
 *          如果已经完成了就直接resolve这个promise
 *          这个done是在最后一次调用next才会为true
 *          否则除了最后结束的时候外，每次调用gen.next()
 *          其实是返回 {value: Promise, done: false}的结构，
 *          这里要注意的是Promise.resolve可以接受一个promise为参数
 *          并且这个promise参数被resolve的时候，这个then才会被调用
 *          if (info.done) {
 *              resolve(value);
 *          } else {
 *              return Promise.resolve(value).then()
 *          }
 *
 * 第七步：then中定义resolve和reject方法
 *          重新定义then方法中的onResolved和onRejected方法
 *          当then是onResolved的时候继续调用step("next", value)往下走
 *          return Promise.resolve(value).then(
 *              function(value){
 *                  step("next", value)
 *              },
 *              function(err) {
 *                  step("throw", err)
 *              }
 *          )
 */
function asyncToGenerator(generatorFunc) {
    // 返回的是一个新的函数
    return function() {
        // 先调用generator函数 生成迭代器
        // 对应 var gen = testG()
        const gen = generatorFunc.apply(this, arguments)

        // 返回一个promise 因为外部是用.then的方式 或者await的方式去使用这个函数的返回值的
        // var test = asyncToGenerator(testG)
        // test().then(res => console.log(res))
        return new Promise((resolve, reject) =>{

            // 内部定义一个step函数 用来一步步的跨过yield的阻碍
            // key有next和throw俩种取值，分别对应了gen的next和throw方法
            // arg参数则是用来把promise resolve出来的值交给下一个yield
            function step(key, arg) {
                let generatorResult

                // 这个方法需要包裹在try catch中
                // 如果报错了 就把promise给reject掉 外部通过.catch可以获取到错误
                try {
                    generatorResult = gen[key](arg)
                } catch (error) {
                    return reject(error)
                }

                // gen.next() 得到的结果是一个 {value, done}的结构
                const {value, done} = generatorResult

                if(done) {
                    // 如果已经完成了 就直接resolve这个promise
                    // 这个done是在最后一次调用next后才会为true
                    // 以本文的例子来说 此时的结果是{done: true, value: 'success'}
                    // 这个value也就是generator函数最后的返回值
                    return resolve(value)
                } else {
                    // 除了最后结束的时候外，每次调用gen.next()
                    // 其实是返回 {value: Promise, done: false}的结构，
                    // 这里要注意的是Promise.resolve可以接受一个promise为参数
                    // 并且这个promise参数被resolve的时候，这个then才会被调用
                    return Promise.resolve(
                        // 这个value对应的是yield后面的promise
                        value
                    ).then(
                        // value这个Promise被resolve的时候，就会执行next
                        // 并且只要done不是true的时候 就会递归的往下解开promise
                        // 对应gen.next().value.then(value =>{
                        //      gen.next(value).value.then(value2 => {
                        //          gen.next()
                        //
                        //      //此时done为true了 整个promise被resolve了
                        //      //最外部的test().then(res => console.log(res))的then就开始执行了
                        //})
                        function onResolve(val) {
                            step("next", val)
                        },
                        // 如果promise被reject了 就再次进入step函数
                        // 不同的是，这次的try catch中调用的是gen.throw(err)
                        // 那么自然就被catch到 然后把promise给reject掉
                        function onReject(err){
                            step("throw", err)
                        },
                    )
                }
            }
            step("next")
        })
    }
}
