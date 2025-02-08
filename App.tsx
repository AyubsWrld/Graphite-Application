import React, { useEffect } from "react";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { AppDataSource } from "./utils/database/data-source.ts"

export default function App() {
  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      await AppDataSource.initialize();
      console.log("Data Source has been initialized!");
    } catch (error) {
      console.error("Error during Data Source initialization:", error);
    }
  };

  return <AppNavigator />;
}
