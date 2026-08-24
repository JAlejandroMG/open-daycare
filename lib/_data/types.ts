export type PostType =
  | "achievement"
  | "activity"
  | "announcement"
  | "food"
  | "nap"
  | "cheer"
  | "picture";

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

export type Parent = {
  id: string;
  name: string;
  initial: string;
  relation: string;
  status: "active" | "pending";
  avatarBackgroundColor: string;
};

export type Kid = {
  id: string;
  name: string;
  initial: string;
  age: string;
  room: string;
  birthDate: string;
  admissionDate: string;
  linkedParents: number;
  allergy?: string;
  allergyNote?: string;
  parents: Parent[];
  avatarBackgroundColor: string;
  avatarTextColor: string;
};