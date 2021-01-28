#   MutationObserver
The MutationObserver interface provides the ability to watch for changes being made to the DOM tree.It is designed as a 
replacement for the older Mutation Events feature,which was part of the DOM3 Events feature,which part of the DOM3 Events
specification.
MutationObserver接口提供了监视对DOM树所做更改的功能。它被设计成替换旧的突变事件功能，这是DOM3事件特性的一部分规范。

##  Constructor
###     MutationObserver()
Creates and returns a new MutationObserver which will invoke a specified callback function when DOM changes occur.
创建并返回一个新的MutationObserver当DOM发生更改时，它将调用指定的回调函数。

##  Methods
###     disconnect()
Stops the MutationObserver instance from receiving further notifications until and unless observe() is called again.
停止MutationObserver实例接收进一步的通知，除非再次调用observe()

###     observe()
Configures the MutationObserver to begin receiving notifications through its callback function when DOM changes matching
the given options occur.
将MutationObserver配置为在DOM更改匹配出现给定选项时通过其回调开始接收通知

###     takeRecords()
Removes all pending notifications from the MutationObserver's notification queue and returns them in a new Array of
MutationRecord objects.
从MutationObserver的通知队列中删除所有等待状态的通知并返回它们用一个新的数组MutationRecord对象

##  Mutation Observer & customize resize event listener & demo

