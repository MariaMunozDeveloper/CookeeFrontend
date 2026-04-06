export interface User {
  _id?: string;
  name: string;
  surname: string;
  nick: string;
  email: string;
  password?: string;
  role?: string;
  image?: string | null;
  privacy?: 'public' | 'private' | 'friends';
  createdAt?: string;
  updatedAt?: string;
}
