import { Request, Response } from "express";
import prisma from "../prisma";

export const getUserListController = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
    if (user) {
      return res.status(200).send({
        status: 200,
        error: true,
        errorMessage: "Users List Retrieved Successfully",
        message: "",
        data: user,
      });
    } else {
      return res.status(500).send({
        status: 500,
        error: true,
        errorMessage: "Something Went Wrong",
        message: "",
        data: undefined,
      });
    }
  } catch (error) {
    return res.status(500).send({
      status: 500,
      error: true,
      errorMessage: error || "Something Went Wrong",
      message: "",
      data: undefined,
    });
  }
};
