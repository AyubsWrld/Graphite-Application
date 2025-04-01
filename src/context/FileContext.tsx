import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AppDataSource } from '../../utils/database/data-source';  
import { loadFiles } from '../../lib/modules/FileManager';  

// Define a File interface that is more generalized
interface File {
  abs_path: string;
  filename: string;
  height?: number; // Optional for non-image files
  width?: number;  // Optional for non-image files
  extension: string;
  filetype: string;
  uri: string;
  size?: number;   // Add size property
}

interface FileContextType {
  files: File[] | null;
  setFiles: React.Dispatch<React.SetStateAction<File[] | null>>;
  reloadFiles: () => Promise<void>;
  isLoading: boolean;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

interface FileProviderProps {
  children: ReactNode;
}

export const FileProvider: React.FC<FileProviderProps> = ({ children }) => {
  const [files, setFiles] = useState<File[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    const initDb = async () => {
      try {
        const isInitialized = AppDataSource.isInitialized;
        setDbInitialized(isInitialized);
        console.log("Database initialization status:", isInitialized);
        if(!isInitialized){
          try {
            await AppDataSource.initialize() ;
          } catch (e) {
            console.log('Error occured when initializing database', e) ; 
          }
        }
      } catch (error) {
        console.error("Error checking database initialization:", error);
      }
    };
    
    initDb();
  }, []);

  // Load files once database is initialized
  useEffect(() => {
    const initializeFiles = async () => {
      if (dbInitialized) {
        try {
          setIsLoading(true);
          console.log("Loading files from database...");
          const loadedFiles = await loadFiles();
          console.log(`Loaded ${loadedFiles.length} files from database`);
          setFiles(loadedFiles);
        } catch (error) {
          console.error("Error loading files:", error);
          setFiles([]);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    initializeFiles();
  }, [dbInitialized]);

  // Function to reload files
  const reloadFiles = useCallback(async () => {
    try {
      setIsLoading(true);
      const updatedFiles = await loadFiles();
      setFiles(updatedFiles);
      console.log("Files reloaded:", updatedFiles.length, "files found");
    } catch (error) {
      console.error("Error reloading files:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <FileContext.Provider value={{ files, setFiles, reloadFiles, isLoading }}>
      {children}
    </FileContext.Provider>
  );
};

// Custom hook to use the file context
export const useFiles = () => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error('useFiles must be used within a FileProvider');
  }
  return context;
};
