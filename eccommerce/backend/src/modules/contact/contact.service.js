const prisma = require("../../lib/prisma");

/**
 * Persists a contact form submission.
 *
 * @param {{ fullName: string, email: string, message: string, userId?: string | null }} data
 * @returns {Promise<{ id: string, createdAt: Date }>}
 */
async function createContactMessage(data) {
  const record = await prisma.contactMessage.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      message: data.message,
      userId: data.userId || null,
      status: "NEW",
    },
    select: { id: true, createdAt: true },
  });

  return record;
}

module.exports = { createContactMessage };
