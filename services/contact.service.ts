import axios from '@/lib/axios';
import { ContactPayload, ContactResponse } from '@/types/contact';

export const sendContactForm = async (
  data: ContactPayload
): Promise<ContactResponse> => {
  const response = await axios.post('/v1/contact-us', data);
  return response.data;
};