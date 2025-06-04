
import React, { createContext, useContext, ReactNode, useState } from 'react';

export interface CRMContextType {
  lastSync: Date;
  isRefreshing: boolean;
  companyName: string;
  activeModules: string[];
  updateInventory: (itemName: string, quantityChange: number) => Promise<void>;
  syncDataAcrossCRM: () => void;
  updateModuleData: (moduleName: string, data: any) => void;
  getModuleData: (moduleName: string) => any;
  exportModuleData: (moduleName: string, format: 'csv' | 'excel' | 'pdf', customData?: any[]) => Promise<boolean>;
  importModuleData: (moduleName: string, file: File) => Promise<boolean>;
  printModuleData: (moduleName: string, options?: any) => Promise<boolean>;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

interface CRMProviderProps {
  children: ReactNode;
}

const useCRMImplementation = (): CRMContextType => {
  const [lastSync] = useState<Date>(new Date());
  const [isRefreshing] = useState<boolean>(false);
  const [companyName] = useState<string>("RWS Pharmacie");
  const [activeModules] = useState<string[]>(["inventory", "billing", "patients"]);

  const updateInventory = async (itemName: string, quantityChange: number): Promise<void> => {
    console.log(`Updating inventory: ${itemName}, change: ${quantityChange}`);
  
    return Promise.resolve();
  };
  
  return {
    lastSync,
    isRefreshing,
    companyName,
    activeModules,
    updateInventory,
    syncDataAcrossCRM: () => {
      console.log("Syncing data across CRM...");
    },
    updateModuleData: (moduleName: string, data: any) => {
      console.log(`Updating module data: ${moduleName}`);
    },
    getModuleData: (moduleName: string) => {
      console.log(`Getting module data: ${moduleName}`);
      return null;
    },
    exportModuleData: async (moduleName: string, format: 'csv' | 'excel' | 'pdf', customData?: any[]) => {
      console.log(`Exporting module data: ${moduleName} in ${format} format`);
      return Promise.resolve(true);
    },
    importModuleData: async (moduleName: string, file: File) => {
      console.log(`Importing module data: ${moduleName}`);
      return Promise.resolve(true);
    },
    printModuleData: async (moduleName: string, options?: any) => {
      console.log(`Printing module data: ${moduleName}`);
      return Promise.resolve(true);
    }
  };
};

export const CRMProvider: React.FC<CRMProviderProps> = ({ children }) => {
  const crmContext = useCRMImplementation();
  
  return (
    <CRMContext.Provider value={crmContext}>
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  
  if (context === undefined) {
    throw new Error('useCRM must be used inside a CRMProvider');
  }
  
  return context;
};

export default CRMContext;
