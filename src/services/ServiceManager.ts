enum ContextFieldType {
  Constant = "constant",
  Variable = "variable",
  Service = "service",
}

type ContextField<T extends ContextFieldType, TValue> = {
  type: T;
  value: TValue;
};

export function Constant<T>(value: T): ContextField<ContextFieldType.Constant, T> {
  return {
    type: ContextFieldType.Constant,
    value,
  };
}

export function Service<
  TServiceClass extends ServiceClass<TServiceContextDescriptor>,
  TServiceContextDescriptor extends ServiceContextDescriptor,
>(serviceClass: TServiceClass): ContextField<ContextFieldType.Service, TServiceClass> {
  return {
    type: ContextFieldType.Service,
    value: serviceClass,
  };
}

export type ServiceContextDescriptor = Record<string, ContextField<ContextFieldType, unknown>>;

export type ServiceContext<TServiceContextDescriptor extends ServiceContextDescriptor> = {
  [K in keyof TServiceContextDescriptor]: TServiceContextDescriptor[K]["value"];
};

export type ServiceInitializationContext<TServiceContextDescriptor extends ServiceContextDescriptor> = {
  contextDescriptor: TServiceContextDescriptor;
  serviceManager: ServiceManager;
};

export abstract class ServiceBase<TServiceContextDescriptor extends ServiceContextDescriptor> {
  context: ServiceContext<TServiceContextDescriptor>;

  constructor(serviceInit: ServiceInitializationContext<TServiceContextDescriptor>) {
    // biome-ignore lint/suspicious/noExplicitAny: TODO: get rid of this
    const tempContext: any = {} as ServiceContext<TServiceContextDescriptor>;
    for (const field in serviceInit.contextDescriptor) {
      const descriptor = serviceInit.contextDescriptor[field];
      switch (descriptor.type) {
        case ContextFieldType.Constant:
        case ContextFieldType.Variable:
          tempContext[field] = descriptor.value;
          break;
        case ContextFieldType.Service: {
          const serviceClass = descriptor.value;
          // @ts-expect-error: figure out how to transform object fields in a type-safe way
          tempContext[field] = serviceInit.serviceManager.getService(serviceClass);
          break;
        }
      }
    }

    // TODO: figure out how(if possible) to type this as it avoids `this.context.<var>`
    // Object.assign(this, tempContext);

    this.context = tempContext as ServiceContext<TServiceContextDescriptor>;
  }
}

export type ServiceClass<TServiceContextDescriptor extends ServiceContextDescriptor> = {
  new (serviceInit: ServiceInitializationContext<TServiceContextDescriptor>): ServiceBase<TServiceContextDescriptor>;
};

export class ServiceManager {
  private serviceInstances: Record<string, InstanceType<ServiceClass<ServiceContextDescriptor>>>;

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

  getService<
    TClass extends ServiceBase<TServiceContextDescriptor>,
    TServiceContextDescriptor extends ServiceContextDescriptor,
  >(classConstructor: new (context: ServiceInitializationContext<TServiceContextDescriptor>) => TClass): TClass {
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

  private registerService<
    TServiceContextDescriptor extends ServiceContextDescriptor,
    TClass extends ServiceClass<TServiceContextDescriptor>,
  >(serviceName: string, classConstructor: TClass, contextDescriptor: TServiceContextDescriptor) {
    this.serviceInstances[serviceName] = new classConstructor({
      contextDescriptor,
      serviceManager: this,
    });
  }

  static registerService =
    <TServiceContextDescriptor extends ServiceContextDescriptor, TClass extends ServiceBase<TServiceContextDescriptor>>(
      serviceContextDescriptor: TServiceContextDescriptor,
    ) =>
    (
      target: new (context: ServiceInitializationContext<TServiceContextDescriptor>) => TClass,
      context: DecoratorContext,
    ) => {
      if (context.kind !== "class") {
        throw new Error("Only class decorators are supported");
      }

      if (!context.name) {
        throw new Error("Cannot register an anonymous service class");
      }

      const serviceManager = ServiceManager.getInstance();
      serviceManager.registerService(context.name, target, serviceContextDescriptor);
    };
}
