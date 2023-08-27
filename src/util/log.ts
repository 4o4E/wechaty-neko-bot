import {log} from "wechaty";

export let enableDebug = false;

export function switchDebug() {
  enableDebug = !enableDebug;
}

// export function debug(message: string, ...args: any[]) {
//   if (enableDebug) {
//     log.info("[DEBUG]", message, args)
//   }
// }

export function debug(block: () => string) {
  if (enableDebug) {
    log.info("[DEBUG]", block())
  }
}

export function warn(block: () => string) {
  log.info("[WARN]", block())
}