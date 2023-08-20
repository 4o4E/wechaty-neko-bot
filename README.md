# wechaty-neko-bot

一个微信机器人

## script

```shell
# 编译(必要时手动删除dist文件夹)
npm run compile

# 运行(需要先编译)
npm run start
```

## 指令

指令的ts文件放在`./src/command/handler/list`下, 并在代码中直接注册, 启动时会自动扫描执行