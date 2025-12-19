export interface User {
  _id: string;
  username: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthenticatedUser extends User {
  token: string;
}
