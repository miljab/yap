export type User = {
  id: string;
  username: string;
  email?: string;
  createdAt: Date;
  avatar: string;
  bio?: string;
};

export type OnboardingUser = {
  id: string;
  email?: string;
  createdAt: Date;
  avatar: string;
};
