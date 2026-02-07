export type User = {
  id: string;
  username: string;
  email?: string;
  createdAt: Date;
  avatar: string;
  bio?: string;
  followers: User[];
  following: User[];
};

export type OnboardingUser = {
  id: string;
  email?: string;
  createdAt: Date;
  avatar: string;
};
