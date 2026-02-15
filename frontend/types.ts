
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  COMPANY_OWNER = 'COMPANY_OWNER',
  AGENT = 'AGENT'
}

export type TabType = 
  | 'Dashboard'
  | 'Announcements'
  | 'Contacts'
  | 'Conversations'
  | 'Pain Tracker'
  | 'Personal Tracker'
  | 'Company Arena'
  | 'Lead Designation'
  | 'Company Help Tab'
  | 'Subscription Tracker'
  | 'Lead Assign Tracker'
  | 'Ghost Mode'
  | 'Auto Dialer'
  | 'Live Calls'
  | 'Team Performance'
  | 'Company Management'
  | 'Team Management'
  | 'Campaign Management'
  | 'Phantom Mode'
  | 'Number Registry';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  companyId: string;
  avatar?: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  status: string;
  type: string;
  assignedTo: string;
}

// Added missing Announcement interface
export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
}
