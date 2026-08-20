import { POST_TYPE_CONFIG } from "@/lib/_data/post-type-config";
import type { PostType } from "@/lib/_data/types";

type PostTypeBadgeProps = {
  type: PostType;
};

export function PostTypeBadge({ type }: PostTypeBadgeProps) {
  const { label, badgeClassName, dotClassName } = POST_TYPE_CONFIG[type];

  return (
    <span
      className={`flex items-center gap-[7px] rounded-full px-3 py-1.5 ${badgeClassName}`}
    >
      <span className={`h-2 w-2 rounded-full ${dotClassName}`} />
      <span className="text-xs font-extrabold tracking-[0.5px]">{label}</span>
    </span>
  );
}