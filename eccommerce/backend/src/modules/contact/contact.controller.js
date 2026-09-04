const asyncHandler = require("../../utils/asyncHandler");
const contactService = require("./contact.service");

const submitContactMessage = asyncHandler(async (req, res) => {
  // Never trust userId from request body; strictly use the authenticated session/token user ID if present
  const userId = req.user?.id || null;
  const { fullName, email, message } = req.body;

  await contactService.createContactMessage({
    fullName,
    email,
    message,
    userId,
  });

  res
    .status(201)
    .json({ success: true, message: "Your message has been sent successfully." });
});

module.exports = { submitContactMessage };
