import type { Post } from "@/lib/_data/types";
import { PostTypeBadge } from "./PostTypeBadge";

type PostHeaderProps = {
  post: Post;
};

export function PostHeader({ post }: PostHeaderProps) {
  return (
    <div className="mb-[14px] flex items-center gap-3">
      <div className="flex -space-x-2">
        {post.childInitials.map((initial, i) => (
          <span
            key={i}
            className={`flex h-8 w-8 flex-none items-center justify-center rounded-full border-2 border-white font-heading text-[13px] font-semibold ${post.avatarBackgroundColors[i]} ${post.avatarTextColors[i]}`}
          >
            {initial}
          </span>
        ))}
      </div>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-heading text-[16.5px] font-semibold text-foreground">
          {post.childNames.join(", ")}
        </span>
        <span className="block text-[12.5px] text-text-muted">
          {post.publishedAt} · {post.isAuthor ? "publicado por vos" : post.authorName}
        </span>
      </span>
      <PostTypeBadge type={post.type} />
    </div>
  );
}
