import { Constant, ServiceBase, type ServiceContextDescriptor, ServiceManager } from "./ServiceManager";

export enum LogLevel {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3,
}

export const logServiceContext = {
  logLevel: Constant(LogLevel.Debug),
} as const satisfies ServiceContextDescriptor;

export
@ServiceManager.registerService(logServiceContext)
class LogService extends ServiceBase<typeof logServiceContext> {
  log(this: LogService, level: LogLevel, message: string) {
    if (level >= this.context.logLevel) {
      console.log(message);
    }
  }

  debug(message: string) {
    this.log(LogLevel.Debug, message);
  }

  info(message: string) {
    this.log(LogLevel.Info, message);
  }

  warn(message: string) {
    this.log(LogLevel.Warn, message);
  }

  error(message: string) {
    this.log(LogLevel.Error, message);
  }
}
