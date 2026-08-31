"use client";

import { useState } from "react";
import type { Kid } from "@/lib/_data/types";
import { KidsHeader } from "./KidsHeader";
import { KidSearch } from "./KidSearch";
import { AddKidModal } from "./AddKidModal";

type Room = {
  id: string;
  name: string;
};

type KidsPageClientProps = {
  initialKids: Kid[];
  rooms: Room[];
};

export function KidsPageClient({ initialKids, rooms }: KidsPageClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <KidsHeader onAddClick={() => setIsModalOpen(true)} />
      <KidSearch kids={initialKids} />
      <AddKidModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        rooms={rooms}
      />
    </>
  );
}
