import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: [String],
  },
});

export const userModel = mongoose.model("user", userSchema);
export type User = mongoose.InferSchemaType<typeof userSchema>;
