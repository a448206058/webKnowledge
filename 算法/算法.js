/**
 * 算法分类：
 *      常见排序算法可以分为俩大类：
 *          比较类排序： 通过比较来决定元素间的相对次序，由于其时间复杂度不能突破O(nlogn),因此也成为非线性时间比较类排序。
 *              交换排序：
 *                  冒泡排序    O(n2)       O(1)
 *                  快速排序    O(nlog2n)   O(nlog2n)
 *              插入排序
 *                  简单插入排序   O(n2)  O(1)
 *                  希尔排序    O(n2)   O(1)
 *              选择排序
 *                  简单选择排序  O(n2)   O(1)
 *                  堆排序     O(nlog2n)   O(1)
 *              归并排序
 *                  二路归并排序  O(nlog2n)   O(n)
 *                  多路归并排序  O(nlog2n)   O(n)
 *
 *          非比较类排序：不通过比较来决定元素间的相对次序，它可以突破基于比较排序的时间下界，以线性时间运行，因此也称为线性时间非比较类排序。
 *              计数排序    O(n+k)      O(n+k)
 *              桶排序     O(n+k)      O(n+k)
 *              基数排序    O(n*k)      O(n+k)
 */

/**
 *  冒泡排序：   O(n2)
 *      比较相邻的元素。如果第一个比第二个大，就交换它们俩个；
 *      对每一对相邻元素做同样的工作，从开始第一对到结尾的最后一对，这样在最后的元素应该回收最大的数；
 *      针对所有元素重复以上的步骤，除了最后一个；
 *      重复1-3，直到排序完成。
 */
function bubbleSort (arr) {
    // i [1, n]
    let n = arr.length;
    while (n > 1) {
        for (let i = 1; i < n; i++) {
            if (arr[i - 1] > arr[i]) {
                let temp = arr[i - 1];
                arr[i - 1] = arr[i];
                arr[i] = temp;
            }
        }
        n--;
    }
    return arr;
}

/**
 * 选择排序：    O(n2)
 *      首先在未排序序列中找到最小元素，存放到排序序列的起始位置，然后，再从剩余未排序元素中继续寻找最小元素，然后放到已排序序列的末尾。
 */

function selectionSort (arr) {
    let n = 0;
    while (n < arr.length) {
        let c = n;
        for (let i = n; i < arr.length; i++) {
            if (arr[i] < arr[c]) {
                c = i;
            }
        }
        let temp = arr[n];
        arr[n] = arr[c];
        arr[c] = temp;
        n++;
    }
    return arr
}

/**
 * 插入排序：    O(n2)
 *      通过构建有序序列，对于未排序数据，在已排序序列中从后向前扫描，找到相应位置并插入
 *      理解：插入排序的关键是要每次更换位置的时候进行前移一位的操作
 */

function insertionSort (arr) {
    var len = arr.length;
    var preIndex, current;
    for (let i = 1; i < len; i++) {
        preIndex = i - 1;
        current = arr[i];
        while (preIndex >= 0 && current < arr[preIndex]) {
            arr[preIndex + 1] = arr[preIndex];
            arr[preIndex] = current;
            preIndex--;
        }
    }
    return arr;
}

/**
 * 希尔排序：    O(n2)
 *      缩小增量排序
 */
function shellSort (arr) {
    var len = arr.length;
    for (let nums = Math.floor(len / 2); nums > 0; nums = Math.floor(nums / 2)) {
        for (let i = nums; i < len; i++) {
            let j = i;
            let current = arr[i];
            while (j - nums >= 0 && current < arr[j - nums]) {
                arr[j] = arr[j - nums];
                j = j - nums;
            }
            arr[j] = current;
        }
    }
    return arr;
}

/**
 * 归并排序：    O(log2n)
 */
function mergeSort (arr) {
    var len = arr.length;
    if (len < 2) {
        return arr;
    }
    var middle = Math.floor(len / 2),
        left = arr.slice(0, middle),
        right = arr.slice(middle);
    return merge(mergeSort(left), mergeSort(right));
}

function merge (left, right) {
    var result = [];
    while (left.length > 0 && right.length > 0) {
        if (left[0] <= right[0]) {
            result.push(left.shift());
        } else {
            result.push(right.shift())
        }
    }

    while (left.length) {
        result.push(left.shift())
    }
    while (right.length) {
        result.push(right.shift())
    }
    return result;
}

/**
 * 快速排序：    O(log2n)
 *      利用分治思想处理数组
 *      声明一个中间值，中间值为轴点（轴点为比较值+1) 分为左右处理数组
 *      处理数组的过程为冒泡排序 从左往右循环比较
 */
