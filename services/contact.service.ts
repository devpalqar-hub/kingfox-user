import { api } from "@/lib/api";
import { ContactPayload, ContactResponse } from "@/types/contact";

export const sendContactForm = async (
  data: ContactPayload,
): Promise<ContactResponse> => {
  const response = await api.post("/v1/contact-us", data);
  return response.data;
};
