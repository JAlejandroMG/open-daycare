import type { Post, PostType } from "@/lib/_data/types";
import { getAvatarColors } from "@/lib/utils/avatar-colors";

type DbUser = {
  id: string;
  full_name: string;
};

type DbChild = {
  id: string;
  full_name: string;
};

type DbPost = {
  id: string;
  type: PostType;
  title: string | null;
  body: string;
  published_at: string;
  author_id: string;
  users: DbUser | DbUser[] | null;
  post_children: {
    child_id: string;
    children: DbChild | DbChild[] | null;
  }[];
  post_photos: {
    url: string;
    position: number;
  }[];
  reactions: {
    id: string;
  }[];
  comments: {
    id: string;
  }[];
};

function getFirstName(name: string): string {
  return name.split(" ")[0];
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function getUser(user: DbUser | DbUser[] | null): DbUser | null {
  if (!user) return null;
  if (Array.isArray(user)) return user[0] || null;
  return user;
}

function getChild(child: DbChild | DbChild[] | null): DbChild | null {
  if (!child) return null;
  if (Array.isArray(child)) return child[0] || null;
  return child;
}

export function mapDbPostToUiPost(
  dbPost: DbPost,
  currentUserId: string
): Post {
  const author = getUser(dbPost.users);

  const childNames = dbPost.post_children
    .filter((pc) => getChild(pc.children) !== null)
    .map((pc) => getFirstName(getChild(pc.children)!.full_name));

  const childInitials = dbPost.post_children
    .filter((pc) => getChild(pc.children) !== null)
    .map((pc) => getChild(pc.children)!.full_name.charAt(0).toUpperCase());

  const avatarBackgroundColors = dbPost.post_children
    .filter((pc) => getChild(pc.children) !== null)
    .map((pc) => {
      const colors = getAvatarColors(pc.child_id);
      return colors.bg;
    });

  const avatarTextColors = dbPost.post_children
    .filter((pc) => getChild(pc.children) !== null)
    .map((pc) => {
      const colors = getAvatarColors(pc.child_id);
      return colors.text;
    });

  const isAnnouncement = dbPost.type === "announcement";
  const recipients = isAnnouncement
    ? ["toda la sala"]
    : dbPost.post_children
        .filter((pc) => getChild(pc.children) !== null)
        .map(
          (pc) => `familia de ${getFirstName(getChild(pc.children)!.full_name)}`
        );

  const photos = dbPost.post_photos
    .sort((a, b) => a.position - b.position)
    .map((p) => p.url);

  return {
    id: dbPost.id,
    type: dbPost.type,
    childNames:
      childNames.length > 0 ? childNames : [isAnnouncement ? "Anuncio general" : ""],
    childInitials:
      childInitials.length > 0
        ? childInitials
        : [isAnnouncement ? "A" : ""],
    avatarBackgroundColors:
      avatarBackgroundColors.length > 0
        ? avatarBackgroundColors
        : [isAnnouncement ? "bg-[#CCD8F4]" : "bg-[#A9D9E8]"],
    avatarTextColors:
      avatarTextColors.length > 0
        ? avatarTextColors
        : [isAnnouncement ? "text-[#4E72C8]" : "text-[#1F7A93]"],
    publishedAt: formatTime(dbPost.published_at),
    authorName: author?.full_name || "Usuario",
    isAuthor: dbPost.author_id === currentUserId,
    recipients,
    content: dbPost.body,
    photos,
    likesCount: dbPost.reactions?.length || 0,
    commentsCount: dbPost.comments?.length || 0,
  };
}
