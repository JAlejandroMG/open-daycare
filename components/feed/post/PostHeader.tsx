import type { Post } from "@/lib/_data/types";
import { PostTypeBadge } from "./PostTypeBadge";

type PostHeaderProps = {
  post: Post;
};

export function PostHeader({ post }: PostHeaderProps) {
  return (
    <div className="mb-[14px] flex items-center gap-3">
      <span
        className={`flex h-11 w-11 flex-none items-center justify-center rounded-full font-heading text-[17px] font-semibold ${post.avatarBackgroundColor} ${post.avatarTextColor}`}
      >
        {post.childInitial}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-heading text-[16.5px] font-semibold text-foreground">
          {post.childName}
        </span>
        <span className="block text-[12.5px] text-text-muted">
          {post.publishedAt} · {post.isAuthor ? "publicado por vos" : post.authorName}
        </span>
      </span>
      <PostTypeBadge type={post.type} />
    </div>
  );
}