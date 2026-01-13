import express, { Express } from "express";
const app = express();
import mongoose from "mongoose";
import dotenv from "dotenv";
import commentRoutes from "./routes/commentRouts";
dotenv.config({ path: "/env/.env.dev" });

const intApp = () => {
  const promise = new Promise<Express>((resolve, reject) => {
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());

    //TODO: Swagger

    //TODO: Routes
    app.use("/comment", commentRoutes);
    const dbUri = process.env.MONGODB_URI;
    if (!dbUri) {
      console.error("MONGODB_URI is not defined in the environment variables.");
      reject(new Error("MONGODB_URI is not defined"));
    } else {
      mongoose.connect(dbUri, {}).then(() => {
        resolve(app);
      });
    }
    const db = mongoose.connection;
    db.on("error", (error) => {
      console.error(error);
    });
    db.once("open", () => {
      console.log("Connected to MongoDB");
    });
  });
  return promise;
};

export default intApp;