function quickSort (arr, left, right) {
    var len = arr.length,
        partitionIndex,
        left = typeof left != 'number' ? 0 : left,
        right = typeof right != 'number' ? len - 1 : right;

    if (left < right) {
        partitionIndex = partition(arr, left, right);
        quickSort(arr, left, partitionIndex - 1);
        quickSort(arr, partitionIndex + 1, right);
    }
    return arr
}

function partition (arr, left, right) {
    var pivot = left,
        index = pivot + 1;
    for (var i = index; i <= right; i++) {
        if (arr[i] < arr[pivot]) {
            swap(arr, i, index);
            index++;
        }
    }
    swap(arr, pivot, index - 1);
    return index - 1;
}

function swap (arr, i, j) {
    var temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}

/**
 * 堆排序
 *      利用堆的概念来排序的选择排序。
 *      1.大顶堆：每个节点的值都大于或等于其子节点的值，在堆排序算法中用于升序排列
 *      2.小顶堆：每个节点的值都小于或等于其子节点的值，在堆排序算法中用于降序排列
 *
 *      第一轮把前一半的值替换为最大值
 *      arr[0]经过排序为最大值 位于最顶端 此时交换arr[0]与arr[i]  确保arr[i]为最大值
 *      每次循环减1
 */

var len;
function buildMaxHeap (arr) {
    len = arr.length;
    for (var i = Math.floor(len / 2); i >= 0; i--) {
        heapify(arr, i);
    }
}

function heapify (arr, i) {
    var left = 2 * i + 1,
        right = 2 * i + 2,
        largest = i;

    if (left < len && arr[left] > arr[largest]) {
        largest = left;
    }

    if (right < len && arr[right] > arr[largest]) {
        largest = right;
    }

    if (largest != i) {
        swap(arr, i, largest)
        heapify(arr, largest)
    }
}

function swap (arr, i, j) {
    var temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}

function heapSort (arr) {
    buildMaxHeap(arr);
    for (var i = arr.length - 1; i > 0; i--) {
        swap(arr, 0, i);
        len--;
        heapify(arr, 0);
    }
    return arr;
}

/**
 * 计数排序
 *      找到最大值
 *      定义一个存储数组大小为0,最大值
 *      循环数组存储值
 *      循环数组取出值
 */

function countingSort (arr, maxValue) {
    maxValue = maxValue ? maxValue : Math.max(...arr);
    var temp = new Array(maxValue);
    var result;
    for (let i = 0; i < arr.length; i++) {
        if (!temp[arr[i]]) {
            temp[arr[i]] = 0;
        }
        temp[arr[i]]++;
    }
    for (let j = 0; j < temp.length; j++) {
        while (temp[j] > 0) {
            result.push(temp[j]);
            temp[j]--;
        }
    }
    return result;
}

/**
 * 桶排序      O(n+k)      O(n+k)
 *      映射关系 找到最大值和最小值
 *      找到数组的长度
 *      用最大值减去最小值除以数组的长度 得到每个桶的长度
 *
 *      每个桶中存储值
 *      对桶内数据进行排序
 *
 */

function bucketSort (arr, bucketSize) {
    if (arr.length === 0) {
        return arr;
    }

    var maxValue = Math.max(...arr);
    var minValue = Math.min(...arr);

    var len = arr.length;
    var defaultIndex = Math.floor((maxValue - minValue) / len);
    var result = new Array(defaultIndex);

    for (let i = 0; i < arr.length; i++) {
        if (!result[Math.floor(arr[i] - minValue)]) {
            result[Math.floor(arr[i] - minValue)] = [];
        }
        result[Math.floor(arr[i] - minValue)].push(arr[i]);
    }

    arr = [];
    for (let i = 0; i < result.length; i++) {
        if (result[i]) {
            insertionSort(result[i]);
            for (let j = 0; j < result[i].length; j++) {
                arr.push(result[i][j]);
            }
        }
    }
    return arr;
}

/**
 * 基数排序
 *
 */

var counter = [];
function radixSort (arr, maxDigit) {
    var mod = 10;
    var dev = 1;
    maxDigit = Math.max(...arr).toString().length;
    var pos = 0;
    let arrs = JSON.parse(JSON.stringify(arr));
    for (var i = 0; i < maxDigit; i++, dev *= 10, mod *= 10) {
        for (var j = 0; j < arrs.length; j++) {
            if (arrs[j].toString().length == i + 1) {
                var bucket = parseInt(arrs[j] % mod / dev);
                if (counter[bucket] == null) {
                    counter[bucket] = [];
                }
                counter[bucket].push(arrs[j]);
                arrs.splice(j, 1);
                j = j - 1;
            }
        }

        for (var j = 0; j < counter.length; j++) {
            var value = null;
            if (counter[j] != null) {
                while ((value = counter[j].shift()) != null) {
                    arr[pos++] = value;
                    console.log(arr)
                }
            }
        }
    }
    return arr;
}


