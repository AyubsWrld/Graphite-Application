import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppDataSource } from '../../utils/database/data-source.ts';  
import { loadImages } from '../../lib/modules/FileManager.ts';  

interface ImageContextType {
  images: any;
  setImages: React.Dispatch<React.SetStateAction<any>>;
  reloadImages: () => Promise<void>; // Function to reload images dynamically
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const ImageProvider: React.FC = ({ children }) => {
  const [images, setImages] = useState<any | null>(null);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await AppDataSource.initialize();
        console.log("Data Source has been initialized!");
      } catch (error) {
        console.error("Error during Data Source initialization:", error);
      }
    };

    const initializeImages = async () => {
      try {
        const loadedImages = await loadImages();
        setImages(loadedImages);
      } catch (error) {
        console.error("Error loading images:", error);
      }
    };

    // Initialize the database and then load images
    initializeDatabase().then(() => {
      initializeImages();
    });
  }, []);

  const reloadImages = useCallback(async () => {
    try {
      const updatedImages = await loadImages();
      setImages(updatedImages);
      console.log("Images reloaded:", updatedImages);
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

export const useImages = () => {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error('useImages must be used within an ImageProvider');
  }
  return context;
};
