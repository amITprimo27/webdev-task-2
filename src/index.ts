import express, { Express } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import specs from "./swagger";
import { postsRouter } from "./routes/postRoutes";
import { commentRouter } from "./routes/commentRouts";
import { authRouter } from "./routes/authRoutes";
const app = express();

dotenv.config({ path: "/env/.env.dev" });

const intApp = () => {
  const promise = new Promise<Express>((resolve, reject) => {
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());

    // Swagger UI
    // Swagger Documentation
    app.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(specs, {
        explorer: true,
        customCss: ".swagger-ui .topbar { display: none }",
        customSiteTitle: "Movie & Comments API Documentation",
      })
    );

    // Swagger JSON endpoint
    app.get("/api-docs.json", (req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.send(specs);
    });

    // Routes
    app.use("/post", postsRouter);
    app.use("/comment", commentRouter);
    app.use("/auth", authRouter);
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
