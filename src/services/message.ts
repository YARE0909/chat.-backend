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
    const members = await prisma.chatMember.findMany({
      where: {
        chatId,
      },
      select: {
        userId: true,
      },
    });

    console.log({ members });

    members.map((m) => {
      console.log({ m });
    });

    const newMessage = await prisma.message.create({
      data: {
        chatId,
        authorId,
        content,
        type,
        statuses: {
          create: members.map(({ userId }) => ({
            userId,
            status:
              userId === authorId
                ? MessageStatusType.SENT
                : MessageStatusType.SENT,
          })),
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

export async function setMessageStatus({
  messageId,
  userId,
  status,
}: {
  messageId: number;
  userId: number;
  status: MessageStatusType;
}) {
  if (!messageId || !userId || !status) {
    return {
      status: "failure",
      message: "messageId, userId, and status are required",
    };
  }
  try {
    const record = await prisma.messageStatus.updateMany({
      where: { messageId, userId },
      data: {
        status,
        timestamp: new Date(),
      },
    });
    return {
      status: "success",
      message: `Status set to ${status}`,
      data: record,
    };
  } catch (err) {
    console.error(err);
    return { status: "failure", message: "Error setting message status" };
  }
}

export async function fetchMessageStatuses(messageId: number) {
  if (!messageId) {
    return { status: "failure", message: "messageId is required" };
  }
  try {
    const stats = await prisma.messageStatus.findMany({
      where: { messageId },
    });
    return { status: "success", message: "Statuses fetched", data: stats };
  } catch (err) {
    console.error(err);
    return { status: "failure", message: "Error fetching statuses" };
  }
}

export async function deleteMessageStatus({
  messageId,
  userId,
  status,
}: {
  messageId: number;
  userId: number;
  status: MessageStatusType;
}) {
  if (!messageId || !userId || !status) {
    return {
      status: "failure",
      message: "messageId, userId, and status are required",
    };
  }
  try {
    await prisma.messageStatus.delete({
      where: {
        messageId_userId_status: { messageId, userId, status },
      },
    });
    return { status: "success", message: "Status deleted" };
  } catch (err) {
    console.error(err);
    return { status: "failure", message: "Error deleting status" };
  }
}
