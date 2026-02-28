export type User = {
  id: string;
  username: string;
  email?: string;
  createdAt: Date;
  avatarUrl: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
  isFollowed: boolean;
};

export type OnboardingUser = {
  id: string;
  email?: string;
  createdAt: Date;
  avatarUrl: string;
};
