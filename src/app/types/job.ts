export interface Job {
  img?: string;
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary?: string;
  description: string;
  requirements: string[];
  benefits: string[];
  postedDate: string;
  deadline?: string;
  status: string;

}
