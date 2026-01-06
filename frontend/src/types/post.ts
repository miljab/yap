import { type User } from "./user";

export type Post = {
  id: string;
  content: string;
  createdAt: Date;
  user: User;
  images: Image[];
  comments: Comment[];
  likes: Like[];
};

export type Comment = {
  id: string;
  content: string;
  createdAt: Date;
  author: User;
};

export type Like = {
  id: string;
  createdAt: Date;
  author: User;
};

export type Image = {
  id: string;
  url: string;
  orderIndex: number;
  postId?: string;
  commentId?: string;
};
