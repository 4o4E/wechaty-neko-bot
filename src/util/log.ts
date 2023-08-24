import {log} from "wechaty";

export let enableDebug = false;

export function switchDebug() {
  enableDebug = !enableDebug;
}

export function debug(message: string, ...args: string[]) {
  if (enableDebug) {
    log.info("[DEBUG]", message, args)
  }
}