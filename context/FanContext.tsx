import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

interface FanContextType {
  isAutoMode: boolean;
  setIsAutoMode: Dispatch<SetStateAction<boolean>>;
}

const FanContext = createContext<FanContextType | undefined>(undefined);

export const FanProvider = ({ children }: { children: ReactNode }) => {
  const [isAutoMode, setIsAutoMode] = useState(false);

  return (
    <FanContext.Provider value={{ isAutoMode, setIsAutoMode }}>
      {children}
    </FanContext.Provider>
  );
};

export const useFan = () => {
  const context = useContext(FanContext);
  if (context === undefined) {
    throw new Error("useFan must be used within a FanProvider");
  }
  return context;
};