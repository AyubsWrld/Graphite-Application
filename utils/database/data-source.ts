import { DataSource } from "typeorm";
import { User } from "./entities/User.ts" ; 

export const AppDataSource = new DataSource({
  type: "react-native",
  database: "app.db",
  location: "default",
  synchronize: true,
  logging: true,
  entities: [User],
  subscribers: [],
  migrations: [],
});
