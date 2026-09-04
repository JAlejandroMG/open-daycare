export type PostType =
  | "achievement"
  | "activity"
  | "announcement"
  | "meal"
  | "nap"
  | "cheer"
  | "photo";

export type Post = {
  id: string;
  type: PostType;
  childNames: string[];
  childInitials: string[];
  avatarBackgroundColors: string[];
  avatarTextColors: string[];
  publishedAt: string;
  authorName: string;
  isAuthor: boolean;
  recipients: string[];
  content: string;
  photos: string[];
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