import React from "react";
import { ServiceManager } from "../services/ServiceManager";

const ServiceContext = React.createContext<ServiceManager>(ServiceManager.getInstance());

export type ServiceContextProviderProps = React.PropsWithChildren<{
  serviceManager: ServiceManager;
}>;
export const ServiceContextProvider = ({ children, serviceManager }: ServiceContextProviderProps) => {
  return <ServiceContext.Provider value={serviceManager}>{children}</ServiceContext.Provider>;
};

export const useService = <TClass extends object>(t: new (serviceManager: ServiceManager) => TClass): TClass => {
  const serviceProvider = React.useContext(ServiceContext);
  return serviceProvider.getService(t);
};
