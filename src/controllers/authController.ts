import { Request, Response } from "express";
import { userModel } from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

type Tokens = {
  token: string;
  refreshToken: string;
};

class AuthController {
  private _sendError(res: Response, message: string, code?: number) {
    const errCode = code || 400;
    res.status(errCode).json({ error: message });
  }

  private _generateToken(userId: string): Tokens {
    const secret: string = process.env.JWT_SECRET || "secretkey";
    const exp: number = parseInt(process.env.JWT_EXPIRES_IN || "3600"); // 1 hour
    const refreshexp: number = parseInt(
      process.env.JWT_REFRESH_EXPIRES_IN || "86400"
    ); // 24 hours
    const token = jwt.sign({ userId: userId }, secret, { expiresIn: exp });
    const refreshToken = jwt.sign(
      { userId: userId },
      secret,
      { expiresIn: refreshexp } // 24 hours
    );
    return { token, refreshToken };
  }

  async register(req: Request, res: Response) {
    // Registration logic here
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
      const tokens = this._generateToken(user._id.toString());

      user.refreshToken.push(tokens.refreshToken);
      await user.save();

      //send token back to user
      res.status(201).json(tokens);
    } catch (error) {
      return this._sendError(res, "Registration failed", 401);
    }
  }

  async login(req: Request, res: Response) {
    // Login logic here
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

      //generate JWT token
      const tokens = this._generateToken(user._id.toString());

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
      const secret: string = process.env.JWT_SECRET || "secretkey";
      const decoded: any = jwt.verify(refreshToken, secret);

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
      const tokens = this._generateToken(user._id.toString());
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
