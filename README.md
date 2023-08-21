# wechaty-neko-bot

一个微信机器人

## 使用

### windows

```shell
cd run
run
```

### linux
```shell
cd run
chmod +x start.sh
./start.sh
```

## 指令

指令的ts文件放在`./src/command/handler/list`下, 并在代码中直接注册, 启动时会自动扫描执行, 支持嵌套文件夹