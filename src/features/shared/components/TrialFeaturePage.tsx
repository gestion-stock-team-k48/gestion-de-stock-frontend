import { useMemo, useState } from "react";
import type { ElementType, FormEvent } from "react";
import {
  CheckCircle2,
  Clock3,
  Edit3,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";

type Status = "active" | "pending" | "archived";

type DemoRow = {
  id: number;
  reference: string;
  name: string;
  quantity: string;
  amount: string;
  status: Status;
};

type TrialFeaturePageProps = {
  pageKey: string;
  icon: ElementType;
};

const initialRows: DemoRow[] = [
  {
    id: 1,
    reference: "GST-001",
    name: "demo.rows.first",
    quantity: "24",
    amount: "125 000 FCFA",
    status: "active",
  },
  {
    id: 2,
    reference: "GST-002",
    name: "demo.rows.second",
    quantity: "8",
    amount: "48 500 FCFA",
    status: "pending",
  },
  {
    id: 3,
    reference: "GST-003",
    name: "demo.rows.third",
    quantity: "16",
    amount: "92 750 FCFA",
    status: "archived",
  },
];

const statusStyles = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  archived: "border-gray-200 bg-gray-50 text-gray-600",
};

export function TrialFeaturePage({ pageKey, icon: Icon }: TrialFeaturePageProps) {
  const { t } = useTranslation();
  const [rows, setRows] = useState<DemoRow[]>(initialRows);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | Status>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draftName, setDraftName] = useState("");

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return rows.filter((row) => {
      const translatedName = t(`workspace.${row.name}`).toLowerCase();
      const matchesQuery =
        !normalizedQuery ||
        row.reference.toLowerCase().includes(normalizedQuery) ||
        translatedName.includes(normalizedQuery);
      const matchesStatus = status === "all" || row.status === status;

      return matchesQuery && matchesStatus;
    });
  }, [query, rows, status, t]);

  const totals = {
    active: rows.filter((row) => row.status === "active").length,
    pending: rows.filter((row) => row.status === "pending").length,
    archived: rows.filter((row) => row.status === "archived").length,
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = draftName.trim();
    if (!trimmedName) {
      return;
    }

    setRows((currentRows) => [
      {
        id: Date.now(),
        reference: `GST-${String(currentRows.length + 1).padStart(3, "0")}`,
        name: trimmedName,
        quantity: "1",
        amount: "0 FCFA",
        status: "pending",
      },
      ...currentRows,
    ]);
    setDraftName("");
    setIsModalOpen(false);
  };

  const resolveName = (name: string) =>
    name.startsWith("demo.") ? t(`workspace.${name}`) : name;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#0066FF]">
            <Icon size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-950 sm:text-3xl">
              {t(`workspace.pages.${pageKey}.title`)}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {t(`workspace.pages.${pageKey}.subtitle`)}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-[#0066FF] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0052CC]"
        >
          <Plus size={16} />
          {t("workspace.actions.add")}
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {(["active", "pending", "archived"] as Status[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setStatus(item)}
            className={`rounded-lg border bg-white p-4 text-left shadow-sm transition-colors ${
              status === item ? "border-blue-200" : "border-gray-200"
            }`}
          >
            <span className="text-sm font-medium text-gray-500">
              {t(`workspace.status.${item}`)}
            </span>
            <span className="mt-2 block text-3xl font-bold text-gray-950">
              {totals[item]}
            </span>
          </button>
        ))}
      </div>

      <section className="mt-8 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-950">
              {t("workspace.list.title")}
            </h2>
            <p className="text-sm text-gray-500">
              {t("workspace.list.subtitle")}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex h-10 min-w-0 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-400 sm:w-72">
              <Search size={15} />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                placeholder={t("workspace.actions.search")}
              />
            </label>

            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as "all" | Status)
              }
              className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 outline-none focus:border-blue-500"
            >
              <option value="all">{t("workspace.status.all")}</option>
              <option value="active">{t("workspace.status.active")}</option>
              <option value="pending">{t("workspace.status.pending")}</option>
              <option value="archived">{t("workspace.status.archived")}</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-5 py-3 font-bold">
                  {t("workspace.table.reference")}
                </th>
                <th className="px-5 py-3 font-bold">
                  {t("workspace.table.name")}
                </th>
                <th className="px-5 py-3 text-right font-bold">
                  {t("workspace.table.quantity")}
                </th>
                <th className="px-5 py-3 text-right font-bold">
                  {t("workspace.table.amount")}
                </th>
                <th className="px-5 py-3 font-bold">
                  {t("workspace.table.status")}
                </th>
                <th className="px-5 py-3 text-right font-bold">
                  {t("workspace.table.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRows.map((row) => (
                <tr key={row.id}>
                  <td className="px-5 py-4 font-mono text-xs font-semibold text-gray-500">
                    {row.reference}
                  </td>
                  <td className="px-5 py-4 font-semibold text-gray-900">
                    {resolveName(row.name)}
                  </td>
                  <td className="px-5 py-4 text-right font-semibold text-gray-700">
                    {row.quantity}
                  </td>
                  <td className="px-5 py-4 text-right font-semibold text-gray-700">
                    {row.amount}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[row.status]}`}
                    >
                      {row.status === "active" ? (
                        <CheckCircle2 size={13} />
                      ) : (
                        <Clock3 size={13} />
                      )}
                      {t(`workspace.status.${row.status}`)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:border-blue-200 hover:text-[#0066FF]"
                        aria-label={t("workspace.actions.edit")}
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setRows((currentRows) =>
                            currentRows.filter((item) => item.id !== row.id)
                          )
                        }
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:border-red-200 hover:text-red-500"
                        aria-label={t("workspace.actions.delete")}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRows.length === 0 && (
          <div className="px-5 py-12 text-center text-sm text-gray-500">
            {t("workspace.list.empty")}
          </div>
        )}
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 px-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-950">
                  {t("workspace.modal.title")}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {t("workspace.modal.subtitle")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50"
                aria-label={t("buttons.cancel")}
              >
                <X size={17} />
              </button>
            </div>

            <label className="mt-5 block text-[11px] font-bold uppercase tracking-wider text-gray-500">
              {t("workspace.table.name")}
            </label>
            <input
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              className="mt-1.5 h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-500"
              placeholder={t("workspace.modal.placeholder")}
            />

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-10 rounded-lg border border-gray-200 px-4 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
              >
                {t("buttons.cancel")}
              </button>
              <button
                type="submit"
                className="h-10 rounded-lg bg-[#0066FF] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0052CC]"
              >
                {t("buttons.add")}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default TrialFeaturePage;
