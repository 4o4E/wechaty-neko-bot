import type {Command} from "../Command";

export abstract class CommandHandler {
  abstract name: string;
  abstract regex: RegExp;
  abstract usage: string;
  match = (command: Command) => this.regex.test(command.name);

  abstract onCommand(command: Command): void;
}

export enum CommandHandlerType {
  "group",
  "private",
  "all"
}