import { kids } from "@/lib/_data/mock-data";
import { notFound } from "next/navigation";
import Link from "next/link";
import { KidProfileHeader } from "@/components/kids/profile/KidProfileHeader";
import { KidAllergyAlert } from "@/components/kids/profile/KidAllergyAlert";
import { KidInfoCard } from "@/components/kids/profile/KidInfoCard";
import { ParentsList } from "@/components/kids/profile/ParentsList";
import { DailySummaryButton } from "@/components/kids/profile/DailySummaryButton";
import { KidProfileClient } from "@/components/kids/profile/KidProfileClient";

type KidProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function KidProfilePage({ params }: KidProfilePageProps) {
  const { id } = await params;
  const kid = kids.find((k) => k.id === id);

  if (!kid) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-[820px] px-10 pb-20 pt-[34px]">
      <Link
        href="/kids"
        className="mb-5 flex items-center gap-[7px] text-[14px] font-bold text-[#94887B]"
      >
        <svg
          className="h-[18px] w-[18px]"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Volver a Niños
      </Link>

      <div className="flex flex-wrap gap-6">
        <div className="flex min-w-[300px] flex-1 flex-col gap-[18px]">
          <KidProfileHeader kid={kid} />

          {kid.allergy && kid.allergyNote && (
            <KidAllergyAlert note={kid.allergyNote} />
          )}

          <KidInfoCard
            birthDate={kid.birthDate}
            room={kid.room}
            admissionDate={kid.admissionDate}
          />
        </div>

        <div className="flex w-[300px] flex-none flex-col gap-[14px]">
          <DailySummaryButton />
          <ParentsList parents={kid.parents}>
            <KidProfileClient kid={kid} />
          </ParentsList>
        </div>
      </div>
    </div>
  );
}
