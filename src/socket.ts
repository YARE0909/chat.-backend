import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import {
  createChat,
  fetchChatListByUserId,
  fetchChatMessagesById,
} from "./services/chat";
import { createMessage } from "./services/message";
import prisma from "./prisma";

let io: Server;

export function initSocket(server: any) {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET!);
      (socket as any).user = user;
      next();
    } catch {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", async (socket) => {
    console.log("User Connected:", (socket as any).user.email);
    const user = (socket as any).user;

    try {
      const userChats = await prisma.chatMember.findMany({
        where: { userId: user.id },
        select: { chatId: true },
      });

      userChats.forEach(({ chatId }) => {
        const room = `chat-${chatId}`;
        socket.join(room);
        console.log(`User ${user.email} joined room ${room}`);
      });
    } catch (err) {
      console.error("Error joining rooms:", err);
    }

    socket.on("disconnect", () => {
      console.log("User Disconnected:", (socket as any).user.email);
    });

    socket.on("message", async ({ chatId, authorId, content }) => {
      if (!chatId) {
        return socket.emit("general-error", {
          message: "Chat Id is required to send message",
        });
      }

      console.log({ chatId, authorId, content });

      try {
        const res = await createMessage({ chatId, authorId, content });
        if (res.status === "success") {
          // Emit to everyone in the chat, including sender
          io.to(`chat-${chatId}`).emit("message-received", res);
        }
      } catch {
        socket.emit("general-error", {
          message: "Unable To Create Message",
        });
      }
    });

    socket.on("load-chat", async (chatId) => {
      console.log({ chatId });
      if (!chatId) {
        io.to(socket.id).emit("general-error", {
          message: "Chat Id is required",
        });
      }
      try {
        const res = await fetchChatMessagesById(chatId);
        if (res.status === "success") {
          io.to(socket.id).emit("chat-info", res);
        }
      } catch {
        io.to(socket.id).emit("general-error", {
          message: "Unable To Fetch Messages",
        });
      }
    });

    socket.on("load-chat-list", async (userId) => {
      if (!userId) {
        console.log("No User id", socket.id);
        return io
          .to(socket.id)
          .emit("general-error", { message: "User Id is required" });
      }
      try {
        const res = await fetchChatListByUserId(userId);
        if (res.status === "success") {
          io.to(socket.id).emit("chat-list", res);
        } else {
          io.to(socket.id).emit("general-error", {
            message: "Unable To Fetch Chat List",
          });
        }
      } catch {
        io.to(socket.id).emit("general-error", {
          message: "Unable To Fetch Chat List",
        });
      }
    });

    socket.on("create-chat", async ({ creatorId, memberIds, type, title }) => {
      if (!creatorId || !memberIds || !type) {
        console.log("Please Pass Required Parameters", socket.id);
        return io.to(socket.id).emit("general-error", {
          message: "Please Pass Required Parameters",
        });
      }
      try {
        const res = await createChat(creatorId, memberIds, type, title);
        if (res.status === "success") {
          io.to(socket.id).emit("chat-created", { chat: res });
        } else {
          io.to(socket.id).emit("general-error", {
            message: "Unable To Create Chat",
          });
        }
      } catch {
        io.to(socket.id).emit("general-error", {
          message: "Unable To Create Chat",
        });
      }
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}
