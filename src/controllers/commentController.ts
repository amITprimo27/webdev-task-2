import commentModel from "../models/commentModel";
import BaseController from "./baseController";

const commentController = new BaseController(commentModel);

export default commentController;
