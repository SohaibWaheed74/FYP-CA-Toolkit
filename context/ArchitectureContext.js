import React, { createContext, useState } from "react";

export const ArchitectureContext = createContext();

export const ArchitectureProvider = ({ children }) => {
  const [selectedArchitecture, setSelectedArchitecture] = useState(null);

  return (
    <ArchitectureContext.Provider
      value={{ selectedArchitecture, setSelectedArchitecture }}
    >
      {children}
    </ArchitectureContext.Provider>
  );
};