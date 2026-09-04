import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { mapDbPostToUiPost } from "@/lib/mappers/post-mapper";
import { DateSeparator } from "@/components/feed/DateSeparator";
import { FeedHeader } from "@/components/feed/FeedHeader";
import { NewPostPrompt } from "@/components/feed/NewPostPrompt";
import { RealtimePostsProvider } from "@/components/feed/RealtimePostsProvider";

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: currentUser } = await supabase
    .from("users")
    .select("id, daycare_id")
    .eq("id", user.id)
    .single();

  if (!currentUser) {
    redirect("/login");
  }

  const { count: childrenCount } = await supabase
    .from("children")
    .select("id", { count: "exact", head: true })
    .eq("status", "active");

  const { data: posts } = await supabase
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
    .order("published_at", { ascending: false })
    .limit(50);

  const mappedPosts = (posts || []).map((post) =>
    mapDbPostToUiPost(post, user.id)
  );

  const today = new Date();
  const dateLabel = today.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="mx-auto w-full max-w-[760px] px-10 pb-20 pt-[84px] lg:pt-[34px]">
      <FeedHeader
        kidsCount={childrenCount || 0}
        dateLabel={dateLabel}
      />
      <NewPostPrompt />
      <DateSeparator label="PUBLICADO HOY" />
      <RealtimePostsProvider
        initialPosts={mappedPosts}
        currentUserId={user.id}
      />
    </div>
  );
}
