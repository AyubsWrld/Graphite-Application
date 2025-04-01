import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AppDataSource } from '../../utils/database/data-source';  
import { loadImages } from '../../lib/modules/FileManager';  

interface File {
  abs_path: string;
  filename: string;
  height: number;
  width: number;
  extension: string;
  filetype : string;
  uri: string;
}

interface ImageContextType {
  files: File[] | null;
  setImages: React.Dispatch<React.SetStateAction<File[] | null>>;
  reloadImages: () => Promise<void>;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

interface ImageProviderProps {
  children: ReactNode;
}

export const ImageProvider: React.FC<ImageProviderProps> = ({ children }) => {
  const [images, setImages] = useState<File[] | null>(null);
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    const initializeImages = async () => {
      if (dbInitialized) {
        try {
          console.log("Loading images from database...");
          const loadedImages = await loadImages();
          console.log(`Loaded ${loadedImages.length} images from database`);
          setImages(loadedImages);
        } catch (error) {
          console.error("Error loading images:", error);
        }
      }
    };
    initializeImages();
  }, [dbInitialized]);

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
