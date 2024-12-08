export class ServiceManager {
  private serviceInstances: Record<string, unknown>;

  private constructor() {
    this.serviceInstances = {};
  }

  private static instance: ServiceManager;
  static getInstance() {
    if (!ServiceManager.instance) {
      ServiceManager.instance = new ServiceManager();
    }

    return ServiceManager.instance;
  }

  getService<TClass extends object>(classConstructor: new (serviceManager: ServiceManager) => TClass): TClass {
    const serviceInstance =
      this.serviceInstances[classConstructor.name] ??
      Object.entries(this.serviceInstances).find(
        ([_, serviceInstance]) => serviceInstance instanceof classConstructor,
      )?.[1];

    if (serviceInstance) {
      return serviceInstance as TClass;
    }

    throw new Error(`Service ${classConstructor.name} not registered`);
  }

  private registerService<TClass extends new (serviceManager: ServiceManager) => object>(
    serviceName: string,
    classConstructor: TClass,
  ) {
    this.serviceInstances[serviceName] = new classConstructor(this);
  }

  static registerService =
    <TClass extends object>() =>
    (target: new (serviceManager: ServiceManager) => TClass, context: DecoratorContext) => {
      if (context.kind !== "class") {
        throw new Error("Only class decorators are supported");
      }

      if (!context.name) {
        throw new Error("Cannot register an anonymous service class");
      }

      const serviceManager = ServiceManager.getInstance();
      serviceManager.registerService(context.name, target);
    };
}
