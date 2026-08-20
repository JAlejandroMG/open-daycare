import type { Post } from "@/lib/_data/types";
import { PostActions } from "./post/PostActions";
import { PostBody } from "./post/PostBody";
import { PostHeader } from "./post/PostHeader";

type PostCardProps = {
  post: Post;
};

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="rounded-[20px] border border-border-soft bg-sidebar p-[20px] shadow-[0_4px_16px_-12px_rgba(120,90,60,0.5)]">
      <PostHeader post={post} />
      <PostBody post={post} />
      <PostActions post={post} />
    </article>
  );
}