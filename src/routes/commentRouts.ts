import express from "express";
import { commentController } from "../controllers/commentController";
import { authMiddleware } from "../middleware/authMiddleware";
const router = express.Router();

router.get("/", commentController.get.bind(commentController));

router.get("/:id", commentController.getById.bind(commentController));

router.post(
  "/",
  authMiddleware,
  commentController.post.bind(commentController)
);

router.delete(
  "/:id",
  authMiddleware,
  commentController.del.bind(commentController)
);

router.put(
  "/:id",
  authMiddleware,
  commentController.put.bind(commentController)
);

export { router as commentRouter };
