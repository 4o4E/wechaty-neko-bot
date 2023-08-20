import {Contact, log, Message, ScanStatus, WechatyBuilder} from 'wechaty'

import QRCode from 'qrcode'
import fs from 'fs';
import {MessageManager} from "./MessageManager";
import {ConvertImage} from "./command/handler/list/ConvertImage";
import {CommandManager} from "./command/manager/CommandManager";
import {CommandHandlerType} from "./command/handler/CommandHandler";

function onScan(qrcode: string, status: ScanStatus) {
  log.info('Bot', '扫码状态变更: %s(%s)', ScanStatus[status], status)
  // 完成扫码后删除二维码文件
  if (status === ScanStatus.Scanned) {
    fs.unlink("qr.png", (err) => {
      log.error('bot', err)
    })
    return;
  }
  // 生成二维码
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    QRCode.toFile("qr.png", qrcode, {type: 'png'}, (err) => err && log.error('bot', err));
    log.info('Bot', '等待扫码 - qr.png')
    log.info('Bot', 'onScan: %s(%s) - %s', ScanStatus[status], status, qrcode)
  }
}

function onLogin(user: Contact) {
  log.info('Bot', '%s login', user)
}

function onLogout(user: Contact) {
  log.info('Bot', '%s logout', user)
  bot.stop().then(_ => process.exit())
}

async function onMessage(message: Message) {
  MessageManager.onMessageRecv(message)
}

CommandManager.register(ConvertImage, CommandHandlerType.all)
console.log(CommandManager.group.size);
console.log(CommandManager.private.size);

const bot = WechatyBuilder.build({name: 'wechaty-bot'});

bot.on('scan', onScan)
  .on('login', onLogin)
  .on('logout', onLogout)
  .on('message', onMessage)
  .start()
  .then(() => log.info('Bot', 'Starter Bot Started.'))
  .catch(e => log.error('Bot', e));
