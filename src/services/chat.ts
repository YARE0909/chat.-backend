import { ChatType } from "@prisma/client";
import prisma from "../prisma";

export async function fetchChatMessagesById(chatId: number): Promise<{
  status: "success" | "failure";
  message: string;
  data?: any;
}> {
  if (!chatId) {
    return {
      status: "failure",
      message: "Chat ID is required",
    };
  }

  try {
    const res = await prisma.chat.findUnique({
      where: {
        id: chatId,
      },
      include: {
        messages: {
          include: {
            statuses: {
              select: {
                userId: true,
                status: true,
              },
            },
          },
        },
      },
    });

    return {
      status: "success",
      message: "Chat Messages Retrieved",
      data: res,
    };
  } catch {
    return {
      status: "failure",
      message: "Something went wrong fetching chat messages by id",
    };
  }
}

export async function fetchChatListByUserId(userId: number): Promise<{
  status: "success" | "failure";
  message: string;
  data?: any;
}> {
  if (!userId) {
    return {
      status: "failure",
      message: "User ID is required",
    };
  }

  try {
    const res = await prisma.chat.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    const response = res.map((r) => {
      if (r.type === "DM") {
        return {
          chatId: r.id,
          title: r.members.filter((m) => m.userId !== userId)[0].user.name,
          userId: r.members.filter((m) => m.userId !== userId)[0].user.id,
        };
      }
    });

    return {
      status: "success",
      message: "Chat List Retrieved",
      data: response,
    };
  } catch {
    return {
      status: "failure",
      message: "Something went wrong fetching chat list by user id",
    };
  }
}

export async function createChat(
  creatorId: number,
  memberIds: number[],
  type: ChatType = "DM",
  title?: string
): Promise<{
  status: "success" | "failure";
  message: string;
  data?: any;
}> {
  // Basic validation
  if (!creatorId) {
    return { status: "failure", message: "Creator ID is required" };
  }
  if (!Array.isArray(memberIds) || memberIds.length === 0) {
    return {
      status: "failure",
      message: "At least one other member ID is required",
    };
  }

  try {
    // Ensure we don't duplicate the creator in the member list
    const uniqueMemberIds = Array.from(
      new Set(memberIds.filter((id) => id !== creatorId))
    );

    // Build the members payload: creator as admin, others as regular members
    const membersPayload = [
      { userId: creatorId, isAdmin: true },
      ...uniqueMemberIds.map((userId) => ({ userId, isAdmin: false })),
    ];

    const newChat = await prisma.chat.create({
      data: {
        type,
        title: title || null,
        members: {
          create: membersPayload,
        },
      },
      include: {
        members: true,
      },
    });

    return {
      status: "success",
      message: "Chat created successfully",
      data: newChat,
    };
  } catch (error) {
    console.error("Error creating chat:", error);
    return {
      status: "failure",
      message: "Something went wrong creating the chat",
    };
  }
}
