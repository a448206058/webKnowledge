// 1． 第一个记忆周期：5分钟
// 2． 第二个记忆周期：30分钟 20201221 19:30
// 3． 第三个记忆周期：12小时 20201222 07:00
// 4． 第四个记忆周期：1天 20201222 19:00
// 5． 第五个记忆周期：2天 20201223 19:00
// 6． 第六个记忆周期：4天 20201225 19:00
// 7． 第七个记忆周期：7天 20201228 19:00
// 8． 第八个记忆周期：15天 20210108 19:00

/**
 * 基础知识
 *      promiseA+规范  20201221 11:31 --1-- 11:37 --5-- 20201223 09:09
 *          一个promise表示异步操作的最终结果，与promise交互的主要方式是通过其then方法，该方法注册回调以接收promise的最终值或promise无法实现的原因。
 *          核心promises/A+规范不涉及如何创建fulfill或者reject promises,而是选择专注于提供一个可互相操作的方法
 *          promise states:一个promise必须是三种状态之一：pending,fulfilled或者rejected pending可能会进入到fulfilled或者rejected状态，fulfilled或者rejected状态不能更改
 *          then方法；
 *              一个promise必须提供一个then方法去访问其当前或最终的value或reason,一个promise的then方法接收俩个参数
 *              onFulfilled和onRejected都是可选参数，如果不是一个函数就忽略
 *              如果onFulflled是一个函数：
 *                  必须在promise的状态是fulfilled之后调用它，promise的value作为它的第一个参数，不能多次调用
 *              如果onRejected是一个函数：
 *                  必须在promise的状态是rejected之后调用它，promise的reason作为它的第一个参数，不能多次调用
 *
 *      function myPromise(constructor) {
 *          var self = this;
 *          self.status = "pending"
 *          self.reason = undefined;
 *          self.value = undefined;
 *
 *          var resolve = function(value){
 *              if(self.status === "pending"){
 *                  self.status = "resolved";
 *                  self.value = value;
 *              }
 *          }
 *          var reject = function(){
 *              if(self.status === "pending"){
 *                  self.status = "resolved";
 *                  self.value = value;
 *              }
 *          }
 *          try{
 *              constructor(resolve, reject)
 *          }catch(e){
 *              reject(e);
 *          }
 *      }
 *      myPromise.prototype.then = function(onFulfilled, onRejected){
 *          switch(this.status){
 *              case 'pending':
 *
 *          }
 *      }
 */
