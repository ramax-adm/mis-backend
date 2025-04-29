export type User = {
  id: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
};
