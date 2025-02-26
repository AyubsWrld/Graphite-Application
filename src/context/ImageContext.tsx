import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppDataSource } from '../../utils/database/data-source.ts';  
import { loadImages } from '../../lib/modules/FileManager.ts';  

const ImageContext = createContext<{ images: any; setImages: React.Dispatch<React.SetStateAction<any>> } | undefined>(undefined);

export const ImageProvider: React.FC = ({ children }) => {
  const [images, setImages] = useState<any | null>(null);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        // Initialize the database
        await AppDataSource.initialize();
        console.log("Data Source has been initialized!");
      } catch (error) {
        console.error("Error during Data Source initialization:", error);
      }
    };

    const initializeImages = async () => {
      try {
        // Load images after the database is initialized
        const loadedImages = await loadImages();
        setImages(loadedImages);  // Set images state
        console.log(loadedImages); // Optionally log the loaded images
      } catch (error) {
        console.error("Error loading images:", error);
      }
    };

    // Initialize the database and then load images
    initializeDatabase().then(() => {
      initializeImages();  // After DB initialization, load the images
    });
  }, []); // Empty dependency array ensures this only runs once on mount

  return (
    <ImageContext.Provider value={{ images, setImages }}>
      {children}
    </ImageContext.Provider>
  );
};

// Custom hook to consume the context
export const useImages = () => {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error('useImages must be used within an ImageProvider');
  }
  return context;
};
