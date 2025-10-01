const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function test() {
  const username = "testuser_1759325410988";

  console.log("Looking for user:", username);

  const user = await prisma.user.findUnique({
    where: { username },
  });

  console.log("Found user:", user);

  await prisma.$disconnect();
}

test().catch(console.error);
