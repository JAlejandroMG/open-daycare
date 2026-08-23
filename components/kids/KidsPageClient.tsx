"use client";

import { useState } from "react";
import type { Kid } from "@/lib/_data/types";
import { kids as mockKids } from "@/lib/_data/mock-data";
import { KidsHeader } from "./KidsHeader";
import { KidSearch } from "./KidSearch";
import { AddKidModal } from "./AddKidModal";

export function KidsPageClient() {
  const [kids, setKids] = useState<Kid[]>([...mockKids]);
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
