import { Request, Response } from "express";
import { userModel } from "../models/userModel";
import bcrypt from "bcrypt";
import { AuthUtils } from "../utils/authUtils";

class AuthController {
  private _sendError(res: Response, message: string, code: number = 400) {
    res.status(code).json({ error: message });
  }

  async register(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return this._sendError(res, "Email and password are required", 401);
    }

    try {
      const salt = await bcrypt.genSalt(10);
      const encryptedPassword = await bcrypt.hash(password, salt);
      const user = await userModel.create({
        email,
        password: encryptedPassword,
      });

      //generate JWT token
      const tokens = AuthUtils.generateTokens({ userId: user._id.toString() });

      user.refreshToken.push(tokens.refreshToken);
      await user.save();

      //send token back to user
      res.status(201).json(tokens);
    } catch (error) {
      return this._sendError(res, "Registration failed", 401);
    }
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return this._sendError(res, "Email and password are required");
    }

    try {
      const user = await userModel.findOne({ email });
      if (!user) {
        return this._sendError(res, "Invalid email or password");
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return this._sendError(res, "Invalid email or password");
      }

      const tokens = AuthUtils.generateTokens({ userId: user._id.toString() });

      user.refreshToken.push(tokens.refreshToken);
      await user.save();

      //send token back to user
      res.status(200).json(tokens);
    } catch (error) {
      return this._sendError(res, "Login failed");
    }
  }

  async refreshToken(req: Request, res: Response) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return this._sendError(res, "Refresh token is required", 401);
    }

    try {
      const decoded = AuthUtils.verifyToken(refreshToken);

      const user = await userModel.findById(decoded.userId);
      if (!user) {
        return this._sendError(res, "Invalid refresh token", 401);
      }

      if (!user.refreshToken.includes(refreshToken)) {
        //remove all refresh tokens from user
        user.refreshToken = [];
        await user.save();
        return this._sendError(res, "Invalid refresh token", 401);
      }

      //generate new tokens
      const tokens = AuthUtils.generateTokens({ userId: user._id.toString() });
      user.refreshToken.push(tokens.refreshToken);
      //remove old refresh token
      user.refreshToken = user.refreshToken.filter((rt) => rt !== refreshToken);
      await user.save();

      res.status(200).json(tokens);
    } catch (error) {
      return this._sendError(res, "Invalid refresh token", 401);
    }
  }
}

export const authController = new AuthController();
