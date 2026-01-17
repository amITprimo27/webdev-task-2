import { Express } from "express";
import request from "supertest";
import { userModel } from "../models/userModel";

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
  await userModel.deleteMany({ email: userData.email });
  await userModel.deleteMany({ email: secondUserData.email });
  for (const user of [userData, secondUserData]) {
    const res = await request(app).post("/auth/register").send({
      email: user.email,
      password: user.password,
    });
    user._id = res.body._id;
    user.token = res.body.token;
  }
};
