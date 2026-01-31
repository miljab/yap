import { type User } from "./user";

export type Post = {
  id: string;
  content: string;
  createdAt: Date;
  user: User;
  images: Image[];
  comments: Comment[];
  likes: Like[];
  isLiked: boolean;
  likeCount: number;
  commentCount: number;
  history: PostHistory[];
};

export type PostHistory = {
  id: string;
  postId: string;
  content?: string;
  createdAt: Date;
};

export type Comment = {
  id: string;
  postId: string;
  parentId: string;
  content: string;
  createdAt: Date;
  user: User;
  images: Image[];
  replies: Comment[];
  isLiked: boolean;
  likeCount: number;
  commentCount: number;
};

export type Like = {
  id: string;
  createdAt: Date;
  user: User;
  postId?: string;
  commentId?: string;
};

export type Image = {
  id: string;
  url: string;
  orderIndex: number;
  postId?: string;
  commentId?: string;
};
