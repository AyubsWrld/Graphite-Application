import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Video } from "./entities/Video";
import { Image } from "./entities/Image";

export const AppDataSource = new DataSource({
  type: "react-native",
  database: "app.db",
  location: "default",
  synchronize: true,
  logging: true,
  entities: [User, Image, Video],
  subscribers: [],
  migrations: [],
  // Add these options to better handle SQLite limitations
  extra: {
    // Enable this if needed
    // foreignKeys: false
  }
});
