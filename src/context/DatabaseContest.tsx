import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeDatabase } from './lib/modules/FileManager';  // Your existing database initialization function

// Define a type for the context state
interface DatabaseContextType {
  isInitialized: boolean;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize the database and update the state once done
    const initialize = async () => {
      await initializeDatabase();  // Assuming this is your async database initialization function
      setIsInitialized(true);
    };
    
    initialize();
  }, []);

  return (
    <DatabaseContext.Provider value={{ isInitialized }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = (): DatabaseContextType => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
