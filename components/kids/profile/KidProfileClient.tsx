"use client";

import { useState } from "react";
import type { Kid } from "@/lib/_data/types";
import { LinkParentButton } from "./LinkParentButton";
import { LinkParentModal } from "./LinkParentModal";

type KidProfileClientProps = {
  kid: Kid;
};

export function KidProfileClient({ kid }: KidProfileClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <LinkParentButton onClick={() => setIsModalOpen(true)} />
      <LinkParentModal
        childId={kid.id}
        kidName={kid.name}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
