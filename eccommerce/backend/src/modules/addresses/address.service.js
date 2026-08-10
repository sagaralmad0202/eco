const prisma = require("../../lib/prisma");
const ApiError = require("../../utils/ApiError");

// Every function takes userId and filters on it. Looking a row up by id alone
// and checking ownership afterwards is how one customer ends up able to read
// another's address by guessing a uuid — so ownership is part of the WHERE
// clause, not an if-statement after the fact.

async function listAddresses(userId) {
  return prisma.address.findMany({
    where: { userId },
    // Default first, then newest. The checkout form preselects [0].
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

async function getAddress(userId, id) {
  const address = await prisma.address.findFirst({ where: { id, userId } });

  // 404 rather than 403 for someone else's address: a 403 confirms the row
  // exists, which is information the caller has no right to.
  if (!address) throw ApiError.notFound("Address not found");

  return address;
}

async function createAddress(userId, data) {
  const count = await prisma.address.count({ where: { userId } });

  // A cap keeps one account from being used as free storage, and 20 is far
  // past what a real customer needs.
  if (count >= 20) {
    throw ApiError.badRequest(
      "You have reached the maximum of 20 saved addresses"
    );
  }

  // The first address a customer saves becomes their default whether they
  // asked or not, so checkout always has something preselected.
  const isDefault = data.isDefault || count === 0;

  return prisma.$transaction(async (tx) => {
    if (isDefault) {
      await tx.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return tx.address.create({ data: { ...data, userId, isDefault } });
  });
}

async function updateAddress(userId, id, data) {
  // Confirms ownership before anything is written.
  await getAddress(userId, id);

  return prisma.$transaction(async (tx) => {
    // Clearing the old default and setting the new one must be atomic,
    // otherwise a crash between them leaves the account with two defaults
    // (or none) and checkout picks arbitrarily.
    if (data.isDefault === true) {
      await tx.address.updateMany({
        where: { userId, isDefault: true, NOT: { id } },
        data: { isDefault: false },
      });
    }

    return tx.address.update({ where: { id }, data });
  });
}

async function deleteAddress(userId, id) {
  const address = await getAddress(userId, id);

  await prisma.$transaction(async (tx) => {
    await tx.address.delete({ where: { id } });

    // Deleting the default promotes the next most recent one, so the account
    // never ends up with addresses but no default.
    if (address.isDefault) {
      const next = await tx.address.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      if (next) {
        await tx.address.update({
          where: { id: next.id },
          data: { isDefault: true },
        });
      }
    }
  });
}

// Orders copy address fields rather than linking to them, so this is what
// checkout reads. Deleting an address later must not rewrite past invoices.
async function getDefaultAddress(userId) {
  return prisma.address.findFirst({
    where: { userId, isDefault: true },
  });
}

module.exports = {
  listAddresses,
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  getDefaultAddress,
};
