import prisma from "../prisma";
import { MessageTypesType, MessageStatusType } from "@prisma/client";

export async function createMessage({
  chatId,
  authorId,
  content,
  type = "TEXT", // default to TEXT
}: {
  chatId: number;
  authorId: number;
  content: string;
  type?: MessageTypesType;
}): Promise<{
  status: "success" | "failure";
  message: string;
  data?: any;
}> {
  if (!chatId || !authorId || !content) {
    return {
      status: "failure",
      message: "chatId, authorId, and content are required.",
    };
  }

  try {
    const newMessage = await prisma.message.create({
      data: {
        chatId,
        authorId,
        content,
        type,
        statuses: {
          create: {
            userId: authorId,
            status: MessageStatusType.SENT,
          },
        },
      },
      include: {
        statuses: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      status: "success",
      message: "Message created successfully",
      data: newMessage,
    };
  } catch (error) {
    console.error("Error creating message:", error);
    return {
      status: "failure",
      message: "Something went wrong creating the message",
    };
  }
}
