"use client";

import { useState, useMemo } from "react";
import {
  Calculator,
  Building2,
  Clock,
  Banknote,
  TrendingDown,
  TrendingUp,
  Copy,
  Check,
  RotateCcw,
  Info,
  FileText,
  Printer,
  Eye,
  X,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// ──── Helpers ────
function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID").format(Math.round(amount));
}

function formatJuta(amount: number): string {
  return (amount / 1_000_000).toFixed(1);
}

function todayStr() {
  return new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// KPR flat rate calculation
function calcKPRMonthlyFlat(
  loanAmount: number,
  annualRate: number,
  tenorYears: number
): number {
  const totalMonths = tenorYears * 12;
  const totalInterest = loanAmount * (annualRate / 100) * tenorYears;
  return (loanAmount + totalInterest) / totalMonths;
}

// KPR annuity (effective rate)
function calcKPRMonthlyAnnuity(
  loanAmount: number,
  annualRate: number,
  tenorYears: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  const totalMonths = tenorYears * 12;
  if (monthlyRate === 0) return loanAmount / totalMonths;
  return (
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1)
  );
}

// Syariah: flat profit margin — dpAmount is in rupiah
function calcSyariahMonthly(
  propertyPrice: number,
  dpAmount: number,
  profitMarginPercent: number,
  tenorYears: number
): number {
  const sellingPrice = propertyPrice * (1 + profitMarginPercent / 100);
  const loanAmount = sellingPrice - dpAmount;
  const totalMonths = tenorYears * 12;
  return loanAmount / totalMonths;
}

