## Vue CLI是如何实现的 -- 终端命令行工具

###Vue CLI
Vue CLI是一个基于Vue.js进行快速开发的完整系统，提供了终端命令行工具、零配置脚手架、插件题、图形化管理界面等。

插件系统:

Creator：
        
    constructor
    EventEmitter

Preset

    loadPreset
    savePreset

Prompt

    presetPromt
    featurePrompt
    injectedPrompts
    outroPrompts

@vue/cli-service

    渲染template
    写package.json

Generator

    render
    extendPackage

入口文件

Node版本检查

    期望版本
    LTS版本

判断当前路径

检查应用名

初始化

    package.json
    README.md
    GIT
