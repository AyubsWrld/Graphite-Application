import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AppDataSource } from '../../utils/database/data-source';  
import { loadImages } from '../../lib/modules/FileManager';  

// Define the type for images
interface Image {
  abs_path: string;
  filename: string;
  height: number;
  width: number;
  extension: string;
  uri: string;
}

interface ImageContextType {
  images: Image[] | null;
  setImages: React.Dispatch<React.SetStateAction<Image[] | null>>;
  reloadImages: () => Promise<void>;
}

// Create the context with a default undefined value
const ImageContext = createContext<ImageContextType | undefined>(undefined);

interface ImageProviderProps {
  children: ReactNode;
}

export const ImageProvider: React.FC<ImageProviderProps> = ({ children }) => {
  const [images, setImages] = useState<Image[] | null>(null);
  const [dbInitialized, setDbInitialized] = useState(false);

  // Initialize database
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        // Check if database is already initialized
        if (!AppDataSource.isInitialized) {
          await AppDataSource.initialize();
          console.log("Data Source has been initialized!");
        }
        setDbInitialized(true);
      } catch (error) {
        console.error("Error during Data Source initialization:", error);
      }
    };

    initializeDatabase();
  }, []);

  // Load images once database is initialized
  useEffect(() => {
    const initializeImages = async () => {
      if (dbInitialized) {
        try {
          const loadedImages = await loadImages();
          setImages(loadedImages);
          console.log("Images loaded successfully");
        } catch (error) {
          console.error("Error loading images:", error);
        }
      }
    };

    initializeImages();
  }, [dbInitialized]);

  // Function to reload images
  const reloadImages = useCallback(async () => {
    try {
      const updatedImages = await loadImages();
      setImages(updatedImages);
      console.log("Images reloaded:", updatedImages.length, "images found");
    } catch (error) {
      console.error("Error reloading images:", error);
    }
  }, []);

  return (
    <ImageContext.Provider value={{ images, setImages, reloadImages }}>
      {children}
    </ImageContext.Provider>
  );
};

// Custom hook to use the image context
export const useImages = () => {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error('useImages must be used within an ImageProvider');
  }
  return context;
};
