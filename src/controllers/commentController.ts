import { AuthRequest } from "../middleware/authMiddleware";
import { Response } from "express";
import { BaseController } from "./baseController";
import { Comment, commentModel } from "../models/commentModel";

class CommentController extends BaseController<Comment> {
  constructor() {
    super(commentModel);
  }

  async post(req: AuthRequest, res: Response) {
    const userId = req.user?._id;
    req.body.sender = userId;
    return super.post(req, res);
  }

  async put(req: AuthRequest, res: Response) {
    const userId = req.user?._id;
    const comment = await commentModel.findById(req.params.id);

    if (comment && comment?.sender.toString() !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    return super.put(req, res);
  }

  async del(req: AuthRequest, res: Response) {
    const userId = req.user?._id;
    const comment = await commentModel.findById(req.params.id);

    if (comment && comment?.sender.toString() !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    return super.del(req, res);
  }
}

export const commentController = new CommentController();