shellSort([22, 3, 2, 5, 6, 7, 1, 44, 23, 12, 34])

//难题
//查找表
15 18 16

// 查找表
454 49

// 链表
206 92

83 86 328 2 445

// 虚拟头节点
203 82 21

// 穿针引线
24 25 147 148

237

// 双指针
19 61 143 234

// 查找表 滑动窗口
220

// 栈 队列
// 栈 最近的元素
20 150 71

// 栈和递归的紧密关系
递归算法
二叉树中的算法
前序遍历 中序遍历 后序遍历
144 94 145

//
341: -1

// 层序遍历
102: -1 107 119 103 199,

    // BFS和图的最短路径
    广度优先遍历
279 127 - 1 126 --

// 队列
// 广度优先遍历
树 层序遍历

//优先队列
堆
347 - 1 23 - 1

//二叉树和递归
106 111

//反转二叉树
226 100 - 1 101 - 1 222 110 - 1

// 二叉树 终止条件
112 - 1 404 - 1

// 递归
257 - 1 113 - 1 129

98 - 1 450 - 1 108 - 1 230 - 1 236 - 1

// 回溯
17 93 - 1 131 - 1

// 排列
46 - 1 47 - 1

// 组合
77 - 1 39 - 1 40 - 1 216 1 78 1 90 - 1 401

// 二维平面上使用回溯法
79 - 1
// floodfill 
200 - 1 130 - 1 417

//
51 - 1 37

// 动态规划
将原问题拆解成若干子问题，同时保存子问题的答案，使得每个子问题只求解一次，最终获得原问题的答案
70 - 1 120 - 1  64

//
343 - 1 279 - 1 91 - 1 62 - 1 63 - 1

// 
198 - 1 213 - 1 337 - 1 309 - 1

//
300 - 1  376 - 1

//
416 - 1  322 -1 377 -1 474 139 494

// 贪心算法
455 -1  392  1

//coins = [1, 2, 5], amount = 11

var coinChange = function (coins, amount) {
    let dp = new Array(amount + 1).fill(Infinity);
    dp[0] = 0;

    for (let i = 1; i <= amount; i++) {
        for (let coin of coins) {
            if (i - coin >= 0) {
                dp[i] = Math.min(dp[i], dp[i - coin] + 1);
            }
        }
    }

    return dp[amount] === Infinity ? -1 : dp[amount];
};

var canPartition = function (nums) {
    let sum = 0;
    for (let i = 0; i < nums.length; i++) {
        sum += nums[i];
    }

    if (sum % 2) return false;

    let n = nums.length;
    let C = sum / 2;
    let memo = new Array(C + 1).fill(false);

    for (let i = 0; i <= C; i++) {
        memo[i] = (nums[0] == i)
    }

    for (let i = 1; i < n; i++) {
        for (let j = C; j >= nums[i]; j--) {
            memo[j] = memo[j] || memo[j - nums[i]]
        }
    }
    return memo[C];
};

var pathSum = function (root, sum) {
    let res = [];
    help(root, sum, res, []);
    return res;
};

function help (root, sum, res, arr) {
    if (root === null) return;
    arr.push(root.val);
    if (root.left === null && root.right === null && root.val === sum) {
        // 注意这里不能直接存放arr
        // 直接存放arr的话这里存的是数组的引用
        res.push([...arr]);
    }
    help(root.left, sum - root.val, res, arr);
    help(root.right, sum - root.val, res, arr);
    // 上面两步都结束之后要把arr出栈进行回溯
    arr.pop();
}

作者：GuYueJiaJie
链接：https://leetcode-cn.com/problems/path-sum-ii/solution/javascriptti-jie-shuang-90-by-guyuejiajie-2/
来源：力扣（LeetCode）
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。

let res = []
if (!root) {
    return res
}
if (root.left == null && root.right == null) {
    res.push(root.val.toString())
    return res;
}
let left = binaryTreePaths(root.left)
for (let i = 0; i < left.length; i++) {
    res.push(root.val.toString() + "->" + left[i])
}
let right = binaryTreePaths(root.right);
for (let i = 0; i < right.length; i++) {
    res.push(root.val.toString() + "->" + right[i])
}
return res;

