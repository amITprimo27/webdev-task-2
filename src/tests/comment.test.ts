import intApp from "../index";
import commentModel from "../models/commentModel";
import userModel from "../models/userModel";
import { Express } from "express";
import postModel from "../models/postModel";
import mongoose from "mongoose";
import { Comment, Post, userData, registerTestUsers } from "./testUtils";
import request from "supertest";
let app: Express;
let testPost1: Post & { _id: mongoose.Types.ObjectId };
let testPost2: Post & { _id: mongoose.Types.ObjectId };

const testComments: (Comment & { _id?: mongoose.Types.ObjectId })[] = [
  {
    content: "Great post!",
    sender: new mongoose.Types.ObjectId(),
    postId: new mongoose.Types.ObjectId(),
  },
  {
    content: "Thanks for sharing.",
    sender: new mongoose.Types.ObjectId(),
    postId: new mongoose.Types.ObjectId(),
  },
  {
    content: "Interesting read.",
    sender: new mongoose.Types.ObjectId(),
    postId: new mongoose.Types.ObjectId(),
  },
];

beforeAll(async () => {
  app = await intApp();
  // clean collections
  await commentModel.deleteMany({});
  await postModel.deleteMany({});
  await userModel.deleteMany({});
  await registerTestUsers(app);

  testPost1 = (
    await request(app)
      .post("/post")
      .set("Authorization", "Bearer " + userData.token)
      .send({
        content: "This is a test post.",
      })
  ).body;
  console.log("Created testPost1:", testPost1);

  testPost2 = (
    await request(app)
      .post("/post")
      .set("Authorization", "Bearer " + userData.token)
      .send({
        content: "This is a second test post.",
      })
  ).body;

  testPost1._id = new mongoose.Types.ObjectId(testPost1._id);
  testPost2._id = new mongoose.Types.ObjectId(testPost2._id);

  // wire test comments to the created posts and user
  testComments[0].postId = testPost1._id;
  testComments[1].postId = testPost1._id;
  testComments[2].postId = testPost2._id;

  testComments.forEach(
    (comment) => (comment.sender = new mongoose.Types.ObjectId(userData._id))
  );
});

afterAll(async () => {
  // disconnect mongoose so Jest can exit cleanly
  await mongoose.disconnect();
});

describe("Comment API Tests", () => {
  test("empty DB", async () => {
    const response = await request(app).get("/comment");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  test("create comments", async () => {
    for (const comment of testComments) {
      const response = await request(app)
        .post("/comment")
        .set("Authorization", "Bearer " + userData.token)
        .send(comment);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("_id");
      comment._id = response.body._id;
      comment.sender = response.body.sender;
      expect(response.body.content).toEqual(comment.content);
    }
  });

  test("get comments", async () => {
    const response = await request(app).get("/comment");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(testComments.length);

    // Ensure each expected comment appears in the response with matching fields
    expect(response.body).toEqual(
      expect.arrayContaining(
        testComments.map((comment) =>
          expect.objectContaining({
            content: comment.content,
            postId: comment.postId.toString(),
            sender: comment.sender.toString(),
          })
        )
      )
    );
  });

  test("get comments by postId (existing)", async () => {
    const response = await request(app)
      .get("/comment")
      .query({ postId: testPost1._id.toString() });
    expect(response.status).toBe(200);
    console.log(typeof testComments[0].postId, testComments[0].postId);

    const expectedComments = testComments.filter((comment) =>
      comment.postId.equals(testPost1._id)
    );

    expect(response.body.length).toBe(expectedComments.length);

    expect(response.body).toEqual(
      expect.arrayContaining(
        expectedComments.map((comment) =>
          expect.objectContaining({
            content: comment.content,
            postId: comment.postId.toString(),
            sender: comment.sender.toString(),
          })
        )
      )
    );
  });

  test("get comments by postId (non-existing)", async () => {
    const response = await request(app)
      .get("/comment")
      .query({ postId: new mongoose.Types.ObjectId().toString() });
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  test("get comment by ID (existing)", async () => {
    const targetComment = testComments[0];
    const response = await request(app).get(`/comment/${targetComment._id}`);
    expect(response.status).toBe(200);
    expect(response.body.content).toEqual(targetComment.content);
  });

  test("get comment by ID (non-existing)", async () => {
    const response = await request(app).get(
      `/comment/${new mongoose.Types.ObjectId()}`
    );
    expect(response.status).toBe(404);
  });

  test("update comment", async () => {
    const target = testComments[0];
    const newContent = { content: "Updated content" };
    const res = await request(app)
      .put(`/comment/${target._id}`)
      .set("Authorization", "Bearer " + userData.token)
      .send(newContent);
    expect(res.status).toBe(200);
    expect(res.body.content).toBe(newContent.content);

    // verify persisted
    const verify = await request(app).get(`/comment/${target._id}`);
    expect(verify.status).toBe(200);
    expect(verify.body.content).toBe(newContent.content);
  });

  test("delete comment", async () => {
    const target = testComments[2];
    const res = await request(app)
      .delete(`/comment/${target._id}`)
      .set("Authorization", "Bearer " + userData.token);
    expect(res.status).toBe(200);

    // ensure it's gone
    const verify = await request(app).get(`/comment/${target._id}`);
    expect(verify.status).toBe(404);

    // remaining count should be one less
    const list = await request(app).get("/comment");
    expect(list.status).toBe(200);
    expect(list.body.length).toBe(testComments.length - 1);
  });

  test("update comment (non-existing)", async () => {
    const id = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/comment/${id}`)
      .set("Authorization", "Bearer " + userData.token)
      .send({ content: "No such comment" });
    // current implementation returns 200 with a falsy body when not found
    expect(res.status).toBe(404);
  });

  test("delete comment (non-existing)", async () => {
    const id = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/comment/${id}`)
      .set("Authorization", "Bearer " + userData.token);
    expect(res.status).toBe(404);
  });
});
