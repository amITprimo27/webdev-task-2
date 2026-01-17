import { Express } from "express";
import mongoose from "mongoose";
import postModel from "../models/postModel";
import commentModel from "../models/commentModel";
import request from "supertest";
import User from "../models/userModel";

type TypeFromModel<T> = T extends mongoose.Model<infer U> ? U : never;
export type Post = TypeFromModel<typeof postModel>;
export type Comment = TypeFromModel<typeof commentModel>;

type UserData = {
  email: string;
  password: string;
  _id?: string;
  token?: string;
  refreshToken?: string;
};
export const userData: UserData = {
  email: "test@test.com",
  password: "testpassword",
};
export const secondUserData: UserData = {
  email: "test2@test.com",
  password: "test2password",
};

export const registerTestUsers = async (app: Express) => {
  await User.deleteMany({ email: userData.email });
  await User.deleteMany({ email: secondUserData.email });
  for (const user of [userData, secondUserData]) {
    const res = await request(app).post("/auth/register").send({
      email: user.email,
      password: user.password,
    });
    user._id = res.body._id;
    user.token = res.body.token;
  }
};
