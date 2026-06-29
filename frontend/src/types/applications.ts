export interface CareerApplication {
  id: string;
  company: string;
  role: string;
  date: string;
  status: 'Wishlist' | 'Applied' | 'OA' | 'Interview' | 'HR' | 'Offer' | 'Rejected' | 'Ghosted';
  salary: string;
}
