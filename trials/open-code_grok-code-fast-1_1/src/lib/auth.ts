import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createUser(username: string, password: string) {
  const hashedPassword = await hashPassword(password)
  return prisma.user.create({
    data: {
      username,
      password: hashedPassword,
    },
  })
}

export async function findUserByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username },
  })
}

export async function findUserById(id: number) {
  return prisma.user.findUnique({
    where: { id },
  })
}