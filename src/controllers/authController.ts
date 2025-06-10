import { Request, Response } from "express";
import prisma from "../prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerController = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { email, password: hashed, name },
  });
  res.json({
    status: 200,
    error: false,
    errorMessage: "",
    message: "Registered Successfully",
    data: undefined,
  });
};

export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user)
    return res.status(404).send({
      status: 404,
      error: true,
      errorMessage: "User Not Found",
      message: "",
      data: undefined,
    });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid)
    return res.status(401).send({
      status: 404,
      error: true,
      errorMessage: "Invalid Password",
      message: "",
      data: undefined,
    });

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET!
  );
  res.json({
    status: 200,
    error: false,
    errorMessage: "",
    message: "Logged In Successfully",
    data: { token },
  });
};
