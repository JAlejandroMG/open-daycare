"use client";

import { useEffect, useState } from "react";
import type { Post } from "@/lib/_data/types";
import { createClient } from "@/utils/supabase/client";
import { mapDbPostToUiPost } from "@/lib/mappers/post-mapper";
import { PostCard } from "./PostCard";

type RealtimePostsProviderProps = {
  initialPosts: Post[];
  currentUserId: string;
};

export function RealtimePostsProvider({
  initialPosts,
  currentUserId,
}: RealtimePostsProviderProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("posts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "posts",
        },
        async (payload) => {
          const { data: newPost } = await supabase
            .from("posts")
            .select(
              `
              id,
              type,
              title,
              body,
              published_at,
              author_id,
              users!posts_author_id_fkey!inner(id, full_name),
              post_children(
                child_id,
                children(id, full_name)
              ),
              post_photos(url, position),
              reactions(id),
              comments(id)
            `
            )
            .eq("id", payload.new.id)
            .single();

          if (newPost) {
            const mappedPost = mapDbPostToUiPost(newPost, currentUserId);
            setPosts((prev) => {
              const exists = prev.some((p) => p.id === mappedPost.id);
              if (exists) return prev;
              return [mappedPost, ...prev];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
