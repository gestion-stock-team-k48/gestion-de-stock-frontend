import { Plus } from "lucide-react";

export function AddEntityButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-[#0066FF] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0052CC]">
      <Plus size={16} />
      {label}
    </button>
  );
}
