export type UserRole = 'admin' | 'owner' | 'tenant' | 'roommate_seeker';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  verified: boolean;
  createdAt: Date;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  rent: number;
  location: string;
  city: string;
  sharingType: 'single' | 'double' | 'triple' | 'dormitory';
  facilities: string[];
  images: string[];
  ownerId: string;
  ownerName: string;
  status: 'pending' | 'approved' | 'rejected';
  verified: boolean;
  createdAt: Date;
  availableFrom: Date;
}

export interface RoommateRequest {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  budget: number;
  preferredLocation: string;
  sharingType: 'single' | 'double' | 'triple' | 'any';
  status: 'active' | 'closed';
  createdAt: Date;
}

export interface ContactRequest {
  id: string;
  listingId: string;
  listingTitle: string;
  fromUserId: string;
  fromUserName: string;
  fromUserEmail: string;
  toOwnerId: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}