let result = []
var preOrderTraverseNode = (node) => {
    if (node) {
        // 先根节点
        result.push(node.val)
        // 然后遍历左子树
        preOrderTraverseNode(node.left)
        // 再遍历右子树
        preOrderTraverseNode(node.right)
    }
}
preOrderTraverseNode(root)
return result

var postorderTraversal = function (root) {
    let result = []
    var postorderTraversalNode = (node) => {
        if (node) {
            // 先遍历左子树
            postorderTraversalNode(node.left)
            // 再遍历右子树
            postorderTraversalNode(node.right)
            // 最后根节点
            result.push(node.val)
        }
    }
    postorderTraversalNode(root)
    return result
};

作者：user7746o
链接：https://leetcode-cn.com/problems/binary-tree-postorder-traversal/solution/javascriptjie-er-cha-shu-de-hou-xu-bian-li-by-user/
来源：力扣（LeetCode）
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。

作者：user7746o
链接：https://leetcode-cn.com/problems/binary-tree-preorder-traversal/solution/javascriptjie-qian-xu-bian-li-er-cha-shu-by-user77/
来源：力扣（LeetCode）
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。


var levelOrder = function (root) {
    const ret = [];
    if (!root) {
        return ret;
    }

    const q = [];
    q.push(root);
    while (q.length !== 0) {
        const currentLevelSize = q.length;
        ret.push([]);
        for (let i = 1; i <= currentLevelSize; ++i) {
            const node = q.shift();
            ret[ret.length - 1].push(node.val);
            if (node.left) q.push(node.left);
            if (node.right) q.push(node.right);
        }
    }

    return ret;
};

var levelOrderBottom = function (root) {
    let result = [];
    if (!root) {
        return result;
    }
    let p = [];
    p.push(root);
    while (p.length !== 0) {
        let length = p.length;

        result.push([]);

        for (let i = 1; i <= length; i++) {
            let temp = p.shift();
            result[result.length - 1].push(temp.val);
            if (temp.left) {
                p.push(temp.left)
            }
            if (temp.right) {
                p.push(temp.right)
            }
        }
    }
    result = result.reverse();
    return result;
};

作者：LeetCode - Solution
链接：https://leetcode-cn.com/problems/binary-tree-level-order-traversal/solution/er-cha-shu-de-ceng-xu-bian-li-by-leetcode-solution/
来源：力扣（LeetCode）
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。
var numSquares = function (n) {
    let queue = [n];
    let visited = {};
    let level = 0;
    while (queue.length > 0) {
        // 层序遍历
        level++;
        let len = queue.length;
        for (let i = 0; i < len; i++) {
            let cur = queue.pop();
            for (let j = 1; j * j <= cur; j++) {
                let tmp = cur - j * j;
                // 找到答案
                if (tmp === 0) {
                    return level;
                }
                if (!visited[tmp]) {
                    queue.unshift(tmp);
                    visited[tmp] = true;
                }
            }
        }
    }
    return level;
};

作者：Alexer - 660
链接：https://leetcode-cn.com/problems/perfect-squares/solution/279-wan-quan-ping-fang-shu-by-alexer-660/
来源：力扣（LeetCode）
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。

if (p == null && q == null)
    return true;
if (p == null || q == null)
    return false;
if (p.val != q.val)
    return false;
return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);

if (!root) return true
var isEqual = function (left, right) {
    if (!left && !right) return true
    if (!left || !right) return false
    return left.val === right.val
        && isEqual(left.left, right.right)
        && isEqual(left.right, right.left)
}
return isEqual(root.left, root.right)

作者：user7746o
链接：https://leetcode-cn.com/problems/symmetric-tree/solution/javascriptdui-cheng-er-cha-shu-by-user7746o/
来源：力扣（LeetCode）
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。

作者：guanpengchn
链接：https://leetcode-cn.com/problems/same-tree/solution/hua-jie-suan-fa-100-xiang-tong-de-shu-by-guanpengc/
来源：力扣（LeetCode）
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。


function isBalanced1 (root, result) {
    if (root == null) {
        return 0
    }
    let l = isBalanced1(root.left, result);
    let r = isBalanced1(root.right, result);
    if (l - r > 1 || l - r < -1) {
        result[0] = false
    }
    return Math.max(l, r) + 1;
}
var isBalanced = function (root) {
    let a = [true];
    isBalanced1(root, a);
    return a[0]
};


作者：yan - shi - san
链接：https://leetcode-cn.com/problems/balanced-binary-tree/solution/ping-heng-er-cha-shu-javascript-di-gui-shi-xian-yo/
来源：力扣（LeetCode）
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。