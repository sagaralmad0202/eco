import api from "./api";

/**
 * Submit a contact form message.
 *
 * @param {{ fullName: string, email: string, message: string }} data
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function submitContactMessage(data) {
  const res = await api.post("/contact", data);
  return res.data;
}
