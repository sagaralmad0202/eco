const prisma = require("../../lib/prisma");
const ApiError = require("../../utils/ApiError");
const publicMediaUrl = require("../../utils/publicMediaUrl");

// The exact columns the account page is allowed to see. An explicit select
// rather than returning the row: `findUnique` with no select would hand
// passwordHash to the client, and a select is the only version of this that
// stays safe when someone adds a sensitive column to User later.
const PROFILE_SELECT = {
  id: true,
  email: true,
  fullName: true,
  phone: true,
  dateOfBirth: true,
  gender: true,
  address: true,
  aboutYou: true,
  avatarUrl: true,
  role: true,
  emailVerifiedAt: true,
  createdAt: true,
  updatedAt: true,
};

// Shapes a user row for the client.
//
// dateOfBirth is serialised as yyyy-MM-dd, not ISO. The column is DATE and the
// form field is <input type="date">, which only accepts that format — handing it
// a full timestamp makes the input render empty with no error anywhere.
//
// The date parts are read in UTC deliberately. Prisma returns a DATE as
// midnight UTC, so formatting it in the server's local timezone would shift it
// to the previous day anywhere west of Greenwich.
function toProfileResponse(user) {
  return {
    ...user,
    dateOfBirth: user.dateOfBirth
      ? user.dateOfBirth.toISOString().slice(0, 10)
      : null,
    // Stored avatars may be a bare path from an upload or an absolute URL from
    // an external provider. Resolving here means the client never has to guess
    // which it received.
    avatarUrl: publicMediaUrl(user.avatarUrl),
  };
}

async function getProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: PROFILE_SELECT,
  });

  // Reachable in practice: the access token outlives the row if the account is
  // deleted mid-session, and the token stays cryptographically valid until it
  // expires.
  if (!user) throw ApiError.notFound("Account not found");

  return toProfileResponse(user);
}

async function updateProfile(userId, data) {
  // zod has already stripped unknown keys, so anything still undefined was
  // genuinely omitted by the client. Dropping those keeps Prisma from writing
  // NULL over a column the customer never touched — the difference between
  // "left the field alone" and "cleared the field".
  const changes = Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined),
  );

  if (Object.keys(changes).length === 0) {
    throw ApiError.badRequest("Provide at least one field to update");
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: changes,
      select: PROFILE_SELECT,
    });

    return toProfileResponse(user);
  } catch (err) {
    // phone is @unique, so a number already on another account arrives here as
    // P2002. Left alone it would surface as a 500, telling the customer the
    // server is broken when the fix is theirs to make.
    if (err.code === "P2002") {
      throw ApiError.conflict("That phone number is already in use");
    }

    // The row vanished between the token check and this write.
    if (err.code === "P2025") {
      throw ApiError.notFound("Account not found");
    }

    throw err;
  }
}

module.exports = { getProfile, updateProfile, PROFILE_SELECT };
