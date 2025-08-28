import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

interface LampContextType {
  isAutoMode: boolean;
  setIsAutoMode: Dispatch<SetStateAction<boolean>>;
}

const LampContext = createContext<LampContextType | undefined>(undefined);

export const LampProvider = ({ children }: { children: ReactNode }) => {
  const [isAutoMode, setIsAutoMode] = useState(false);

  return (
    <LampContext.Provider value={{ isAutoMode, setIsAutoMode }}>
      {children}
    </LampContext.Provider>
  );
};

export const useLamp = () => {
  const context = useContext(LampContext);
  if (context === undefined) {
    throw new Error("useLamp must be used within a LampProvider");
  }
  return context;
};