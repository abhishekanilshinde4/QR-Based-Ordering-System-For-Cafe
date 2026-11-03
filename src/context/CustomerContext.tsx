import React, { createContext, useContext, useEffect, useState } from 'react';
import { CustomerInfo } from '../types';

interface CustomerContextType {
  customerInfo: CustomerInfo | null;
  saveCustomerInfo: (info: CustomerInfo) => void;
  clearCustomerInfo: () => void;
  isCustomerModalOpen: boolean;
  openCustomerModal: () => void;
  closeCustomerModal: () => void;
  isInfoComplete: boolean;
}

const STORAGE_KEY = 'scandine_customer_info';

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name && parsed.phone) {
          return {
            name: parsed.name,
            phone: parsed.phone,
            table_number: parseInt(parsed.table_number, 10) || 1
          };
        }
      }
    } catch {}
    return null;
  });

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState<boolean>(false);

  const isInfoComplete = Boolean(
    customerInfo &&
    customerInfo.name.trim().length >= 2 &&
    customerInfo.phone.trim().replace(/\D/g, '').length >= 10 &&
    customerInfo.table_number > 0
  );

  const saveCustomerInfo = (info: CustomerInfo) => {
    const cleaned = {
      name: info.name.trim(),
      phone: info.phone.trim().replace(/\D/g, ''),
      table_number: Number(info.table_number) || 1
    };
    setCustomerInfo(cleaned);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    localStorage.setItem('aura_cafe_table', cleaned.table_number.toString());
    setIsCustomerModalOpen(false);
  };

  const clearCustomerInfo = () => {
    setCustomerInfo(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const openCustomerModal = () => setIsCustomerModalOpen(true);
  const closeModal = () => {
    if (isInfoComplete) {
      setIsCustomerModalOpen(false);
    }
  };

  return (
    <CustomerContext.Provider
      value={{
        customerInfo,
        saveCustomerInfo,
        clearCustomerInfo,
        isCustomerModalOpen,
        openCustomerModal,
        closeCustomerModal: closeModal,
        isInfoComplete
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};
