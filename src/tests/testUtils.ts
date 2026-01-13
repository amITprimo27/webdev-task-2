import mongoose from "mongoose";
import postModel from "../models/postModel";
import commentModel from "../models/commentModel";

type TypeFromModel<T> = T extends mongoose.Model<infer U> ? U : never;
export type Post = TypeFromModel<typeof postModel>;
export type Comment = TypeFromModel<typeof commentModel>;
