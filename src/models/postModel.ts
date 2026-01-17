import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
});

export const postModel = mongoose.model("post", postSchema);
export type Post = mongoose.InferSchemaType<typeof postSchema>;
