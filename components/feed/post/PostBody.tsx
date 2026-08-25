import type { Post } from "@/lib/_data/types";

type PostBodyProps = {
  post: Post;
};

export function PostBody({ post }: PostBodyProps) {
  return (
    <div>
      <p className="mb-[10px] text-[12.5px] text-text-muted">
        Para: {post.recipients.join(", ")}
      </p>
      <p className="m-0 text-[15.5px] leading-[1.55] text-text-body">
        {post.content}
      </p>
      {post.photoPlaceholder ? (
        <span className="mt-[14px] flex h-[200px] flex-col items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-[#DBCDBA] bg-[#F4ECE1] text-[#B0A290]">
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.6-3.6a2 2 0 0 0-2.8 0L6 21" />
          </svg>
          <span className="text-[13.5px]">{post.photoPlaceholder}</span>
        </span>
      ) : null}
    </div>
  );
}