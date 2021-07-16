### BFC/IFC 
BFC（Block Formatting Context)叫做块级格式化上下文
    如何生成BFC
        根元素
        float的值不为none
        overflow的值不为visible
        display的值为inline-block、table-cell、flex、inline-flex
        position的值为absolute或者fixed
    BFC的布局规则
        内部的元素会在垂直方向上一个接一个的放置
        Box垂直方向的距离由margin决定
        同属一个BFC的俩个相邻box的margin会发生重叠
    应用
        解决margin重叠的问题
        俩栏布局问题
        解决浮动元素的父元素高度坍塌问题
    触发条件
        float的属性不为none
        position为absolute或fixed
        display为inline-block、table-cell、table-caption、flex
        overflow不为visible
    IFC叫做行级格式化上下文
        内部的盒子会在水平方向，一个个地放置
        IFC的高度，由里面最高盒子的高度决定
        当一行不够放置的时候会自动切换到下一行

### 常见的布局方式有哪些
圣杯布局：是一种三栏布局，俩边定宽，中间宽度子适应
双飞翼布局
珊格布局
flex布局
grid网格布局
绝对定位布局

### css3的filter属性详解 
blur 高斯模糊
        brightness 亮度
        contrast 对比度
        grayscale 灰度滤镜
        hue-rorate 色调旋转
        invert 反色
        opacity 透明度
        saturate 饱和度滤镜
        sepia 褐色

### css的继承属性
font-size
        text-indent
        text-align
        text-shadow
        line-height
        visibility
        cursor

### CSS盒模型
w3c标准盒模型：属性width,height只包含内容content，不包括border和padding
        IE盒模型：属性width，height包含border和padding，指的是content+padding+border
        content-box border-box

### CSS权重
内联样式 id选择器 类选择器 标签选择器和伪元素选择器

### CSS优化技巧
合理使用选择器
        减少DOM操作，减少重绘和重排
        去除无效的选择器
        文件压缩
        异步加载文件
        减少@import的使用

### css3有哪些新特性？
RGBA和透明度
        background-image background-origin background-size background-repeat
        word-wrap
        transform
        文字阴影 text-shadow
        font-face 定义自己的字体
        border-radius
        box-shadow
        媒体查询

### 1像素边框问题
通过transfrom:scale(0.5)或者通过viewport+rem解决

### 分析比较opacity:0 visibility:hidden display:none 优劣和适用场景
结构：
          display:none 会让元素完全从渲染树中消失，渲染的时候不占据任何空间，不能点击
          visibility:hidden 不会让元素从渲染树消失，渲染元素继续占据空间，只是内容不可见
          opacity: 0 不会让元素从渲染树消失，渲染元素继续占据空间，只是内容不可见，可以点击
        继承：
          display: none和opacity: 0 是非继承属性，子孙节点消失由于元素从渲染树消失造成，通过修改子孙节点属性无法显示
          visibility: hidden 是继承属性，子孙节点消失由于继承了hidden，通过设置visibility:vibible,可以让子节点显示显示
        性能：
          display:none 修改元素会造成文档回流，读屏器不会读取display:none 元素内容，性能消耗较大
          visibility:hidden 修改元素只会造成本元素的重绘，性能消耗较少
          opacity:0 修改元素会造成重绘，性能消耗较少

### 重绘和回流
回流：
        节点的几何属性或者布局发生改变被称为回流
      重绘：
        节点的样式改变且不影响布局的，比如color，visibility等，称为重绘
        重绘不一定引发回流，回流一定引发重绘
      减少回流和重绘：
        批量修改dom或者样式
        避免触发同步UI渲染
        对于复杂动画效果，使用绝对定位让其脱离文档流

### 用css实现多行文本溢出省略效果
单行
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      多行
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        overflow: hidden;

### 如何实现骨架屏，说说你的思路 
使用一张图片，取到数据之后再替换为dom节点

### CSS3新增伪类有哪些？
:first-of-type 选择属于其父元素的首个元素
      :last-of-type 选择属于其父元素的最后元素
      :only-of-type 选择属于其父元素唯一的元素
      :only-child 选择属于其父元素的唯一子元素
      :nth-child 选择属于其父元素的第二个子元素
      :enabled :disabled 表单控件的禁用状态
      :checked 单选框或复选框被选中

### 什么是响应式设计？
响应式设计是一个网站能够兼容多个终端。
      基本原理是通过媒体查询检测不同的设备屏幕尺寸做处理。
      页面头部必须有meta生命的viewport

### 阐述一下css sprites
将一个页面涉及到的所有图片都包含到一张大图中去，然后利用css的background-image，background-repeat,
      backgroun-position的组合进行背景定位。利用CSS Sprites能很好地减少网页的http请求，从而大大的提高页面的性能

### 不同浏览器的标签默认的外补丁和内补丁不同
 解决方案：css里增加通配符*{margin: 0;padding: 0);

### 清除浮动
添加一个空白标签 内容为clear:both
      父级添加overflow方法：可以通过触发BFC的方式清除浮动
      使用after伪元素清除浮动 cleat:both
      使用zoome: 1

### 双边距问题：在IE6中设置了float,同时又设置margin,就会出现双边距问题
解决方案：设置display: inline;

### BOM对象模型
是浏览器对象模型
        window对象 表示浏览器打开的窗口
        screen 包含有关用户屏幕的信息
        navigator 包含有关访问者浏览器的信息
        location 用户获取当前页面的地址
        document
        history 包含浏览器的历史

