import { PrismaClient as PrismaClientClass } from "./generated/prisma/client";

export type * from "./generated/prisma/models";
export * as Prisma from "./generated/prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClientClass | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClientClass({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
