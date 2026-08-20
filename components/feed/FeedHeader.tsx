import { currentUser } from "@/lib/_data/mock-data";

type FeedHeaderProps = {
  kidsCount: number;
  dateLabel: string;
};

export function FeedHeader({ kidsCount, dateLabel }: FeedHeaderProps) {
  return (
    <div className="mb-6">
      <p className="mb-1 text-[12.5px] font-extrabold tracking-[0.8px] text-[#D9583C]">
        GUARDERÍA · {currentUser.room.toUpperCase()}
      </p>
      <h1 className="m-0 font-heading text-[30px] font-semibold text-foreground">
        Buenas, {currentUser.name.split(" ")[0]}
      </h1>
      <p className="mt-[5px] text-[14.5px] text-text-secondary">
        {kidsCount} niños · {dateLabel}
      </p>
    </div>
  );
}