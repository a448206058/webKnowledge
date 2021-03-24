### 如何撰写一份好的提交信息
为了建立一个有用的修订历史，团队应该首先约定一个提交信息的规约，该规约至少定义了以下三个方面

样式

内容

元数据

### 伟大的Git提交信息七大法则
1.用一个空行把主题和正文隔离开
    
    虽然不是必须的，但是你最好以一句少于50个字符的话简短概括你的改动，然后空一行，再深入描述。
    提交信息中空行之上的文本会被当做提交的标题，该标题在Git中到处都会用到。比如Git-format-patch(1)
    会把一个提交转换为一封电子邮件，它会把这个标题作为邮件的主题，其余的部分会作为邮件的正文。

2.把主题行限制在50个字符以内

3.主题行大写开头

4.主题行不必以句号结尾

5.在主题行中使用祈使句

6.正文在72个字符处折行

7.使用正文解释是什么和为什么而不是怎么样

## Git-Commit-Log 规范

### Commit message目的
commit message应该清晰明了，说明本次提交的目的

### 格式
Header：只有一行，包括三个字段：type（必需）、scope（可选）和subject（必需）

    type：用于说明本次commit的类别，只允许使用下面7个标识
        feat：新功能（feature)
        fix：修改bug
        docs：文档（documentaion)
        style：格式（不影响代码运行的变动）
        refactor：重构（即不是新增功能，也不是修改bug的代码变动）
        test：增加测试
        chore：构建过程或辅助工具的变动
         
    scope：用于说明commit影响的范围，比如数据层、控制层、视图层等等，视项目不同而不同。
    
    subject：是commit目的的简短描述，不超过50个字符

body：用于对本次commit的详细描述，可以分为多行

Footer：只用于俩种情况

1.不兼容变动  以BREAKING CHANGE开头

2.关闭Issue Closes #234

Revert （可忽视）
当前commit用于撤销以前的commit，则必须以revert:开头，后面跟着被撤销Commit的Header

### 提交频率
每次写完一个功能的时候，就应该做一次提交



参考资料：
https://jiongks.name/blog/git-commit/
