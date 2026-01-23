import express from "express";
import { postController } from "../controllers/postController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", postController.get.bind(postController));
router.get("/:id", postController.getById.bind(postController));
router.post("/", authMiddleware, postController.post.bind(postController));
router.put("/:id", authMiddleware, postController.put.bind(postController));

export { router as postsRouter };
