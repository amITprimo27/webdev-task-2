import intApp from "../index";
import postModel from "../models/postModel";
import userModel from "../models/userModel";
import { Express } from "express";
import mongoose from "mongoose";
import { Post } from "./testUtils";
import request from "supertest";
let app: Express;
let testUserOne: { _id: mongoose.Types.ObjectId; email: string };
let testUserTwo: { _id: mongoose.Types.ObjectId; email: string };

const postsData: (Post & { _id?: mongoose.Types.ObjectId })[] = [
  {
    content: "Great post!",
    sender: new mongoose.Types.ObjectId(),
  },
  {
    content: "my second post!",
    sender: new mongoose.Types.ObjectId(),
  },
  {
    content: "my second post!",
    sender: new mongoose.Types.ObjectId(),
  },
];

beforeAll(async () => {
  app = await intApp();
  // clean collections
  await postModel.deleteMany({});
  await userModel.deleteMany({});

  testUserOne = await userModel.create({
    email: "testone@example.com",
    password: "password123",
  });

  testUserTwo = await userModel.create({
    email: "testtwo@example.com",
    password: "password321",
  });

  postsData[0].sender = testUserOne._id;
  postsData[1].sender = testUserTwo._id;
  postsData[2].sender = testUserTwo._id;
});

afterAll(async () => {
  // disconnect mongoose so Jest can exit cleanly
  await mongoose.disconnect();
});

describe("Posts API", () => {
  test("test get all empty db", async () => {
    const response = await request(app).get("/post");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });

  test("create posts", async () => {
    for (const post of postsData) {
      const response = await request(app).post("/post").send(post);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("_id");
      post._id = response.body._id;
    }
  });

  test("get posts", async () => {
    const response = await request(app).get("/post");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(postsData.length);

    expect(response.body).toEqual(
      expect.arrayContaining(
        postsData.map((post) =>
          expect.objectContaining({
            content: post.content,
            sender: post.sender.toString(),
          })
        )
      )
    );
  });

  test("get posts by sender", async () => {
    const post = postsData[0];
    const response = await request(app).get("/post?sender=" + post.sender);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].sender).toBe(post.sender.toString());
    postsData[0]._id = response.body[0]._id;
  });

  test("get post by id", async () => {
    const response = await request(app).get("/post/" + postsData[0]._id);
    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(postsData[0]._id);
  });

  test("put post by id", async () => {
    postsData[0].content = "Updated content";
    const response = await request(app)
      .put("/post/" + postsData[0]._id)
      .send(postsData[0]);
    expect(response.statusCode).toBe(200);
    expect(response.body.content).toBe(postsData[0].content.toString());
    expect(response.body.sender).toBe(postsData[0].sender.toString());
  });

  test("get post by invalid id should return 404", async () => {
    const invalidId = new mongoose.Types.ObjectId();
    const response = await request(app).get("/post/" + invalidId);
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("error");
  });

  test("update post by invalid id should return 404", async () => {
    const invalidId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .put("/post/" + invalidId)
      .send({
        content: "Updated content",
        sender: testUserOne._id,
      });
    expect(response.statusCode).toBe(404);
  });

});
