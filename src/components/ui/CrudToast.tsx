import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";

export type CrudToastVariant = "success" | "error" | "info";

export function CrudToast({ message, variant = "success", onClose }: { message: string; variant?: CrudToastVariant; onClose?: () => void }) {
  const styles = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-red-200 bg-red-50 text-red-800",
    info: "border-blue-200 bg-blue-50 text-blue-800",
  };
  const Icon = variant === "success" ? CheckCircle2 : variant === "error" ? CircleAlert : Info;
  return <div className={`fixed right-4 top-4 z-[70] flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg ${styles[variant]}`} role="status">
    <Icon size={18} className="mt-0.5 shrink-0" /><span className="flex-1">{message}</span>
    {onClose && <button type="button" onClick={onClose} className="shrink-0 opacity-70 hover:opacity-100" aria-label="Fermer"><X size={16} /></button>}
  </div>;
}
