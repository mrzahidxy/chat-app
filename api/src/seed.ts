import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import User, { type IUser } from "./models/user";
import Conversation from "./models/conversation";
import Message from "./models/message";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/chat-app";

interface SeedUser {
  username: string;
  email: string;
  password: string;
}

const usersToSeed: SeedUser[] = [
  {
    username: "demo-alex",
    email: "alex@example.com",
    password: "Password123!",
  },
  {
    username: "demo-riley",
    email: "riley@example.com",
    password: "Password123!",
  },
];

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const seedUsernames = usersToSeed.map((user) => user.username);
    const existingUsers = await User.find({
      username: { $in: seedUsernames },
    }).select("_id");

    if (existingUsers.length) {
      console.log("Cleaning up existing seed data...");
      const existingUserIds = existingUsers.map((user) => user._id);
      const conversationsToDelete = await Conversation.find({
        members: { $in: existingUserIds },
      }).select("_id");
      const conversationIds = conversationsToDelete.map(
        (conversation) => conversation._id
      );

      await Promise.all([
        Message.deleteMany({
          $or: [
            { sender: { $in: existingUserIds } },
            { conversationId: { $in: conversationIds } },
          ],
        }),
        Conversation.deleteMany({ _id: { $in: conversationIds } }),
        User.deleteMany({ _id: { $in: existingUserIds } }),
      ]);
    }

    console.log("Inserting demo users...");

    const createdUsers: Array<{ doc: IUser; password: string }> = [];

    for (const user of usersToSeed) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const created = await User.create({
        username: user.username,
        email: user.email,
        password: hashedPassword,
      });
      createdUsers.push({ doc: created, password: user.password });
    }

    const [alex, riley] = createdUsers;

    console.log("Creating sample conversation and messages...");

    const conversation = await Conversation.create({
      members: [alex.doc._id, riley.doc._id],
    });

    await Message.insertMany([
      {
        conversationId: conversation._id,
        sender: alex.doc._id,
        text: "Hey Riley! Ready to test the new chat app?",
      },
      {
        conversationId: conversation._id,
        sender: riley.doc._id,
        text: "Absolutely—messages seem to be working great!",
      },
    ]);

    console.log("\nSeed complete. Demo credentials:");
    createdUsers.forEach((user) => {
      console.log(
        ` - ${user.doc.username} (${user.doc.email}) / ${user.password}`
      );
    });
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

seed();
