"use client";

import { useState } from "react";
import type { Kid } from "@/lib/_data/types";
import { KidsHeader } from "./KidsHeader";
import { KidSearch } from "./KidSearch";
import { AddKidModal } from "./AddKidModal";

type KidsPageClientProps = {
  initialKids: Kid[];
};

export function KidsPageClient({ initialKids }: KidsPageClientProps) {
  const [kids, setKids] = useState<Kid[]>(initialKids);
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleAddKid(kid: Kid) {
    setKids((prev) => [...prev, kid]);
  }

  return (
    <>
      <KidsHeader onAddClick={() => setIsModalOpen(true)} />
      <KidSearch kids={kids} />
      <AddKidModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddKid={handleAddKid}
      />
    </>
  );
}
