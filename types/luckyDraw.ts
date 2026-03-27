export interface Campaign {
  id: number;
  name: string;
  description: string;
  image: string | null;
  startDate: string;
  endDate: string;
  status: string;
}