// ──── Shared print/PDF CSS ────
const PRINT_CSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; padding: 20px; color: #111; }
  .page { max-width: 210mm; margin: 0 auto; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  th, td { border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; font-size: 13px; }
  th { background: #f3f4f6; font-weight: 600; }
  .right { text-align: right; }
  .center { text-align: center; }
  .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #dc2626; padding-bottom: 12px; }
  .header h1 { font-size: 20px; color: #dc2626; }
  .header p { font-size: 12px; color: #6b7280; margin-top: 4px; }
  .section-title { font-size: 14px; font-weight: 700; margin: 16px 0 8px; color: #374151; }
  .highlight-box { border-radius: 8px; padding: 16px; margin: 12px 0; text-align: center; }
  .highlight-box .amount { font-size: 24px; font-weight: 800; }
  .highlight-box .label { font-size: 12px; color: #6b7280; }
  .note { font-size: 11px; color: #9ca3af; margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 8px; }
  @media print { body { padding: 10mm; } }
`;

function wrapPrintHtml(bodyContent: string): string {
  return `<!DOCTYPE html><html><head><title>Simulasi Cicilan</title><style>${PRINT_CSS}</style></head><body><div class="page">${bodyContent}</div></body></html>`;
}

// ──── Generate KPR HTML for print/PDF ────
function generateKPRHtml(result: KPRResult, rateType: "flat" | "annuity"): string {
  const rows: string[] = [];
  for (let i = 0; i < result.tenorYears; i++) {
    const year = i + 1;
    let remaining = result.loanAmount;
    if (rateType === "annuity") {
      let rem = result.loanAmount;
      for (let m = 0; m < year * 12; m++) {
        const intM = rem * (result.annualRate / 100 / 12);
        const prinM = result.monthly - intM;
        rem -= prinM;
        if (rem < 0) rem = 0;
      }
      remaining = rem;
    } else {
      const totalMonths = result.tenorYears * 12;
      const principalPerMonth = result.loanAmount / totalMonths;
      remaining = Math.max(0, result.loanAmount - principalPerMonth * year * 12);
    }
    rows.push(`<tr><td class="center">${year}</td><td class="right">Rp ${formatRupiah(result.monthly)}</td><td class="right">Rp ${formatRupiah(result.monthly * 12)}</td><td class="right">Rp ${formatRupiah(remaining)}</td></tr>`);
  }
  return `
    <div class="header">
      <h1>Simulasi KPR Bank</h1>
      <p>Tanggal: ${todayStr()} &bull; Tipe: ${rateType === "flat" ? "Bunga Flat" : "Bunga Anuitas (Efektif)"}</p>
    </div>
    <div class="section-title">A. Ringkasan Perhitungan</div>
    <table><tbody>
      <tr><td style="width:50%">Harga Properti</td><td class="right">Rp ${formatRupiah(result.propertyPrice)}</td></tr>
      <tr><td>Uang Muka (DP)</td><td class="right">Rp ${formatRupiah(result.dpAmount)} (${result.dpPercent.toFixed(1)}%)</td></tr>
      <tr><td>Jumlah Pinjaman</td><td class="right">Rp ${formatRupiah(result.loanAmount)}</td></tr>
      <tr><td>Suku Bunga Pertahun</td><td class="right">${result.annualRate}% (${rateType === "flat" ? "Flat" : "Anuitas"})</td></tr>
      <tr><td>Jangka Waktu (Tenor)</td><td class="right">${result.tenorYears} Tahun (${result.tenorYears * 12} Bulan)</td></tr>
    </tbody></table>
    <div class="section-title">B. Hasil Perhitungan</div>
    <div class="highlight-box" style="background:#fef2f2;border:1px solid #fecaca">
      <div class="label">Cicilan Per Bulan</div>
      <div class="amount" style="color:#dc2626">Rp ${formatRupiah(result.monthly)}</div>
      <div class="label">${rateType === "flat" ? "Bunga Flat — cicilan tetap setiap bulan" : "Bunga Anuitas — cicilan tetap, porsi bunga menurun"}</div>
    </div>
    <table><tbody>
      <tr><td>Total Pembayaran</td><td class="right"><strong>Rp ${formatRupiah(result.totalPayment)}</strong></td></tr>
      <tr><td>Total Bunga</td><td class="right" style="color:#dc2626">Rp ${formatRupiah(result.totalInterest)}</td></tr>
      <tr><td>Total Pokok</td><td class="right">Rp ${formatRupiah(result.loanAmount)}</td></tr>
    </tbody></table>
    <div class="section-title">C. Tabel Cicilan Per Tahun</div>
    <table>
      <thead><tr><th class="center">Tahun</th><th class="right">Angsuran/bln</th><th class="right">Total Setahun</th><th class="right">Sisa Pinjaman</th></tr></thead>
      <tbody>${rows.join("")}</tbody>
    </table>
    <div class="note">* Simulasi ini hanya bersifat estimasi. Nilai cicilan aktual dapat berbeda tergantung kebijakan bank.${rateType === "annuity" ? " Untuk KPR Anuitas, cicilan tetap tapi porsi pokok meningkat dan bunga menurun setiap bulan." : ""}</div>
  `;
}

// ──── Generate Syariah HTML for print/PDF ────
function generateSyariahHtml(result: SyariahResult): string {
  const rows: string[] = [];
  for (let i = 0; i < result.tenorYears; i++) {
    const year = i + 1;
    const remaining = Math.max(0, result.loanAmount - result.monthly * 12 * year);
    rows.push(`<tr><td class="center">${year}</td><td class="right">Rp ${formatRupiah(result.monthly)}</td><td class="right">Rp ${formatRupiah(result.monthly * 12)}</td><td class="right">Rp ${formatRupiah(remaining)}</td></tr>`);
  }
  return `
    <div class="header" style="border-bottom-color:#b45309">
      <h1 style="color:#b45309">Simulasi Pembiayaan Syariah</h1>
      <p>Tanggal: ${todayStr()} &bull; Akad Murabahah</p>
    </div>
    <div class="section-title">A. Ringkasan Perhitungan</div>
    <table><tbody>
      <tr><td style="width:50%">Harga Properti</td><td class="right">Rp ${formatRupiah(result.propertyPrice)}</td></tr>
      <tr><td>Uang Muka (DP)</td><td class="right">Rp ${formatRupiah(result.dpAmount)} (${result.dpPercent.toFixed(1)}%)</td></tr>
      <tr><td>Margin Keuntungan Bank</td><td class="right">${result.marginPercent}%</td></tr>
      <tr><td>Harga Jual Bank (Akad)</td><td class="right"><strong>Rp ${formatRupiah(result.sellingPrice)}</strong></td></tr>
      <tr><td>Jumlah Pembiayaan</td><td class="right">Rp ${formatRupiah(result.loanAmount)}</td></tr>
      <tr><td>Jangka Waktu (Tenor)</td><td class="right">${result.tenorYears} Tahun (${result.tenorYears * 12} Bulan)</td></tr>
    </tbody></table>
    <div class="section-title">B. Hasil Perhitungan</div>
    <div class="highlight-box" style="background:#fffbeb;border:1px solid #fde68a">
      <div class="label">Cicilan Per Bulan (Flat)</div>
      <div class="amount" style="color:#b45309">Rp ${formatRupiah(result.monthly)}</div>
      <div class="label">Cicilan tetap selama ${result.tenorYears} tahun — tanpa bunga, tanpa denda</div>
    </div>
    <table><tbody>
      <tr><td>Total Pembayaran ke Bank</td><td class="right"><strong>Rp ${formatRupiah(result.totalPayment)}</strong></td></tr>
      <tr><td>Margin Bank (Keuntungan)</td><td class="right" style="color:#b45309">Rp ${formatRupiah(result.profitAmount)}</td></tr>
      <tr><td>Porsi Pokok</td><td class="right">Rp ${formatRupiah(result.propertyPrice - result.dpAmount)}</td></tr>
    </tbody></table>
    <div class="section-title">C. Tabel Cicilan Per Tahun</div>
    <table>
      <thead><tr><th class="center">Tahun</th><th class="right">Cicilan/bln</th><th class="right">Total Setahun</th><th class="right">Sisa Pembiayaan</th></tr></thead>
      <tbody>${rows.join("")}</tbody>
    </table>
    <div class="note">* Simulasi ini hanya bersifat estimasi. Cicilan Syariah bersifat FLAT (tetap) selama masa tenor. Tanpa bunga, tanpa denda, tanpa penalti. Sesuai prinsip Akad Murabahah.</div>
  `;
}

function handlePrint(htmlContent: string) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    toast.error("Pop-up diblokir. Izinkan pop-up untuk print.");
    return;
  }
  printWindow.document.write(wrapPrintHtml(htmlContent));
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
}

// ──── Types ────
interface KPRResult {
  propertyPrice: number;
  dpAmount: number;
  dpPercent: number;
  loanAmount: number;
  monthly: number;
  tenorYears: number;
  totalPayment: number;
  totalInterest: number;
  annualRate: number;
}

interface SyariahResult {
  propertyPrice: number;
  dpAmount: number;
  dpPercent: number;
  sellingPrice: number;
  loanAmount: number;
  monthly: number;
  tenorYears: number;
  totalPayment: number;
  profitAmount: number;
  marginPercent: number;
}

// ──── KPR Calculator Component ────
function KPRCalculator() {
  const [price, setPrice] = useState<string>("575000000");
  const [dpAmount, setDpAmount] = useState<string>("115000000");
  const [tenor, setTenor] = useState<string>("10");
  const [rate, setRate] = useState<string>("8.5");
  const [rateType, setRateType] = useState<"flat" | "annuity">("annuity");
  const [copied, setCopied] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const result = useMemo(() => {
    const p = parseFloat(price) || 0;
    const dp = parseFloat(dpAmount) || 0;
    const t = parseFloat(tenor) || 1;
    const r = parseFloat(rate) || 0;

    const loanAmount = p - dp;
    const monthly =
      rateType === "flat"
        ? calcKPRMonthlyFlat(loanAmount, r, t)
        : calcKPRMonthlyAnnuity(loanAmount, r, t);

    const totalPayment = monthly * t * 12;
    const totalInterest = totalPayment - loanAmount;
    const dpPercentVal = p > 0 ? ((dp / p) * 100) : 0;

    return {
      propertyPrice: p,
      dpAmount: dp,
      dpPercent: dpPercentVal,
      loanAmount,
      monthly,
      tenorYears: t,
      totalPayment,
      totalInterest,
      annualRate: r,
    };
  }, [price, dpAmount, tenor, rate, rateType]);

  const printHtml = useMemo(() => generateKPRHtml(result, rateType), [result, rateType]);

  const copyResult = () => {
    const text = `KPR ${rateType.toUpperCase()} — ${formatJuta(result.propertyPrice)}jt, DP Rp ${formatRupiah(result.dpAmount)} (${result.dpPercent.toFixed(1)}%), ${result.tenorYears}thn @${result.annualRate}% → Cicilan: Rp ${formatRupiah(result.monthly)}/bln`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success("Disalin ke clipboard!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const resetForm = () => {
    setPrice("575000000");
    setDpAmount("115000000");
    setTenor("10");
    setRate("8.5");
    setRateType("annuity");
  };

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
              <Banknote className="w-4 h-4 text-red-600" />
            </div>
            KPR Bank
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                Harga Properti (Rp)
              </Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="text-lg font-semibold"
              />
              <p className="text-xs text-gray-400">
                Rp {formatRupiah(parseFloat(price) || 0)} ({formatJuta(parseFloat(price) || 0)} jt)
              </p>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <Banknote className="w-3.5 h-3.5 text-gray-400" />
                Uang Muka (DP) — Rupiah
              </Label>
              <Input
                type="number"
                value={dpAmount}
                onChange={(e) => setDpAmount(e.target.value)}
                className="text-lg font-semibold"
                placeholder="Contoh: 115000000"
              />
              <p className="text-xs text-gray-400">
                Rp {formatRupiah(parseFloat(dpAmount) || 0)} ({formatJuta(parseFloat(dpAmount) || 0)} jt) ≈ {result.dpPercent.toFixed(1)}% dari harga
              </p>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                Jangka Waktu (Tenor)
              </Label>
              <div className="flex items-center gap-2">
                <Select value={tenor} onValueChange={setTenor}>
                  <SelectTrigger className="text-lg font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 15, 20, 25, 30].map((t) => (
                      <SelectItem key={t} value={String(t)}>
                        {t} Tahun ({t * 12} bulan)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
                Suku Bunga Pertahun
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="text-lg font-semibold"
                />
                <span className="text-gray-400 font-medium">%</span>
              </div>
            </div>
          </div>

          {/* Rate type */}
          <div className="flex items-center gap-4 p-3 bg-red-50 rounded-lg">
            <span className="text-xs font-medium text-red-700">Tipe Bunga:</span>
            <div className="flex gap-2">
              {(["flat", "annuity"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setRateType(t)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    rateType === t
                      ? "bg-red-600 text-white shadow-sm"
                      : "bg-white text-red-600 border border-red-200 hover:bg-red-100"
                  }`}
                >
                  {t === "flat" ? "Flat" : "Anuitas (Efektif)"}
                </button>
              ))}
            </div>
            <div className="flex items-start gap-1 ml-auto">
              <Info className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-red-600 leading-relaxed">
                {rateType === "flat"
                  ? "Flat: cicilan tetap, bunga dihitung dari pinjaman awal"
                  : "Anuitas: cicilan tetap, bunga dihitung dari sisa pinjaman (lebih realistis)"}
              </p>
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-gray-400 self-center mr-1">Preset:</span>
            {[
              { label: "Bunga 7%", rate: "7" },
              { label: "Bunga 8.5%", rate: "8.5" },
              { label: "Bunga 10%", rate: "10" },
              { label: "Bunga 12%", rate: "12" },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => setRate(preset.rate)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  rate === preset.rate
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Result Card */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-red-600 via-red-700 to-rose-800 text-white">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-red-200 text-sm font-medium">Cicilan per Bulan</p>
              <p className="text-3xl font-bold mt-1">
                Rp {formatRupiah(result.monthly)}
              </p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDetail(true)}
                className="text-red-200 hover:text-white hover:bg-red-500/30"
                title="Lihat Detail"
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handlePrint(printHtml)}
                className="text-red-200 hover:text-white hover:bg-red-500/30"
                title="Print"
              >
                <Printer className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyResult}
                className="text-red-200 hover:text-white hover:bg-red-500/30"
                title="Salin"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={resetForm}
                className="text-red-200 hover:text-white hover:bg-red-500/30"
                title="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-red-200 text-[11px]">Harga Properti</p>
              <p className="text-sm font-semibold mt-0.5">{formatJuta(result.propertyPrice)} jt</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-red-200 text-[11px]">Uang Muka</p>
              <p className="text-sm font-semibold mt-0.5">{result.dpPercent.toFixed(1)}% ({formatJuta(result.dpAmount)} jt)</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-red-200 text-[11px]">Jumlah Pinjaman</p>
              <p className="text-sm font-semibold mt-0.5">{formatJuta(result.loanAmount)} jt</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-red-200 text-[11px]">Total Bayar</p>
              <p className="text-sm font-semibold mt-0.5">{formatJuta(result.totalPayment)} jt</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 bg-red-500/20 rounded-lg px-3 py-2">
            <TrendingUp className="w-4 h-4 text-red-300" />
            <p className="text-sm">
              Total bunga: <span className="font-bold">Rp {formatRupiah(result.totalInterest)}</span> ({formatJuta(result.totalInterest)} jt) selama {result.tenorYears} tahun
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Comparison Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingDown className="w-4 h-4 text-gray-400" />
            Perbandingan Cepat — DP Rp {formatRupiah(parseFloat(dpAmount) || 0)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-left">Tenor</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-center">5 thn</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-center">10 thn</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-center">15 thn</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-center">20 thn</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-center">25 thn</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-700 text-xs">Cicilan/bln</td>
                  {[5, 10, 15, 20, 25].map((t) => {
                    const dp = parseFloat(dpAmount) || 0;
                    const p = parseFloat(price) || 0;
                    const r = parseFloat(rate) || 0;
                    const loan = p - dp;
                    const monthly =
                      rateType === "flat"
                        ? calcKPRMonthlyFlat(loan, r, t)
                        : calcKPRMonthlyAnnuity(loan, r, t);
                    return (
                      <td key={t} className="px-4 py-3 text-center font-semibold text-gray-800">
                        {formatJuta(monthly)} jt
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-t border-gray-100 bg-gray-50/50">
                  <td className="px-4 py-2.5 font-medium text-gray-500 text-xs">Total bunga</td>
                  {[5, 10, 15, 20, 25].map((t) => {
                    const dp = parseFloat(dpAmount) || 0;
                    const p = parseFloat(price) || 0;
                    const r = parseFloat(rate) || 0;
                    const loan = p - dp;
                    const monthly =
                      rateType === "flat"
                        ? calcKPRMonthlyFlat(loan, r, t)
                        : calcKPRMonthlyAnnuity(loan, r, t);
                    const totalPay = monthly * t * 12;
                    const interest = totalPay - loan;
                    return (
                      <td key={t} className="px-4 py-2.5 text-center text-xs text-red-500">
                        {formatJuta(interest)} jt
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            Bunga {rate}% ({rateType === "flat" ? "flat" : "anuitas"}), harga Rp {formatRupiah(parseFloat(price) || 0)}
          </p>
        </CardContent>
      </Card>

      {/* Detail Dialog (KPR) */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowDetail(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Dialog Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-600" />
                <h2 className="text-lg font-bold text-gray-900">Detail Simulasi KPR</h2>
                <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">{rateType === "flat" ? "Flat" : "Anuitas"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handlePrint(printHtml)} className="gap-1.5">
                  <Printer className="w-3.5 h-3.5" /> Print
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setShowDetail(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Dialog Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Highlight */}
              <div className="text-center mb-6 p-6 bg-red-50 rounded-xl border border-red-100">
                <p className="text-sm text-red-600 font-medium">Cicilan Per Bulan</p>
                <p className="text-3xl font-extrabold text-red-700 mt-1">Rp {formatRupiah(result.monthly)}</p>
                <p className="text-xs text-red-500 mt-1">{rateType === "flat" ? "Bunga Flat — tetap setiap bulan" : "Bunga Anuitas — tetap, porsi pokok meningkat"}</p>
              </div>

              {/* Detail Table */}
              <div className="rounded-xl border border-gray-200 overflow-hidden mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Keterangan</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500">Nilai</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-gray-100">
                      <td className="px-4 py-3 text-gray-700">Harga Properti</td>
                      <td className="px-4 py-3 text-right font-semibold">Rp {formatRupiah(result.propertyPrice)}</td>
                    </tr>
                    <tr className="border-t border-gray-100">
                      <td className="px-4 py-3 text-gray-700">Uang Muka (DP)</td>
                      <td className="px-4 py-3 text-right font-semibold">Rp {formatRupiah(result.dpAmount)} <span className="text-gray-400 font-normal">({result.dpPercent.toFixed(1)}%)</span></td>
                    </tr>
                    <tr className="border-t border-gray-100">
                      <td className="px-4 py-3 text-gray-700">Jumlah Pinjaman</td>
                      <td className="px-4 py-3 text-right font-semibold">Rp {formatRupiah(result.loanAmount)}</td>
                    </tr>
                    <tr className="border-t border-gray-100">
                      <td className="px-4 py-3 text-gray-700">Suku Bunga</td>
                      <td className="px-4 py-3 text-right font-semibold">{result.annualRate}% <span className="text-gray-400 font-normal">({rateType === "flat" ? "Flat" : "Anuitas"})</span></td>
                    </tr>
                    <tr className="border-t border-gray-100">
                      <td className="px-4 py-3 text-gray-700">Tenor</td>
                      <td className="px-4 py-3 text-right font-semibold">{result.tenorYears} Tahun <span className="text-gray-400 font-normal">({result.tenorYears * 12} Bulan)</span></td>
                    </tr>
                    <tr className="border-t border-gray-100 bg-red-50">
                      <td className="px-4 py-3 text-red-700 font-semibold">Total Pembayaran</td>
                      <td className="px-4 py-3 text-right font-bold text-red-700">Rp {formatRupiah(result.totalPayment)}</td>
                    </tr>
                    <tr className="border-t border-gray-100 bg-red-50/50">
                      <td className="px-4 py-3 text-red-600 font-medium">Total Bunga</td>
                      <td className="px-4 py-3 text-right font-semibold text-red-600">Rp {formatRupiah(result.totalInterest)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Yearly Table */}
              <h3 className="text-sm font-bold text-gray-700 mb-3">📋 Tabel Cicilan Per Tahun</h3>
              <div className="overflow-x-auto rounded-xl border border-gray-200 mb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500">Tahun</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500">Cicilan/bln</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500">Total Setahun</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500">Sisa Pinjaman</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: result.tenorYears }, (_, i) => {
                      const year = i + 1;
                      let remaining = result.loanAmount;
                      if (rateType === "annuity") {
                        let rem = result.loanAmount;
                        for (let m = 0; m < year * 12; m++) {
                          const intMonth = rem * (result.annualRate / 100 / 12);
                          const prinMonth = result.monthly - intMonth;
                          rem -= prinMonth;
                          if (rem < 0) rem = 0;
                        }
                        remaining = rem;
                      } else {
                        const totalMonths = result.tenorYears * 12;
                        const principalPerMonth = result.loanAmount / totalMonths;
                        remaining = Math.max(0, result.loanAmount - principalPerMonth * year * 12);
                      }
                      return (
                        <tr key={year} className={`${year % 2 === 0 ? "bg-gray-50/50" : ""} border-t border-gray-100`}>
                          <td className="px-4 py-2.5 text-center text-gray-600">{year}</td>
                          <td className="px-4 py-2.5 text-right font-medium">Rp {formatRupiah(result.monthly)}</td>
                          <td className="px-4 py-2.5 text-right text-gray-600">Rp {formatRupiah(result.monthly * 12)}</td>
                          <td className="px-4 py-2.5 text-right text-gray-500">Rp {formatRupiah(remaining)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <p className="text-[11px] text-gray-400">
                * Estimasi saja. Nilai aktual tergantung kebijakan bank. Untuk KPR Anuitas, porsi pokok meningkat & bunga menurun tiap bulan.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ──── Syariah Calculator Component ────
function SyariahCalculator() {
  const [price, setPrice] = useState<string>("575000000");
  const [dpAmount, setDpAmount] = useState<string>("172500000");
  const [tenor, setTenor] = useState<string>("5");
  const [margin, setMargin] = useState<string>("15");
  const [copied, setCopied] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const result = useMemo(() => {
    const p = parseFloat(price) || 0;
    const dp = parseFloat(dpAmount) || 0;
    const t = parseFloat(tenor) || 1;
    const m = parseFloat(margin) || 0;

    const sellingPrice = p * (1 + m / 100);
    const loanAmount = sellingPrice - dp;
    const monthly = loanAmount / (t * 12);
    const totalPayment = loanAmount;
    const profitAmount = p * (m / 100);
    const dpPercentVal = p > 0 ? ((dp / p) * 100) : 0;

    return {
      propertyPrice: p,
      dpAmount: dp,
      dpPercent: dpPercentVal,
      sellingPrice,
      loanAmount,
      monthly,
      tenorYears: t,
      totalPayment,
      profitAmount,
      marginPercent: m,
    };
  }, [price, dpAmount, tenor, margin]);

  const printHtml = useMemo(() => generateSyariahHtml(result), [result]);

  const copyResult = () => {
    const text = `Syariah — ${formatJuta(result.propertyPrice)}jt, DP Rp ${formatRupiah(result.dpAmount)} (${result.dpPercent.toFixed(1)}%), ${result.tenorYears}thn margin ${result.marginPercent}% → Cicilan: Rp ${formatRupiah(result.monthly)}/bln`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success("Disalin ke clipboard!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const resetForm = () => {
    setPrice("575000000");
    setDpAmount("172500000");
    setTenor("5");
    setMargin("15");
  };

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-amber-600" />
            </div>
            Pembiayaan Syariah (Murabahah)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                Harga Properti (Rp)
              </Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="text-lg font-semibold"
              />
              <p className="text-xs text-gray-400">
                Rp {formatRupiah(parseFloat(price) || 0)} ({formatJuta(parseFloat(price) || 0)} jt)
              </p>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <Banknote className="w-3.5 h-3.5 text-gray-400" />
                Uang Muka (DP) — Rupiah
              </Label>
              <Input
                type="number"
                value={dpAmount}
                onChange={(e) => setDpAmount(e.target.value)}
                className="text-lg font-semibold"
                placeholder="Contoh: 172500000"
              />
              <p className="text-xs text-gray-400">
                Rp {formatRupiah(parseFloat(dpAmount) || 0)} ({formatJuta(parseFloat(dpAmount) || 0)} jt) ≈ {result.dpPercent.toFixed(1)}% dari harga
              </p>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                Jangka Waktu (Tenor)
              </Label>
              <Select value={tenor} onValueChange={setTenor}>
                <SelectTrigger className="text-lg font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 7, 10, 15, 20].map((t) => (
                    <SelectItem key={t} value={String(t)}>
                      {t} Tahun ({t * 12} bulan)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
                Margin Keuntungan Bank
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.5"
                  value={margin}
                  onChange={(e) => setMargin(e.target.value)}
                  className="text-lg font-semibold"
                />
                <span className="text-gray-400 font-medium">%</span>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
            <Info className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-[11px] text-amber-700 leading-relaxed">
              <strong>Akad Murabahah</strong> — Bank membeli properti lalu menjualnya ke Anda dengan harga yang sudah ditentukan (margin). Cicilan tetap flat setiap bulan, tanpa bunga fluktuatif.
            </p>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-gray-400 self-center mr-1">Margin:</span>
            {[
              { label: "10%", margin: "10" },
              { label: "12.5%", margin: "12.5" },
              { label: "15%", margin: "15" },
              { label: "20%", margin: "20" },
              { label: "25%", margin: "25" },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => setMargin(preset.margin)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  margin === preset.margin
                    ? "bg-amber-600 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Result Card */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-amber-200 text-sm font-medium">Cicilan per Bulan</p>
              <p className="text-3xl font-bold mt-1">
                Rp {formatRupiah(result.monthly)}
              </p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDetail(true)}
                className="text-amber-200 hover:text-white hover:bg-amber-500/30"
                title="Lihat Detail"
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handlePrint(printHtml)}
                className="text-amber-200 hover:text-white hover:bg-amber-500/30"
                title="Print"
              >
                <Printer className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyResult}
                className="text-amber-200 hover:text-white hover:bg-amber-500/30"
                title="Salin"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={resetForm}
                className="text-amber-200 hover:text-white hover:bg-amber-500/30"
                title="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-amber-200 text-[11px]">Harga Properti</p>
              <p className="text-sm font-semibold mt-0.5">{formatJuta(result.propertyPrice)} jt</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-amber-200 text-[11px]">Uang Muka</p>
              <p className="text-sm font-semibold mt-0.5">{result.dpPercent.toFixed(1)}% ({formatJuta(result.dpAmount)} jt)</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-amber-200 text-[11px]">Harga Jual Bank</p>
              <p className="text-sm font-semibold mt-0.5">{formatJuta(result.sellingPrice)} jt</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-amber-200 text-[11px]">Margin Bank</p>
              <p className="text-sm font-semibold mt-0.5">{formatJuta(result.profitAmount)} jt</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 bg-white/15 rounded-lg px-3 py-2">
            <Info className="w-4 h-4 text-amber-200" />
            <p className="text-sm">
              Cicilan <strong>FLAT</strong> — tidak berubah selama {result.tenorYears} tahun. Tanpa bunga, tanpa denda.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Comparison Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingDown className="w-4 h-4 text-gray-400" />
            Perbandingan Cepat — DP Rp {formatRupiah(parseFloat(dpAmount) || 0)}, Margin {margin}%
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-left">Tenor</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-center">1 thn</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-center">2 thn</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-center">3 thn</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-center">5 thn</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-700 text-xs">Cicilan/bln</td>
                  {[1, 2, 3, 5].map((t) => {
                    const dp = parseFloat(dpAmount) || 0;
                    const p = parseFloat(price) || 0;
                    const m = parseFloat(margin) || 0;
                    const monthly = calcSyariahMonthly(p, dp, m, t);
                    return (
                      <td key={t} className="px-4 py-3 text-center font-semibold text-gray-800">
                        {formatJuta(monthly)} jt
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            Margin {margin}%, harga Rp {formatRupiah(parseFloat(price) || 0)}
          </p>
        </CardContent>
      </Card>

      {/* Detail Dialog (Syariah) */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowDetail(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Dialog Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-600" />
                <h2 className="text-lg font-bold text-gray-900">Detail Simulasi Syariah</h2>
                <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">Murabahah</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handlePrint(printHtml)} className="gap-1.5">
                  <Printer className="w-3.5 h-3.5" /> Print
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setShowDetail(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Dialog Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Highlight */}
              <div className="text-center mb-6 p-6 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-sm text-amber-600 font-medium">Cicilan Per Bulan (Flat)</p>
                <p className="text-3xl font-extrabold text-amber-700 mt-1">Rp {formatRupiah(result.monthly)}</p>
                <p className="text-xs text-amber-500 mt-1">Tetap selama {result.tenorYears} tahun — tanpa bunga, tanpa denda</p>
              </div>

              {/* Detail Table */}
              <div className="rounded-xl border border-gray-200 overflow-hidden mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Keterangan</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500">Nilai</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-gray-100">
                      <td className="px-4 py-3 text-gray-700">Harga Properti</td>
                      <td className="px-4 py-3 text-right font-semibold">Rp {formatRupiah(result.propertyPrice)}</td>
                    </tr>
                    <tr className="border-t border-gray-100">
                      <td className="px-4 py-3 text-gray-700">Uang Muka (DP)</td>
                      <td className="px-4 py-3 text-right font-semibold">Rp {formatRupiah(result.dpAmount)} <span className="text-gray-400 font-normal">({result.dpPercent.toFixed(1)}%)</span></td>
                    </tr>
                    <tr className="border-t border-gray-100">
                      <td className="px-4 py-3 text-gray-700">Margin Bank</td>
                      <td className="px-4 py-3 text-right font-semibold">{result.marginPercent}% <span className="text-gray-400 font-normal">(Rp {formatRupiah(result.profitAmount)})</span></td>
                    </tr>
                    <tr className="border-t border-gray-100">
                      <td className="px-4 py-3 text-gray-700 font-medium">Harga Jual Bank (Akad)</td>
                      <td className="px-4 py-3 text-right font-bold">Rp {formatRupiah(result.sellingPrice)}</td>
                    </tr>
                    <tr className="border-t border-gray-100">
                      <td className="px-4 py-3 text-gray-700">Jumlah Pembiayaan</td>
                      <td className="px-4 py-3 text-right font-semibold">Rp {formatRupiah(result.loanAmount)}</td>
                    </tr>
                    <tr className="border-t border-gray-100">
                      <td className="px-4 py-3 text-gray-700">Tenor</td>
                      <td className="px-4 py-3 text-right font-semibold">{result.tenorYears} Tahun <span className="text-gray-400 font-normal">({result.tenorYears * 12} Bulan)</span></td>
                    </tr>
                    <tr className="border-t border-gray-100 bg-amber-50">
                      <td className="px-4 py-3 text-amber-700 font-semibold">Total Pembayaran</td>
                      <td className="px-4 py-3 text-right font-bold text-amber-700">Rp {formatRupiah(result.totalPayment)}</td>
                    </tr>
                    <tr className="border-t border-gray-100 bg-amber-50/50">
                      <td className="px-4 py-3 text-amber-600 font-medium">Margin Bank (Keuntungan)</td>
                      <td className="px-4 py-3 text-right font-semibold text-amber-600">Rp {formatRupiah(result.profitAmount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Yearly Table */}
              <h3 className="text-sm font-bold text-gray-700 mb-3">📋 Tabel Cicilan Per Tahun</h3>
              <div className="overflow-x-auto rounded-xl border border-gray-200 mb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500">Tahun</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500">Cicilan/bln</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500">Total Setahun</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500">Sisa Pembiayaan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: result.tenorYears }, (_, i) => {
                      const year = i + 1;
                      const remaining = Math.max(0, result.loanAmount - result.monthly * 12 * year);
                      return (
                        <tr key={year} className={`${year % 2 === 0 ? "bg-gray-50/50" : ""} border-t border-gray-100`}>
                          <td className="px-4 py-2.5 text-center text-gray-600">{year}</td>
                          <td className="px-4 py-2.5 text-right font-medium">Rp {formatRupiah(result.monthly)}</td>
                          <td className="px-4 py-2.5 text-right text-gray-600">Rp {formatRupiah(result.monthly * 12)}</td>
                          <td className="px-4 py-2.5 text-right text-gray-500">Rp {formatRupiah(remaining)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <p className="text-[11px] text-gray-400">
                * Estimasi saja. Cicilan Syariah bersifat FLAT selama masa tenor. Tanpa bunga, tanpa denda, tanpa penalti. Sesuai prinsip Akad Murabahah.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ──── Main Page ────
export default function KalkulatorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Calculator className="w-6 h-6" />
          Kalkulator Cicilan
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Hitung simulasi cicilan KPR Bank & Syariah — hasilnya bisa langsung diisi ke grid cicilan proyek
        </p>
      </div>

      <Tabs defaultValue="kpr" className="w-full">
        <TabsList className="w-full max-w-md grid grid-cols-2">
          <TabsTrigger value="kpr" className="gap-1.5">
            <Banknote className="w-4 h-4" />
            KPR Bank
          </TabsTrigger>
          <TabsTrigger value="syariah" className="gap-1.5">
            <Building2 className="w-4 h-4" />
            Syariah
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kpr" className="mt-6">
          <KPRCalculator />
        </TabsContent>

        <TabsContent value="syariah" className="mt-6">
          <SyariahCalculator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
