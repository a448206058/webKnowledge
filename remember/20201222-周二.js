// 1． 第一个记忆周期：5分钟
// 2． 第二个记忆周期：30分钟 20201222 19:30
// 3． 第三个记忆周期：12小时 20201223 07:00
// 4． 第四个记忆周期：1天 20201223 19:00
// 5． 第五个记忆周期：2天 20201224 19:00
// 6． 第六个记忆周期：4天 20201226 19:00
// 7． 第七个记忆周期：7天 20201229 19:00
// 8． 第八个记忆周期：15天 20210108 19:00

1.解释下promise --3-- 20201223 09:17
一个promise代表异步操作的最终结果，包含resolved和rejected
有三种状态：
pending
resolved
rejected
包含Promise.prototype.then Promise.prototype.catch 方法
能够转换为带有value的onfulfFilled 和带reason的onRejected

2.静态方法包括
Promise.all 等待所有Promise执行完 如果包含reject 返回第一个reject的reason 如果都是resolve 用一个数组返回
Promise.allSettled 等待所有Promise执行完 用一个数组返回每个promise的结果
Promise.any
