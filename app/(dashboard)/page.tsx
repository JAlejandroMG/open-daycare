import { posts } from "@/lib/_data/mock-data";
import { DateSeparator } from "@/components/feed/DateSeparator";
import { FeedHeader } from "@/components/feed/FeedHeader";
import { NewPostPrompt } from "@/components/feed/NewPostPrompt";
import { PostCard } from "@/components/feed/PostCard";

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-[760px] px-10 pb-20 pt-[84px] lg:pt-[34px]">
      <FeedHeader kidsCount={12} dateLabel="martes 17 jun" />
      <NewPostPrompt />
      <DateSeparator label="PUBLICADO HOY" />
      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
