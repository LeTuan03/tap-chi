import { PrismaClient } from "@prisma/client";

// Giữ một PrismaClient duy nhất khi dev (hot reload) để không mở quá nhiều kết nối
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
