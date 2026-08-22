type KidInfoCardProps = {
  birthDate: string;
  room: string;
  admissionDate: string;
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-[15px] px-[18px]">
      <span className="text-[14.5px] text-[#94887B]">{label}</span>
      <span className="text-[14.5px] font-extrabold text-[#3F362E]">
        {value}
      </span>
    </div>
  );
}

export function KidInfoCard({ birthDate, room, admissionDate }: KidInfoCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#ECE0D0] bg-[#FFFDF9]">
      <InfoRow label="Fecha de nacimiento" value={birthDate} />
      <div className="h-[1px] bg-[#F0E6D8]" />
      <InfoRow label="Sala" value={room} />
      <div className="h-[1px] bg-[#F0E6D8]" />
      <InfoRow label="Ingreso" value={admissionDate} />
    </div>
  );
}
