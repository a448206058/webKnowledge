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
 function bubbleSort(arr) {
     // i [1, n]
    let n = arr.length;
     while( n > 1){
         for(let i = 1; i < n;i++){
             if(arr[i-1] > arr[i]){
                 let temp = arr[i-1];
                 arr[i-1] = arr[i];
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

function selectionSort(arr) {
    let n = 0;
    while(n < arr.length){
        let c = n;
        for (let i = n; i < arr.length;i++){
            if(arr[i] < arr[c]){
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

function insertionSort(arr) {
    var len = arr.length;
    var preIndex, current;
    for(let i = 1; i < len; i++){
        preIndex = i - 1;
        current = arr[i];
        while(preIndex >= 0 && current < arr[preIndex]){
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
function shellSort(arr) {
    var len = arr.length;
    for(let nums = Math.floor(len / 2);nums > 0;nums = Math.floor(nums / 2)){
        for (let i = nums;i < len;i++){
            let j = i;
            let current = arr[i];
            while(j - nums >=0 && current < arr[j - nums]){
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
function mergeSort(arr){
    var len = arr.length;
    if (len < 2){
        return arr;
    }
    var middle = Math.floor(len / 2),
        left = arr.slice(0, middle),
        right = arr.slice(middle);
    return merge(mergeSort(left), mergeSort(right));
}

function merge(left, right) {
    var result = [];
    while(left.length > 0 && right.length > 0) {
        if(left[0] <= right[0]) {
            result.push(left.shift());
        } else {
            result.push(right.shift())
        }
    }

    while(left.length){
        result.push(left.shift())
    }
    while(right.length){
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
function quickSort(arr, left, right) {
    var len = arr.length,
        partitionIndex,
        left = typeof left != 'number' ? 0 : left,
        right = typeof right != 'number' ? len - 1 : right;

    if (left < right) {
        partitionIndex = partition(arr, left, right);
        quickSort(arr, left, partitionIndex-1);
        quickSort(arr, partitionIndex+1, right);
    }
    return arr
}

function partition(arr, left, right) {
    var pivot = left,
        index = pivot + 1;
    for (var i = index; i <= right; i++){
        if (arr[i] < arr[pivot]) {
            swap(arr, i, index);
            index++;
        }
    }
    swap(arr, pivot, index - 1);
    return index - 1;
}

function swap(arr, i, j){
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
function buildMaxHeap(arr) {
    len = arr.length;
    for (var i = Math.floor(len / 2); i >= 0; i--) {
        heapify(arr, i);
    }
}

function heapify(arr, i) {
    var left = 2 * i + 1,
        right = 2 * i + 2,
        largest = i;

    if(left < len && arr[left] > arr[largest]) {
        largest = left;
    }

    if(right < len && arr[right] > arr[largest]) {
        largest = right;
    }

    if(largest != i){
        swap(arr, i, largest)
        heapify(arr, largest)
    }
}

function swap(arr, i, j) {
    var temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}

function heapSort(arr) {
    buildMaxHeap(arr);
    for (var i = arr.length - 1; i > 0; i--){
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

function countingSort(arr, maxValue) {
    maxValue = maxValue ? maxValue : Math.max(...arr);
    var temp = new Array(maxValue);
    var result;
    for(let i = 0; i < arr.length; i++){
        if(!temp[arr[i]]){
            temp[arr[i]] = 0;
        }
        temp[arr[i]]++;
    }
    for (let j = 0; j < temp.length;j++){
        while(temp[j] > 0){
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

function bucketSort(arr, bucketSize) {
    if(arr.length === 0) {
        return arr;
    }

    var maxValue = Math.max(...arr);
    var minValue = Math.min(...arr);

    var len = arr.length;
    var defaultIndex = Math.floor((maxValue-minValue)/len);
    var result = new Array(defaultIndex);

    for(let i = 0; i < arr.length; i++){
        if(!result[Math.floor(arr[i] - minValue)]){
            result[Math.floor(arr[i] - minValue)] = [];
        }
        result[Math.floor(arr[i] - minValue)].push(arr[i]);
    }

    arr = [];
    for(let i = 0; i < result.length; i++){
        if(result[i]){
            insertionSort(result[i]);
            for(let j = 0; j < result[i].length;j++){
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
function radixSort(arr, maxDigit) {
    var mod = 10;
    var dev = 1;
    maxDigit = Math.max(...arr).toString().length;
    var pos = 0;
    let arrs = JSON.parse(JSON.stringify(arr));
    for (var i = 0; i < maxDigit; i++, dev *= 10, mod *= 10) {
        for (var j = 0; j < arrs.length; j++) {
            if(arrs[j].toString().length == i+1){
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
            if(counter[j] != null) {
                while((value = counter[j].shift()) != null) {
                    arr[pos++] = value;
                    console.log(arr)
                }
            }
        }
    }
    return arr;
}


shellSort([22,3,2,5,6,7,1,44,23,12,34])

//难题
//查找表
15 18 16

// 查找表
454 49