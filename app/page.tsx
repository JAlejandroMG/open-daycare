import { posts } from "@/lib/_data/mock-data";
import { DateSeparator } from "@/components/feed/DateSeparator";
import { FeedHeader } from "@/components/feed/FeedHeader";
import { NewPostPrompt } from "@/components/feed/NewPostPrompt";
import { PostCard } from "@/components/feed/PostCard";
import { Sidebar } from "@/components/feed/Sidebar";
import { SidebarDrawer } from "@/components/feed/SidebarDrawer";

export default function Home() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeItem="Feed" />
      <SidebarDrawer activeItem="Feed" />
      <main className="min-w-0 flex-1">
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
      </main>
    </div>
  );
}