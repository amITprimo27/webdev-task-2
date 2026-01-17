import { Post, postModel } from "../models/postModel";
import { AuthRequest } from "../middleware/authMiddleware";
import { Response } from "express";
import { BaseController } from "./baseController";

class PostController extends BaseController<Post> {
  constructor() {
    super(postModel);
  }
  async post(req: AuthRequest, res: Response) {
    const userId = req.user?._id;
    req.body.sender = userId;
    return super.post(req, res);
  }

  async put(req: AuthRequest, res: Response) {
    const userId = req.user?._id;
    const post = await postModel.findById(req.params.id);

    if (post && post?.sender.toString() !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    return super.put(req, res);
  }

  async del(req: AuthRequest, res: Response) {
    const userId = req.user?._id;
    const post = await postModel.findById(req.params.id);

    if (post && post?.sender.toString() !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    return super.del(req, res);
  }
}

export const postController = new PostController();
