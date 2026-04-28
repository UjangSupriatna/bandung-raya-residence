"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Building2,
  Loader2,
  ImageIcon,
  AlertCircle,
  X,
  ExternalLink,
} from "lucide-react";
import ImageUpload from "@/components/admin/image-upload";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ──── Types ────
interface Property {
  id: string;
  name: string;
  slug: string;
  type: string;
  category: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  landArea: number;
  buildingArea: number;
  status: string;
  description: string;
  features: string;
  images: string;
  tag: string;
  installment: string;
  financingTypes: string;
  dpOptions: string;
  tenorOptions: string;
  syariahMargin: number;
  kprDpOptions: string;
  kprTenorOptions: string;
  kprInstallments: string;
  kprInterestRate: number;
  kprInterestType: string;
  videoUrl: string;
  isFeatured: boolean;
  createdAt: string;
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  available: { label: "Tersedia", className: "bg-green-100 text-green-700" },
  sold: { label: "Terjual", className: "bg-red-100 text-red-700" },
  reserved: { label: "Dipesan", className: "bg-amber-100 text-amber-700" },
};

const CATEGORY_MAP: Record<string, string> = {
  inden: "Inden",
  kavling: "Kavling",
  siap_huni: "Siap Huni",
};

interface FormState {
  name: string; slug: string; type: string; category: string; price: string; location: string;
  bedrooms: string; bathrooms: string; landArea: string; buildingArea: string;
  status: string; description: string; isFeatured: boolean;
  tag: string; financingTypes: string;
  image: string; features: string;
  dpOptions: string; tenorOptions: string;
  syariahMargin: string;
  kprDpOptions: string; kprTenorOptions: string; kprInstallments: string;
  kprInterestRate: string;
  kprInterestType: string;
  videoUrl: string;
  landPricePerSqm: string;
}

const emptyForm: FormState = {
  name: "", slug: "", type: "", category: "", price: "", location: "",
  bedrooms: "2", bathrooms: "1", landArea: "", buildingArea: "",
  status: "available", description: "", isFeatured: false,
  tag: "", financingTypes: '["syariah","kpr"]',
  image: "", features: "",
  dpOptions: "30,35,40,45,50", tenorOptions: "1,2,3,4,5",
  syariahMargin: "15",
  kprDpOptions: "1000000,2000000,3000000,4000000,5000000", kprTenorOptions: "5,10,15,20,25", kprInstallments: "{}",
  kprInterestRate: "7.5",
  kprInterestType: "annuity",
  videoUrl: "",
  landPricePerSqm: "",
};

// ──── Helpers ────
function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID").format(price);
}
function formatRupiahShort(amount: number): string {
  if (amount >= 1_000_000_000) return (amount / 1_000_000_000).toFixed(1).replace('.0', '') + ' M';
  if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(0) + ' jt';
  if (amount >= 1_000) return (amount / 1_000).toFixed(0) + ' rb';
  return String(amount);
}
function parseImages(images: string): string[] {
  try { return JSON.parse(images); } catch { return []; }
}
function parseNumberList(s: string): number[] {
  return s.split(",").map((v) => parseInt(v.trim())).filter((n) => !isNaN(n) && n >= 0);
}
function parseJSONToCSV(s: string, fallback: string): string {
  try {
    const arr = JSON.parse(s);
    if (Array.isArray(arr)) return arr.join(",");
    return s || fallback;
  } catch { return s || fallback; }
}
// Parse features from DB to plain CSV text (handles both JSON array and plain CSV)
function parseFeaturesToCSV(s: string): string {
  try {
    const parsed = JSON.parse(s);
    if (Array.isArray(parsed)) return parsed.map(String).join(", ");
    if (typeof parsed === "string") return parsed;
    return "";
  } catch { return s || ""; }
}
function parseFinancingTypes(s: string): string[] {
  try { const arr = JSON.parse(s); return Array.isArray(arr) ? arr : ["syariah", "kpr"]; } catch { return ["syariah", "kpr"]; }
}
function parseInstallments(s: string): Record<string, Record<string, number>> {
  try { return JSON.parse(s); } catch { return {}; }
}
function buildInstallmentsJSON(dpList: number[], tenorList: number[], data: Record<string, Record<string, string>>): string {
  const result: Record<string, Record<string, number>> = {};
  for (const dp of dpList) {
    const dpKey = String(dp);
    result[dpKey] = {};
    for (const tenor of tenorList) {
      const tenorKey = String(tenor);
      const raw = data[dpKey]?.[tenorKey];
      if (raw && raw.trim() !== "") {
        const num = parseFloat(raw);
        if (!isNaN(num)) result[dpKey][tenorKey] = num;
      }
    }
  }
  return JSON.stringify(result);
}

