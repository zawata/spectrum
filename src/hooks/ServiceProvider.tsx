import React from "react";
import {
  type ServiceBase,
  type ServiceContextDescriptor,
  type ServiceInitializationContext,
  ServiceManager,
} from "../services/ServiceManager";

const ServiceContext = React.createContext<ServiceManager>(ServiceManager.getInstance());

export type ServiceContextProviderProps = React.PropsWithChildren<{
  serviceManager: ServiceManager;
}>;
export const ServiceContextProvider = ({ children, serviceManager }: ServiceContextProviderProps) => {
  return <ServiceContext.Provider value={serviceManager}>{children}</ServiceContext.Provider>;
};

export const useService = <
  TClassServiceContextDescriptor extends ServiceContextDescriptor,
  TClass extends ServiceBase<TClassServiceContextDescriptor>,
>(
  t: new (context: ServiceInitializationContext<TClassServiceContextDescriptor>) => TClass,
): TClass => {
  const serviceProvider = React.useContext(ServiceContext);
  return serviceProvider.getService(t);
};
