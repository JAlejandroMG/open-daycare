export type PostType = "achievement" | "activity" | "announcement";

export type Post = {
  id: string;
  type: PostType;
  childName: string;
  childInitial: string;
  avatarBackgroundColor: string;
  avatarTextColor: string;
  publishedAt: string;
  authorName: string;
  isAuthor: boolean;
  recipient: string;
  content: string;
  photoPlaceholder?: string;
  likesCount: number;
  commentsCount: number;
};

export type CurrentUser = {
  name: string;
  role: string;
  room: string;
  initial: string;
};