// ──── Installment Grid Editor ────
function InstallmentGridEditor({
  dpOptions,
  tenorOptions,
  installments,
  onChange,
}: {
  dpOptions: string;
  tenorOptions: string;
  installments: string;
  onChange: (installments: string) => void;
}) {
  const dpList = parseNumberList(dpOptions);
  const tenorList = parseNumberList(tenorOptions);
  const parsed = parseInstallments(installments);

  // Flat data: gridData["30"]["5"] = "12.1"
  const [data, setData] = useState<Record<string, Record<string, string>>>({});
  const [prevKey, setPrevKey] = useState("");

  // Build grid from installments JSON + options (render-time state adjustment)
  const optionsKey = dpOptions + "|" + tenorOptions;
  let gridData = data;
  if (optionsKey !== prevKey) {
    setPrevKey(optionsKey);
    const prev = data || {};
    const d: Record<string, Record<string, string>> = {};
    for (const dp of dpList) {
      const dk = String(dp);
      d[dk] = {};
      for (const tenor of tenorList) {
        const tk = String(tenor);
        d[dk][tk] = prev[dk]?.[tk] || parsed[dk]?.[tk]?.toString() || "";
      }
    }
    setData(d);
    gridData = d;
  }

  const updateCell = (dp: string, tenor: string, value: string) => {
    setData((prev) => {
      const next = { ...prev, [dp]: { ...(prev[dp] || {}), [tenor]: value } };
      return next;
    });
  };

  const fillRow = (tenor: string) => {
    // Auto-fill row with the first non-empty value
    const tk = tenor;
    let firstVal = "";
    for (const dp of dpList) {
      if (gridData[String(dp)]?.[tk]?.trim()) {
        firstVal = gridData[String(dp)][tk];
        break;
      }
    }
    if (!firstVal) return;
    const newData = { ...gridData };
    for (const dp of dpList) {
      const dk = String(dp);
      newData[dk] = { ...(newData[dk] || {}), [tk]: firstVal };
    }
    setData(newData);
    onChange(buildInstallmentsJSON(dpList, tenorList, newData));
  };

  const clearAll = () => {
    const empty: Record<string, Record<string, string>> = {};
    for (const dp of dpList) {
      empty[String(dp)] = {};
      for (const tenor of tenorList) {
        empty[String(dp)][String(tenor)] = "";
      }
    }
    setData(empty);
    onChange("{}");
  };

  const handleBlur = () => {
    onChange(buildInstallmentsJSON(dpList, tenorList, gridData));
  };

  if (dpList.length === 0 || tenorList.length === 0) {
    return (
      <div className="text-sm text-gray-400 bg-gray-50 rounded-lg p-4 text-center">
        Isi DP Options dan Tenor Options terlebih dahulu
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Quick actions */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Isi tabel cicilan (jt/bln) — DP dalam rupiah:</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={() => {
            // Copy cheapest column (highest DP) to all
            const lastDp = String(dpList[dpList.length - 1]);
            const copyVal = gridData[lastDp];
            if (!copyVal) return;
            const newData = { ...gridData };
            for (const dp of dpList) {
              newData[String(dp)] = { ...copyVal };
            }
            setData(newData);
            onChange(buildInstallmentsJSON(dpList, tenorList, newData));
          }}
        >
          Copy kolom DP terendah → semua
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={clearAll}
        >
          Kosongkan
        </Button>
      </div>

      {/* Grid table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-3 py-2 text-xs font-semibold text-gray-500 text-left border-r border-gray-200 min-w-[90px]">
                DP (Rp) ↓ / Tenor →
              </th>
              {tenorList.map((t) => (
                <th key={t} className="px-2 py-2 text-xs font-semibold text-gray-600 text-center min-w-[85px]">
                  {t} thn
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dpList.map((dp) => (
              <tr key={dp} className="border-t border-gray-100 hover:bg-amber-50/30 transition-colors">
                <td className="px-3 py-1.5 font-semibold text-gray-700 text-xs border-r border-gray-200 bg-gray-50/80">
                  Rp {formatRupiahShort(dp)}
                </td>
                {tenorList.map((tenor) => {
                  const dk = String(dp);
                  const tk = String(tenor);
                  const val = gridData[dk]?.[tk] || "";
                  return (
                    <td key={tk} className="px-1 py-1 text-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={val}
                        onChange={(e) => updateCell(dk, tk, e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={(e) => {
                          if (e.key === "Tab" || e.key === "Enter") {
                            handleBlur();
                          }
                        }}
                        placeholder="—"
                        className="w-full h-8 text-center text-sm border border-gray-200 rounded-md focus:border-red-400 focus:ring-1 focus:ring-red-400 focus:outline-none bg-white transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-gray-400">
        Masukkan cicilan dalam <strong>juta rupiah per bulan</strong>. Data otomatis disimpan sebagai tabel cicilan KPR.
      </p>
    </div>
  );
}

// ──── Syariah Auto-Calculated Grid ────
function SyariahAutoGrid({
  price,
  dpOptions,
  tenorOptions,
  margin,
}: {
  price: number;
  dpOptions: string;
  tenorOptions: string;
  margin: number;
}) {
  const dpList = parseNumberList(dpOptions);
  const tenorList = parseNumberList(tenorOptions);

  const calcMonthly = (dp: number, tenor: number): number => {
    if (price <= 0 || margin <= 0 || tenor <= 0) return 0;
    const dpAmount = price * (dp / 100);
    const sellingPrice = price * (1 + margin / 100);
    const loanAmount = sellingPrice - dpAmount;
    return loanAmount / (tenor * 12);
  };

  if (!price || price <= 0) {
    return (
      <div className="text-sm text-gray-400 bg-gray-50 rounded-lg p-4 text-center">
        Masukkan harga properti terlebih dahulu untuk melihat perhitungan otomatis
      </div>
    );
  }

  if (dpList.length === 0 || tenorList.length === 0) {
    return (
      <div className="text-sm text-gray-400 bg-gray-50 rounded-lg p-4 text-center">
        Isi DP Options dan Tenor Options terlebih dahulu
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-amber-50 to-yellow-50">
              <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 text-left border-r border-gray-200 min-w-[70px]">
                DP ↓ / Tenor →
              </th>
              {tenorList.map((t) => (
                <th key={t} className="px-2 py-2.5 text-xs font-semibold text-gray-600 text-center min-w-[85px]">
                  {t} thn
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dpList.map((dp) => (
              <tr key={dp} className="border-t border-gray-100 hover:bg-amber-50/30 transition-colors">
                <td className="px-3 py-2 font-semibold text-gray-700 text-xs border-r border-gray-200 bg-gray-50/80">
                  {dp}%
                </td>
                {tenorList.map((tenor) => {
                  const monthly = calcMonthly(dp, tenor);
                  return (
                    <td key={tenor} className="px-2 py-2 text-center">
                      <div className="bg-amber-50 border border-amber-100 rounded-md px-2 py-1.5">
                        <span className="text-sm font-semibold text-gray-800">
                          {monthly > 0 ? monthly.toFixed(1) : "—"}
                        </span>
                        <span className="text-[10px] text-gray-400 ml-0.5">jt</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
        Otomatis dihitung — Harga <strong>Rp {price.toFixed(0)}jt</strong>, margin <strong>{margin}%</strong>, cicilan flat per bulan
      </div>
    </div>
  );
}

// ──── KPR Auto-Calculated Grid (Flat + Annuity) ────
function KprAutoGrid({
  price,
  dpOptions,
  tenorOptions,
  interestRate,
}: {
  price: number;
  dpOptions: string;
  tenorOptions: string;
  interestRate?: number;
}) {
  const dpList = parseNumberList(dpOptions);
  const tenorList = parseNumberList(tenorOptions);
  const annualRate = (interestRate ?? 7.5) / 100;
  const monthlyRate = annualRate / 12;

  const calcFlat = (dpRupiah: number, tenor: number): number => {
    if (price <= 0 || tenor <= 0) return 0;
    const priceRupiah = price * 1_000_000;
    const loanAmount = priceRupiah - dpRupiah;
    if (loanAmount <= 0) return 0;
    const totalPayback = loanAmount * (1 + annualRate * tenor);
    return totalPayback / (tenor * 12) / 1_000_000;
  };

  const calcAnnuity = (dpRupiah: number, tenor: number): number => {
    if (price <= 0 || tenor <= 0) return 0;
    const priceRupiah = price * 1_000_000;
    const loanAmount = priceRupiah - dpRupiah;
    if (loanAmount <= 0 || monthlyRate <= 0) return 0;
    const n = tenor * 12;
    return (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1) / 1_000_000;
  };

  if (!price || price <= 0) {
    return (
      <div className="text-sm text-gray-400 bg-gray-50 rounded-lg p-4 text-center">
        Masukkan harga properti terlebih dahulu untuk melihat perhitungan otomatis
      </div>
    );
  }

  if (dpList.length === 0 || tenorList.length === 0) {
    return (
      <div className="text-sm text-gray-400 bg-gray-50 rounded-lg p-4 text-center">
        Isi DP Options dan Tenor Options terlebih dahulu
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-red-50 to-orange-50">
              <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 text-left border-r border-gray-200 min-w-[90px]">
                DP (Rp) ↓ / Tenor →
              </th>
              {tenorList.map((t) => (
                <th key={t} className="px-2 py-2.5 text-xs font-semibold text-gray-600 text-center min-w-[170px]">
                  {t} thn
                </th>
              ))}
            </tr>
            <tr className="bg-gray-100">
              <th className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 border-r border-gray-200" />
              {tenorList.map((t) => (
                <th key={t} className="text-[10px] font-semibold text-gray-400 text-center">
                  <span className="inline-flex gap-3">
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />Flat</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400" />Anuitas</span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dpList.map((dp) => (
              <tr key={dp} className="border-t border-gray-100 hover:bg-red-50/30 transition-colors">
                <td className="px-3 py-2 font-semibold text-gray-700 text-xs border-r border-gray-200 bg-gray-50/80">
                  Rp {formatRupiahShort(dp)}
                </td>
                {tenorList.map((tenor) => {
                  const flat = calcFlat(dp, tenor);
                  const annuity = calcAnnuity(dp, tenor);
                  return (
                    <td key={tenor} className="px-1 py-2 text-center">
                      <div className="flex flex-col gap-1">
                        <div className="bg-yellow-50 border border-yellow-100 rounded px-1.5 py-1">
                          <span className="text-[11px] font-semibold text-yellow-800">{flat > 0 ? flat.toFixed(1) : "—"}</span>
                          <span className="text-[9px] text-yellow-500 ml-0.5">jt</span>
                        </div>
                        <div className="bg-red-50 border border-red-100 rounded px-1.5 py-1">
                          <span className="text-[11px] font-semibold text-red-800">{annuity > 0 ? annuity.toFixed(1) : "—"}</span>
                          <span className="text-[9px] text-red-400 ml-0.5">jt</span>
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400" />
        Otomatis dihitung — Harga <strong>Rp {price.toFixed(0)}jt</strong>, bunga <strong>{interestRate ?? 7.5}% p.a.</strong> (flat &amp; anuitas)
      </div>
    </div>
  );
}

// ──── Tag Chip Input ────
function TagInput({
  values,
  onChange,
  placeholder,
  suffix,
}: {
  values: string;
  onChange: (v: string) => void;
  placeholder: string;
  suffix?: string;
}) {
  const list = values.split(",").map((v) => v.trim()).filter(Boolean);
  const [inputVal, setInputVal] = useState("");

  const addTag = () => {
    const num = parseInt(inputVal.trim());
    if (isNaN(num) || num < 0) return;
    if (list.includes(String(num))) { setInputVal(""); return; }
    const newList = [...list, String(num)];
    // Sort numerically
    newList.sort((a, b) => parseInt(a) - parseInt(b));
    onChange(newList.join(","));
    setInputVal("");
  };

  const removeTag = (val: string) => {
    const newList = list.filter((v) => v !== val);
    onChange(newList.join(","));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {list.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-medium border border-red-100"
          >
            {v}{suffix || ""}
            <button
              type="button"
              onClick={() => removeTag(v)}
              className="text-red-400 hover:text-red-700 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          type="number"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); addTag(); }
          }}
          placeholder={placeholder}
          className="h-8 text-sm"
        />
        <Button type="button" variant="outline" size="sm" className="h-8 px-3 shrink-0" onClick={addTag}>
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ──── Main Page ────
export default function ProyekPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);
  const [deleting, setDeleting] = useState<Property | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchProperties = useCallback(async () => {
    try {
      const q = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/admin/properties${q}`);
      const data = await res.json();
      setProperties(data.properties || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (p: Property) => {
    setEditing(p);
    const imgs = parseImages(p.images);
    setForm({
      name: p.name, slug: p.slug, type: p.type, category: p.category,
      price: String(p.price), location: p.location,
      bedrooms: String(p.bedrooms), bathrooms: String(p.bathrooms),
      landArea: String(p.landArea), buildingArea: String(p.buildingArea),
      status: p.status, description: p.description, isFeatured: p.isFeatured,
      tag: p.tag || "",
      financingTypes: p.financingTypes || '["syariah","kpr"]',
      image: imgs.join(","), features: parseFeaturesToCSV(p.features),
      dpOptions: parseJSONToCSV(p.dpOptions, "30,35,40,45,50"),
      tenorOptions: parseJSONToCSV(p.tenorOptions, "1,2,3,4,5"),
      syariahMargin: String(p.syariahMargin ?? 15),
      kprDpOptions: parseJSONToCSV(p.kprDpOptions, "1000000,2000000,3000000,4000000,5000000"),
      kprTenorOptions: parseJSONToCSV(p.kprTenorOptions, "5,10,15,20,25"),
      kprInstallments: p.kprInstallments || "{}",
      kprInterestRate: String(p.kprInterestRate ?? "7.5"),
      kprInterestType: String(p.kprInterestType ?? "annuity"),
      videoUrl: String((p as any).videoUrl ?? ""),
      landPricePerSqm: String((p as any).landPricePerSqm ?? ""),
    });
    setErrors({});
    setFormOpen(true);
  };

  const openDelete = (p: Property) => {
    setDeleting(p);
    setDeleteOpen(true);
  };

  const clearFieldError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const updateField = (field: keyof FormState, value: string | boolean) => {
    clearFieldError(field);
    if (field === "name") {
      setForm((prev) => ({
        ...prev,
        name: value as string,
        slug: generateSlug(value as string),
      }));
    } else {
      setForm((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Nama Proyek wajib diisi";
    if (form.category !== "kavling" && !form.type.trim()) newErrors.type = "Tipe wajib diisi";
    if (!form.category) newErrors.category = "Kategori wajib diisi";
    if (!form.price || Number(form.price) <= 0) newErrors.price = "Harga wajib diisi";
    if (form.category !== "kavling") {
      if (!form.landArea || Number(form.landArea) <= 0) newErrors.landArea = "Luas tanah wajib diisi";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const slug = form.slug || generateSlug(form.name);
    // Convert comma-separated image URLs to JSON array (max 5)
    const imageList = form.image ? form.image.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 5) : [];
    const images = JSON.stringify(imageList);

    // For kavling: force irrelevant fields to default values
    const isKavling = form.category === "kavling";
    const finalType = isKavling ? "" : form.type;
    const finalBedrooms = isKavling ? 0 : parseInt(form.bedrooms) || 2;
    const finalBathrooms = isKavling ? 0 : parseInt(form.bathrooms) || 1;
    const finalBuildingArea = isKavling ? 0 : parseFloat(form.buildingArea) || 0;

    // Convert TagInput CSV strings to JSON arrays for dpOptions/tenorOptions
    const csvToJSON = (csv: string) => JSON.stringify(csv.split(",").map((v) => parseInt(v.trim())).filter((n) => !isNaN(n)));

    // Auto-calculate KPR installments grid (flat + annuity)
    const kprDpList = form.kprDpOptions.split(",").map((v) => parseInt(v.trim())).filter((n) => !isNaN(n) && n >= 0);
    const kprTenorList = form.kprTenorOptions.split(",").map((v) => parseInt(v.trim())).filter((n) => !isNaN(n) && n > 0);
    const kprInstallmentsObj: Record<string, Record<string, number>> = {};
    const priceNum = parseFloat(form.price) || 0;
    const kprRate = (parseFloat(form.kprInterestRate) || 7.5) / 100;
    const kprMonthlyRate = kprRate / 12;
    for (const dp of kprDpList) {
      const loanAmount = priceNum * 1_000_000 - dp;
      if (loanAmount <= 0) continue;
      kprInstallmentsObj[String(dp)] = {};
      for (const tenor of kprTenorList) {
        const n = tenor * 12;
        // Use annuity for stored data
        if (kprMonthlyRate > 0 && n > 0) {
          const monthly = (loanAmount * kprMonthlyRate * Math.pow(1 + kprMonthlyRate, n)) / (Math.pow(1 + kprMonthlyRate, n) - 1) / 1_000_000;
          kprInstallmentsObj[String(dp)][String(tenor)] = parseFloat(monthly.toFixed(1));
        }
      }
    }
    const kprInstallments = JSON.stringify(kprInstallmentsObj);

    setSaving(true);
    try {
      const url = editing ? `/api/admin/properties/${editing.id}` : "/api/admin/properties";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          slug,
          type: finalType,
          bedrooms: String(finalBedrooms),
          bathrooms: String(finalBathrooms),
          buildingArea: String(finalBuildingArea),
          images,
          dpOptions: csvToJSON(form.dpOptions),
          tenorOptions: csvToJSON(form.tenorOptions),
          kprDpOptions: csvToJSON(form.kprDpOptions),
          kprTenorOptions: csvToJSON(form.kprTenorOptions),
          kprInstallments,
          videoUrl: form.videoUrl,
        }),
      });
      if (!res.ok) { const err = await res.json(); toast.error(err.error || "Gagal menyimpan"); return; }
      toast.success(editing ? "Proyek berhasil diupdate" : "Proyek berhasil ditambahkan");
      setFormOpen(false);
      fetchProperties();
    } catch { toast.error("Terjadi kesalahan"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeletingLoading(true);
    try {
      const res = await fetch(`/api/admin/properties/${deleting.id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Gagal menghapus"); return; }
      toast.success("Proyek berhasil dihapus");
      setDeleteOpen(false);
      fetchProperties();
    } catch { toast.error("Terjadi kesalahan"); }
    finally { setDeletingLoading(false); }
  };

  const hasError = (field: string) => !!errors[field];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proyek</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola listing properti / proyek perumahan</p>
        </div>
        <Button onClick={openCreate} className="bg-red-600 hover:bg-red-700 text-white gap-2">
          <Plus className="w-4 h-4" /> Tambah Proyek
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Cari proyek..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
            <Table containerClassName="max-h-[calc(100vh-14rem)]">
              <TableHeader className="sticky top-0 z-10 bg-gray-50">
                <TableRow className="bg-gray-50">
                  <TableHead>Nama</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  : properties.length === 0
                  ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-gray-400">
                          <Building2 className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                          {search ? "Tidak ada hasil" : "Belum ada proyek"}
                        </TableCell>
                      </TableRow>
                    )
                  : properties.map((p) => {
                      const st = STATUS_MAP[p.status] || STATUS_MAP.available;
                      const catLabel = CATEGORY_MAP[p.category] || p.category;
                      return (
                        <TableRow key={p.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {p.images && parseImages(p.images)[0] ? (
                                <img src={parseImages(p.images)[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                  <ImageIcon className="w-4 h-4 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-sm">{p.name}</p>
                                {p.tag && (
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 mt-0.5 bg-red-50 text-red-600">
                                    {p.tag}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-500 text-sm">{p.type}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{catLabel}</Badge>
                          </TableCell>
                          <TableCell className="font-semibold text-gray-800 text-sm">
                            Rp {formatPrice(p.price)} Jt
                          </TableCell>
                          <TableCell>
                            <Badge className={st.className}>{st.label}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEdit(p)} className="text-gray-400 hover:text-red-600">
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => openDelete(p)} className="text-gray-400 hover:text-red-600">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
              </TableBody>
            </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Proyek" : "Tambah Proyek Baru"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            {/* ── Info Dasar ── */}
            <div className="space-y-2">
              <Label className="flex items-center gap-0.5">Nama Proyek <span className="text-red-500">*</span></Label>
              <Input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Cluster Kav R3 & R4"
                className={hasError("name") ? "border-red-400 focus-visible:ring-red-400" : ""}
              />
              {errors.name && (
                <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Tag / Label</Label>
              <Input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} placeholder="Best Seller, Populer, Baru..." />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-0.5">Tipe (LB/LT) {form.category !== "kavling" && <span className="text-red-500">*</span>}</Label>
              <Input
                value={form.type}
                onChange={(e) => updateField("type", e.target.value)}
                placeholder="45/127"
                readOnly={form.category === "kavling"}
                className={`${hasError("type") ? "border-red-400 focus-visible:ring-red-400" : ""} ${form.category === "kavling" ? "bg-gray-50 text-gray-400" : ""}`}
              />
              {form.category === "kavling" && <p className="text-[10px] text-gray-400">Otomatis kosong untuk kavling</p>}
              {errors.type && (
                <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.type}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-0.5">Kategori <span className="text-red-500">*</span></Label>
              <Select value={form.category} onValueChange={(v) => {
                updateField("category", v);
                if (v === "kavling") {
                  setForm((prev) => ({
                    ...prev,
                    category: v,
                    type: "",
                    bedrooms: "0",
                    bathrooms: "0",
                    buildingArea: "0",
                  }));
                  const la = parseFloat(form.landArea) || 0;
                  const lp = parseFloat(form.landPricePerSqm) || 0;
                  if (la > 0 && lp > 0) {
                    setForm((prev) => ({ ...prev, price: String(((la * lp) / 1_000_000).toFixed(2)) }));
                  }
                } else {
                  setForm((prev) => ({
                    ...prev,
                    category: v,
                    bedrooms: "2",
                    bathrooms: "1",
                  }));
                }
              }}>
                <SelectTrigger className={hasError("category") ? "border-red-400 focus:ring-red-400" : ""}>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inden">Inden</SelectItem>
                  <SelectItem value="kavling">Kavling</SelectItem>
                  <SelectItem value="siap_huni">Siap Huni</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.category}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-0.5">Harga (Juta Rp) <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                step="0.1"
                value={form.price}
                onChange={(e) => updateField("price", e.target.value)}
                placeholder="575"
                readOnly={form.category === "kavling"}
                className={`${hasError("price") ? "border-red-400 focus-visible:ring-red-400" : ""} ${form.category === "kavling" ? "bg-gray-50 text-gray-500" : ""}`}
              />
              {errors.price && (
                <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.price}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Lokasi</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Bandung Raya Residence, Sentul, dll" />
            </div>
            <div className="space-y-2">
              <Label>Luas Tanah (m²)</Label>
              <Input type="number" value={form.landArea} onChange={(e) => {
                setForm({ ...form, landArea: e.target.value });
                // Auto-calculate price for kavling
                if (form.category === "kavling" && form.landPricePerSqm) {
                  const la = parseFloat(e.target.value) || 0;
                  const lp = parseFloat(form.landPricePerSqm) || 0;
                  if (la > 0 && lp > 0) {
                    setForm((prev) => ({ ...prev, landArea: e.target.value, price: String(((la * lp) / 1_000_000).toFixed(2)) }));
                  }
                }
              }} placeholder="127" />
            </div>
            {form.category === "kavling" && (
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Harga Tanah per m² (Rp)
                  {form.landArea && form.landPricePerSqm && (
                    <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">Auto-hitung → {(parseFloat(form.landArea) * parseFloat(form.landPricePerSqm) / 1_000_000).toFixed(2)} jt</span>
                  )}
                </Label>
                <Input
                  type="number"
                  value={form.landPricePerSqm}
                  onChange={(e) => {
                    setForm({ ...form, landPricePerSqm: e.target.value });
                    const la = parseFloat(form.landArea) || 0;
                    const lp = parseFloat(e.target.value) || 0;
                    if (la > 0 && lp > 0) {
                      setForm((prev) => ({ ...prev, landPricePerSqm: e.target.value, price: String(((la * lp) / 1_000_000).toFixed(2)) }));
                    }
                  }}
                  placeholder="2500000"
                />
                <p className="text-[10px] text-gray-400">Harga properti akan otomatis dihitung dari Luas Tanah × Harga/m²</p>
              </div>
            )}
            <div className="space-y-2">
              <Label>Kamar Tidur {form.category === "kavling" && <span className="text-[10px] text-gray-400 font-normal">(tidak berlaku)</span>}</Label>
              <Input type="number" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} readOnly={form.category === "kavling"} className={form.category === "kavling" ? "bg-gray-50 text-gray-400" : ""} />
            </div>
            <div className="space-y-2">
              <Label>Kamar Mandi {form.category === "kavling" && <span className="text-[10px] text-gray-400 font-normal">(tidak berlaku)</span>}</Label>
              <Input type="number" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} readOnly={form.category === "kavling"} className={form.category === "kavling" ? "bg-gray-50 text-gray-400" : ""} />
            </div>
            <div className="space-y-2">
              <Label>Luas Bangunan (m²) {form.category === "kavling" && <span className="text-[10px] text-gray-400 font-normal">(tidak berlaku)</span>}</Label>
              <Input type="number" value={form.buildingArea} onChange={(e) => setForm({ ...form, buildingArea: e.target.value })} placeholder="45" readOnly={form.category === "kavling"} className={form.category === "kavling" ? "bg-gray-50 text-gray-400" : ""} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Tersedia</SelectItem>
                  <SelectItem value="reserved">Dipesan</SelectItem>
                  <SelectItem value="sold">Terjual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch checked={form.isFeatured} onCheckedChange={(v) => setForm({ ...form, isFeatured: v })} />
              <Label>Proyek Unggulan</Label>
            </div>

            {/* ── Media & Deskripsi ── */}
            <div className="sm:col-span-2 border-t border-gray-100 pt-4 mt-1">
              <p className="text-sm font-semibold text-gray-700 mb-3">Media & Deskripsi</p>
            </div>
            <div className="sm:col-span-2">
              <ImageUpload
                value={form.image}
                onChange={(url) => setForm({ ...form, image: url })}
                label="Gambar Properti (maks 5)"
              />
            </div>
            <div className="space-y-2">
              <Label>Fitur (comma separated)</Label>
              <Input value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="Carport, Taman, Dapur" />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Deskripsi proyek..." />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                Link Video YouTube
                <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-600">
                  <ExternalLink className="w-3 h-3" />
                </a>
              </Label>
              <Input value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." />
              <p className="text-[10px] text-gray-400">Opsional. Video akan tampil di halaman detail proyek.</p>
            </div>

            {/* ── Tabel Cicilan ── */}
            <div className="sm:col-span-2 border-t border-gray-100 pt-4 mt-1">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-gray-700">Tabel Cicilan</p>
                <p className="text-xs text-gray-400">Pilih tipe pembiayaan yang tersedia</p>
              </div>
              {/* Financing Type Toggle */}
              <div className="flex items-center gap-3 mt-2 mb-4">
                {(["syariah", "kpr"] as const).map((type) => {
                  const types = parseFinancingTypes(form.financingTypes);
                  const isActive = types.includes(type);
                  const label = type === "syariah" ? "Syariah" : "KPR Bank";
                  const color = type === "syariah"
                    ? isActive ? "bg-amber-100 border-amber-300 text-amber-700" : "bg-gray-50 border-gray-200 text-gray-400"
                    : isActive ? "bg-red-100 border-red-300 text-red-700" : "bg-gray-50 border-gray-200 text-gray-400";
                  const dotColor = type === "syariah" ? "bg-amber-500" : "bg-red-500";
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        const current = parseFinancingTypes(form.financingTypes);
                        const next = isActive
                          ? current.filter((t) => t !== type)
                          : [...current, type];
                        if (next.length === 0) return; // min 1
                        setForm({ ...form, financingTypes: JSON.stringify(next) });
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${color}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isActive ? dotColor : "bg-gray-300"}`} />
                      {label}
                      {isActive && <span className="text-[10px] opacity-60">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Conditional Tabs */}
            {(() => {
              const types = parseFinancingTypes(form.financingTypes);
              const hasSyariah = types.includes("syariah");
              const hasKPR = types.includes("kpr");
              const needTabs = hasSyariah && hasKPR;

              if (!needTabs && hasSyariah) {
                // Only Syariah — show directly, no tabs
                return (
                  <div className="sm:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-600">Opsi DP (Uang Muka)</Label>
                        <TagInput values={form.dpOptions} onChange={(v) => setForm({ ...form, dpOptions: v })} placeholder="Contoh: 30" suffix="%" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-600">Opsi Tenor</Label>
                        <TagInput values={form.tenorOptions} onChange={(v) => setForm({ ...form, tenorOptions: v })} placeholder="Contoh: 5" suffix=" thn" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-600">Margin Keuntungan</Label>
                        <div className="flex items-center gap-2">
                          <Input type="number" step="0.5" value={form.syariahMargin} onChange={(e) => setForm({ ...form, syariahMargin: e.target.value })} className="h-9 text-sm" placeholder="15" />
                          <span className="text-gray-400 text-sm font-medium">%</span>
                        </div>
                        <p className="text-[10px] text-gray-400">Akad Murabahah — margin flat dari harga properti</p>
                      </div>
                    </div>
                    <SyariahAutoGrid price={parseFloat(form.price) || 0} dpOptions={form.dpOptions} tenorOptions={form.tenorOptions} margin={parseFloat(form.syariahMargin) || 0} />
                  </div>
                );
              }

              if (!needTabs && hasKPR) {
                return (
                  <div className="sm:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-600">Opsi DP (Uang Muka)</Label>
                        <TagInput values={form.kprDpOptions} onChange={(v) => setForm({ ...form, kprDpOptions: v })} placeholder="Contoh: 50000000" suffix="" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-600">Opsi Tenor</Label>
                        <TagInput values={form.kprTenorOptions} onChange={(v) => setForm({ ...form, kprTenorOptions: v })} placeholder="Contoh: 10" suffix=" thn" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-600">Suku Bunga / tahun</Label>
                        <div className="flex items-center gap-2">
                          <Input type="number" step="0.1" value={form.kprInterestRate} onChange={(e) => setForm({ ...form, kprInterestRate: e.target.value })} className="h-9 text-sm" placeholder="7.5" />
                          <span className="text-gray-400 text-sm font-medium">%</span>
                        </div>
                        <p className="text-[10px] text-gray-400">Bunga efektif per tahun — flat &amp; anuitas</p>
                      </div>
                    </div>
                    <KprAutoGrid price={parseFloat(form.price) || 0} dpOptions={form.kprDpOptions} tenorOptions={form.kprTenorOptions} interestRate={parseFloat(form.kprInterestRate) || undefined} />
                    <p className="text-[11px] text-gray-400">Cicilan <strong>KPR Bank</strong> — tampilan <strong>Flat</strong> (kuning) &amp; <strong>Anuitas</strong> (merah). Simpan data anuitas.</p>
                  </div>
                );
              }

              // Both — show tabs
              return (
                <div className="sm:col-span-2">
                  <Tabs defaultValue="syariah" className="w-full">
                    <TabsList className="w-full grid grid-cols-2">
                      <TabsTrigger value="syariah" className="gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        Syariah
                      </TabsTrigger>
                      <TabsTrigger value="kpr" className="gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        KPR Bank
                      </TabsTrigger>
                    </TabsList>

                    {/* ── Syariah Tab ── */}
                    <TabsContent value="syariah" className="space-y-4 mt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-gray-600">Opsi DP (Uang Muka)</Label>
                          <TagInput values={form.dpOptions} onChange={(v) => setForm({ ...form, dpOptions: v })} placeholder="Contoh: 30" suffix="%" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-gray-600">Opsi Tenor (Jangka Waktu)</Label>
                          <TagInput values={form.tenorOptions} onChange={(v) => setForm({ ...form, tenorOptions: v })} placeholder="Contoh: 5" suffix=" thn" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-gray-600">Margin Keuntungan</Label>
                          <div className="flex items-center gap-2">
                            <Input type="number" step="0.5" value={form.syariahMargin} onChange={(e) => setForm({ ...form, syariahMargin: e.target.value })} className="h-9 text-sm" placeholder="15" />
                            <span className="text-gray-400 text-sm font-medium">%</span>
                          </div>
                          <p className="text-[10px] text-gray-400">Akad Murabahah — margin flat dari harga properti</p>
                        </div>
                      </div>
                      <SyariahAutoGrid price={parseFloat(form.price) || 0} dpOptions={form.dpOptions} tenorOptions={form.tenorOptions} margin={parseFloat(form.syariahMargin) || 0} />
                    </TabsContent>

                    {/* ── KPR Tab ── */}
                    <TabsContent value="kpr" className="space-y-4 mt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-gray-600">Opsi DP (Uang Muka)</Label>
                          <TagInput values={form.kprDpOptions} onChange={(v) => setForm({ ...form, kprDpOptions: v })} placeholder="Contoh: 50000000" suffix="" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-gray-600">Opsi Tenor (Jangka Waktu)</Label>
                          <TagInput values={form.kprTenorOptions} onChange={(v) => setForm({ ...form, kprTenorOptions: v })} placeholder="Contoh: 10" suffix=" thn" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-gray-600">Suku Bunga / tahun</Label>
                          <div className="flex items-center gap-2">
                            <Input type="number" step="0.1" value={form.kprInterestRate} onChange={(e) => setForm({ ...form, kprInterestRate: e.target.value })} className="h-9 text-sm" placeholder="7.5" />
                            <span className="text-gray-400 text-sm font-medium">%</span>
                          </div>
                          <p className="text-[10px] text-gray-400">Bunga efektif per tahun — flat &amp; anuitas</p>
                        </div>
                      </div>
                      <KprAutoGrid price={parseFloat(form.price) || 0} dpOptions={form.kprDpOptions} tenorOptions={form.kprTenorOptions} interestRate={parseFloat(form.kprInterestRate) || undefined} />
                      <p className="text-[11px] text-gray-400">Cicilan <strong>KPR Bank</strong> — tampilan <strong>Flat</strong> (kuning) &amp; <strong>Anuitas</strong> (merah). Simpan data anuitas.</p>
                    </TabsContent>
                  </Tabs>
                </div>
              );
            })()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-red-600 hover:bg-red-700 text-white">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editing ? "Simpan" : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Proyek</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus <strong>{deleting?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deletingLoading} className="bg-red-600 hover:bg-red-700 text-white">
              {deletingLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
