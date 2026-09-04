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
      {post.photos.length > 0 ? (
        <div className="mt-[14px] grid grid-cols-2 gap-2">
          {post.photos.map((photo, index) => (
            <img
              key={index}
              src={photo}
              alt={`Foto ${index + 1}`}
              className="h-[200px] w-full rounded-2xl object-cover"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}