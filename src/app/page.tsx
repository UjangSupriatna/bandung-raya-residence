"use client";

import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Home,
  MapPin,
  Phone,
  Instagram,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Calculator,
  Shield,
  TreePine,
  Building2,
  Car,
  Wifi,
  CheckCircle2,
  Star,
  Menu,
  X,
  Heart,
  TrendingUp,
  Clock,
  Users,
  Sparkles,
  MessageCircle,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  LandPlot,
  Hammer,
  KeyRound,
  HelpCircle,
  FileText,
  Award,
  Handshake,
  Camera,
  Send,
  User,
  Percent,
  Calendar,
  Eye,
} from "lucide-react";
import MapWrapper from "@/components/map-wrapper";
import Chatbot from "@/components/chatbot";
import { usePropertyStore, type Property } from "@/lib/property-store";
import { useBlogStore, type BlogArticle } from "@/lib/blog-store";
import { useTestimonialStore, type Testimonial } from "@/lib/testimonial-store";
import { useGalleryStore, type GalleryItem } from "@/lib/gallery-store";
import { useBankStore, type BankItem } from "@/lib/bank-store";
import { useSettingsStore } from "@/lib/settings-store";

/* ─────────────────────────── DATA ─────────────────────────── */

const NAV_LINKS = [
  { label: "Home", tab: "home" },
  { label: "Tentang Kami", tab: "tentang" },
  { label: "Proyek", tab: "proyek" },
  { label: "Gallery", tab: "gallery" },
  { label: "Blog", tab: "blog" },
  { label: "Kontak", tab: "kontak" },
] as const;

type PropertyCategory = "inden" | "kavling" | "siap_huni" | "lingkungan" | "proses_bangun";

type GalleryCategory = PropertyCategory | "all";

const CATEGORY_LABELS: Record<string, string> = {
  inden: "Inden",
  kavling: "Kavling",
  siap_huni: "Siap Huni",
  lingkungan: "Lingkungan",
  proses_bangun: "Proses Bangun",
};



/* ── HOME: Ringkas, hook-style, 1-2 kalimat, fokus headline benefit ── */
const FEATURES = [
  { icon: Shield, title: "Syariah & KPR", desc: "Pilih skema syariah (tanpa riba) atau KPR bank sesuai kebutuhan Anda." },
  { icon: MapPin, title: "Lokasi Strategis", desc: "Di jantung Bandung, dekat tol & fasilitas umum." },
  { icon: TreePine, title: "Lingkungan Asri", desc: "Kawasan hijau, aman, dan nyaman untuk keluarga." },
  { icon: Building2, title: "Desain Modern", desc: "Arsitektur premium dengan material terbaik." },
  { icon: TrendingUp, title: "Investasi Cerdas", desc: "Nilai properti naik stabil setiap tahun." },
  { icon: Wifi, title: "Fasilitas Lengkap", desc: "One gate system, keamanan 24 jam & mushola." },
];

/* ── TENTANG KAMI: Detail, proof-based, penjelasan + bukti nyata ── */
const FEATURES_TENTANG = [
  {
    icon: Shield,
    title: "Syariah & KPR Bank",
    subtitle: "Fleksibel — pilih skema yang sesuai kebutuhan",
    points: [
      "Syariah: Akad Murabahah, cicilan flat, tanpa riba & denda",
      "KPR Bank: Kerjasama dengan bank ternama, angsuran kompetitif",
      "DP fleksibel mulai 10% — bisa dicicil",
      "Tenor hingga 25 tahun untuk KPR, hingga 7 tahun untuk Syariah",
    ],
    proof: "Bekerjasama dengan BSI, Bank Muamalat, BTN Syariah, BNI Syariah, dan bank konvensional terkemuka",
    gradient: "from-green-500 to-green-600",
  },
  {
    icon: MapPin,
    title: "Lokasi Premium",
    subtitle: "Strategis di jantung kota Bandung",
    points: [
      "Akses langsung ke jalan tol dan jalan utama",
      "Dekat pusat perbelanjaan dan kawasan bisnis",
      "Dekat sekolah, kampus, dan rumah sakit terkemuka",
      "Transportasi umum mudah dijangkau",
    ],
    proof: "Kawasan berkembang pesat dengan kenaikan nilai properti 15-20% per tahun",
    gradient: "from-red-500 to-red-600",
  },
  {
    icon: TreePine,
    title: "Lingkungan Asri & Aman",
    subtitle: "Konsep kawasan hijau terpadu",
    points: [
      "One gate system dengan keamanan 24 jam",
      "Taman terawat dan jalur hijau di setiap cluster",
      "Playground dan area olahraga untuk warga",
      "Mushola dan fasilitas ibadah lengkap",
    ],
    proof: "98% penghuni merasa nyaman dan puas tinggal di kawasan perumahan kami",
    gradient: "from-emerald-500 to-emerald-600",
  },
  {
    icon: TrendingUp,
    title: "Investasi Menjanjikan",
    subtitle: "Nilai properti terus naik setiap tahun",
    points: [
      "{{UNITS}}+ unit rumah telah terjual di seluruh proyek",
      "Harga properti naik konsisten 15-20% per tahun",
      "3 lokasi proyek: Bandung & Sentul",
      "10+ tahun pengalaman di bidang properti",
    ],
    proof: "Pengembalian investasi rata-rata 2x dalam 5 tahun terakhir",
    gradient: "from-amber-500 to-amber-600",
  },
  {
    icon: Building2,
    title: "Desain Premium & Beragam",
    subtitle: "9+ tipe rumah untuk berbagai kebutuhan",
    points: [
      "Multiple konsep desain: Modern Minimalis, Classic Belanda, dan lainnya",
      "Material berkualitas tinggi dan finishing premium",
      "Tipe rumah dari 21/50 hingga 45/127",
      "Setiap cluster memiliki konsep arsitektur unik",
    ],
    proof: "Tersedia 9 tipe rumah: Inden, Kavling, dan Siap Huni mulai Rp 226 juta",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    icon: FileText,
    title: "Legalitas Lengkap & Aman",
    subtitle: "Semua dokumen terjamin dan transparan",
    points: [
      "Sertifikat SHM (Sertifikat Hak Milik) per unit",
      "IMB / Izin Mendirikan Bangunan lengkap",
      "Akta Notaris resmi dan PJB terdokumentasi",
      "Tim legal profesional mendampingi setiap akad",
    ],
    proof: "Sertifikat SHM diterbitkan langsung untuk setiap unit rumah yang dibeli",
    gradient: "from-blue-500 to-blue-600",
  },
];

/* ─────────────────────────── FAQ DATA ─────────────────────────── */

const FAQ_ITEMS = [
  {
    q: "Apa itu KPR Syariah dan bagaimana bedanya dengan KPR Konvensional?",
    a: "KPR Syariah adalah skema pembiayaan rumah berbasis prinsip Islam tanpa bunga (riba), tanpa denda, dan tanpa penalti. Cicilan bersifat flat sepanjang tenor sehingga lebih mudah dihitung dan tidak akan berubah.",
  },
  {
    q: "Berapa minimal uang muka (DP) untuk membeli rumah?",
    a: "DP minimal mulai dari 30% dari harga rumah. Namun kami juga menyediakan opsi DP hingga 50% untuk cicilan yang lebih ringan. DP juga bisa dicicil sesuai kesepakatan.",
  },
  {
    q: "Berapa lama tenor cicilan yang tersedia?",
    a: "Tenor cicilan tersedia mulai dari 1 tahun hingga 7 tahun, tergantung tipe rumah. Semua cicilan bersifat flat tanpa perubahan sepanjang tenor.",
  },
  {
    q: "Bagaimana proses pembelian rumah?",
    a: "Prosesnya mudah: Konsultasi gratis → Pilih proyek → Hitung cicilan → Booking fee → Akad jual beli → Serah terima kunci. Tim kami akan mendampingi di setiap tahap.",
  },
  {
    q: "Apakah rumah sudah bersertifikat SHM?",
    a: "Ya, seluruh unit rumah sudah bersertifikat SHM (Sertifikat Hak Milik) dan IMB lengkap. Legalitas dijamin aman dan transparan.",
  },
  {
    q: "Apakah bisa beli rumah secara cash / tunai keras?",
    a: "Tentu saja! Kami menerima pembayaran cash keras dengan potongan harga khusus. Hubungi tim marketing kami untuk informasi promo cash terbaru.",
  },
];

/* ─────────────────────────── COMPONENTS ─────────────────────────── */

function FadeIn({
  children,
  delay = 0,
  className = "",
  direction = "up",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const dirMap = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { y: 0, x: 40 },
    right: { y: 0, x: -40 },
  };

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        y: dirMap[direction].y,
        x: dirMap[direction].x,
      }}
      animate={
        isInView
          ? { opacity: 1, y: 0, x: 0 }
          : {
              opacity: 0,
              y: dirMap[direction].y,
              x: dirMap[direction].x,
            }
      }
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────── NAVBAR ─────────────────────────── */

function Navbar({ activeTab }: { activeTab: string }) {
  const { settings: S } = useSettingsStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const isHome = activeTab === "home";
  const isSolid = !isHome || scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleNav = useCallback((tab: string) => {
    setMobileOpen(false);
    router.push(`/?tab=${tab}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [router]);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isSolid
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-red-100"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="/?tab=home" onClick={(e) => { e.preventDefault(); handleNav("home"); }} className="flex items-center gap-2.5 group">
            <img
              src="/images/logo-brr.png"
              alt="Logo BRR"
              className="w-10 h-10 md:w-11 md:h-11 rounded-xl object-contain shadow-lg"
            />
            <div className="flex flex-col leading-tight">
              <span className={`text-[10px] md:text-xs font-semibold tracking-wide ${isSolid ? 'text-gray-500' : 'text-white/70'} transition-colors`}>
                {S.company_legal_name}
              </span>
              <span className={`text-sm md:text-base font-extrabold ${isSolid ? 'text-gray-900' : 'text-white'} transition-colors`}>
                {S.company_name}
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = activeTab === link.tab || (link.tab === "blog" && activeTab.startsWith("blog/"));
              const activeClass = isSolid
                ? "bg-red-50 text-red-700 font-semibold"
                : "text-white font-semibold underline underline-offset-4 decoration-yellow-400 decoration-2";
              const nonActiveClass = isSolid
                ? "text-gray-700 hover:bg-red-50 hover:text-red-700"
                : "text-white/90 hover:text-white hover:bg-white/10";
              return (
                <a
                  key={link.tab}
                  href={`/?tab=${link.tab}`}
                  onClick={(e) => { e.preventDefault(); handleNav(link.tab); }}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${isActive ? activeClass : nonActiveClass}`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden w-11 h-11 flex items-center justify-center rounded-lg transition-colors ${
              isSolid
                ? "text-gray-700 hover:bg-gray-100"
                : "text-white hover:bg-white/10"
            }`}
          >
            {mobileOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 shadow-xl overflow-hidden"
          >
            <nav className="flex flex-col p-4 gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = activeTab === link.tab || (link.tab === "blog" && activeTab.startsWith("blog/"));
                return (
                  <button
                    key={link.tab}
                    onClick={() => handleNav(link.tab)}
                    className={`px-4 py-3 font-medium rounded-xl transition-colors active:bg-red-100 text-left ${
                      isActive
                        ? "bg-red-50 text-red-700"
                        : "text-gray-700 hover:bg-red-50 hover:text-red-700"
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

/* ─────────────────────────── HERO ─────────────────────────── */

function Hero() {
  const { settings: S } = useSettingsStore();
  const router = useRouter();
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* BG Image */}
      <div className="absolute inset-0">
        <img
          src={S.hero_bg_image || "/images/properties/hero_cover.png"}
          alt="{S.company_name}"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 -right-20 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 -left-20 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-6 bg-yellow-500/20 text-yellow-300 border-yellow-500/30 backdrop-blur-sm px-4 py-1.5 text-sm font-medium">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Perumahan Syariah &amp; KPR di Bandung &amp; Sentul
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-6"
          >
            Hunian Nyaman,{" "}
            <span className="text-gradient-gold">Cicilan</span> Ringan
            <br />
            <span className="text-red-400">Syariah &amp; KPR</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed max-w-xl"
          >
            {S.company_name} — Hunian modern dengan skema{" "}
            <span className="text-yellow-400 font-semibold">Syariah &amp; KPR Bank</span>.
            Cicilan mulai{" "}
            <span className="text-yellow-400 font-semibold">Rp 999k/bulan</span>.
            Lokasi strategis, lingkungan asri.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 mb-12"
          >
            <button
              onClick={() => router.push("/?tab=proyek")}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-2xl shadow-2xl shadow-red-900/50 hover:from-red-700 hover:to-red-800 hover:shadow-red-900/70 transition-all active:scale-95 text-lg"
            >
              Lihat Properti
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => router.push("/?tab=proyek")}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-2xl border border-white/20 hover:bg-white/20 transition-all active:scale-95 text-lg"
            >
              <Calculator className="w-5 h-5" />
              Simulasi Cicilan
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-3 gap-4 sm:gap-8 max-w-lg"
          >
            {[
              { value: `${S.total_units_sold}+`, label: "Unit Terjual" },
              { value: "3+", label: "Proyek" },
              { value: "98%", label: "Puas" },
            ].map((stat) => (
              <div key={stat.label} className="text-center sm:text-left">
                <div className="text-2xl sm:text-3xl font-extrabold text-yellow-400">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-400 mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-white/50 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}

/* ─────────────────────────── PROMO STRIP ─────────────────────────── */

function PromoStrip() {
  const { settings: S } = useSettingsStore();
  const [dismissed, setDismissed] = useState(false);

  return (
    <div className={`bg-gradient-to-r from-red-700 via-red-600 to-red-700 transition-all duration-300 ${dismissed ? "h-0 overflow-hidden" : ""}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-white text-sm flex-1 min-w-0">
          <Badge className="bg-yellow-500 text-gray-900 border-0 text-xs font-bold px-2.5 py-0.5 shrink-0">
            🔥 Promo Terbatas
          </Badge>
          <span className="truncate hidden sm:inline">
            DP bisa dicicil! Dapatkan unit impian Anda sebelum harga naik.
          </span>
          <span className="truncate sm:hidden">
            DP bisa dicicil! Promo terbatas.
          </span>
          <a
            href={`https://wa.me/${S.contact_wa}?text=Halo,%20saya%20tertarik%20promo%20terbatas`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-300 font-semibold hover:text-yellow-200 transition-colors whitespace-nowrap ml-auto"
          >
            Tanya Sekarang →
          </a>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-white/60 hover:text-white transition-colors shrink-0"
          aria-label="Tutup promo"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────── FEATURES ─────────────────────────── */

function FeaturesSection() {
  const { settings: S } = useSettingsStore();
  return (
    <section className="py-20 md:py-28 bg-warm-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <Badge
            variant="secondary"
            className="mb-4 bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Keunggulan Kami
          </Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Mengapa Memilih{" "}
            <span className="text-red-600">{S.company_name}</span>?
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Bukan sekadar rumah, tapi investasi masa depan yang aman dan
            berkah untuk keluarga Anda.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat, i) => (
            <FadeIn key={feat.title} delay={i * 0.1}>
              <Card className="h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-red-200 group-hover:shadow-red-300 transition-shadow">
                    <feat.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed">{feat.desc}</p>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── TENTANG KAMI KEUNGGULAN (Detail) ─────────────────────────── */

function TentangKamiKeunggulanSection() {
  const { settings: S } = useSettingsStore();
  return (
    <section className="py-20 md:py-28 bg-warm-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-red-50 text-red-700 border-red-200">
            <Award className="w-3.5 h-3.5 mr-1.5" />
            Keunggulan Kami
          </Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Mengapa <span className="text-red-600">Berpercaya</span> pada Kami?
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Bukan sekadar janji, tapi bukti nyata dari ratusan keluarga yang sudah mempercayai {S.company_name}.
          </p>
        </FadeIn>

        <div className="space-y-6">
          {FEATURES_TENTANG.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <FadeIn key={feat.title} delay={i * 0.08}>
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                  <div className="grid md:grid-cols-[280px_1fr]">
                    {/* Left: icon + title */}
                    <div className={`bg-gradient-to-br ${feat.gradient} p-8 flex flex-col items-center justify-center text-center`}>
                      <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl font-extrabold text-white leading-tight">{feat.title}</h3>
                      <p className="text-white/80 text-sm mt-1.5">{feat.subtitle}</p>
                    </div>

                    {/* Right: detail points + proof */}
                    <CardContent className="p-6 md:p-8">
                      <ul className="space-y-3 mb-5">
                        {feat.points.map((point, j) => (
                          <li key={j} className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                            <span className="text-gray-700 text-sm leading-relaxed">{point.replace("{{UNITS}}", S.total_units_sold)}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="bg-green-50 border border-green-200 rounded-xl p-3.5">
                        <p className="text-sm text-green-700 flex items-start gap-2">
                          <Award className="w-4 h-4 mt-0.5 shrink-0" />
                          <span><strong className="font-semibold">Bukti:</strong> {feat.proof}</span>
                        </p>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── PROPERTY PREVIEW (Home) ─────────────────────────── */

function CompactPropertyCard({
  property,
  onSelect,
}: {
  property: Property;
  onSelect: (p: Property) => void;
}) {
  // Auto-calculate lowest installment
  const finTypes = property.financingTypes ?? ["syariah", "kpr"];
  const hasSyariah = finTypes.includes("syariah");
  const dpOpts = property.dpOptions || [];
  const tenorOpts = property.tenorOptions || [];

  let lowestInstallment = 0;
  if (hasSyariah && dpOpts.length > 0 && tenorOpts.length > 0) {
    const margin = property.syariahMargin ?? 15;
    const vals: number[] = [];
    for (const dp of dpOpts) for (const t of tenorOpts) {
      if (property.price <= 0 || margin <= 0 || t <= 0) continue;
      const dpAmt = property.price * (dp / 100);
      const sp = property.price * (1 + margin / 100);
      vals.push((sp - dpAmt) / (t * 12));
    }
    if (vals.length > 0) lowestInstallment = Math.min(...vals);
  }
  if (property.kprInstallments) {
    const kprVals = Object.values(property.kprInstallments).flatMap((dp) => Object.values(dp)).filter((v) => v > 0);
    if (kprVals.length > 0) {
      const kprLow = Math.min(...kprVals);
      if (lowestInstallment === 0 || kprLow < lowestInstallment) lowestInstallment = kprLow;
    }
  }

  return (
    <FadeIn className="h-full">
      <Card className="group h-full overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer" onClick={() => onSelect(property)}>
        <div className="relative h-40 overflow-hidden">
          <img
            src={property.image}
            alt={property.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-1.5">
            <Badge className="bg-red-600 text-white border-0 shadow-lg text-xs">
              {property.tag}
            </Badge>
          </div>
          <div className="absolute top-3 right-3 flex gap-1">
            {finTypes.includes("syariah") && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-500/90 text-white backdrop-blur-sm">Syariah</span>
            )}
            {finTypes.includes("kpr") && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/90 text-white backdrop-blur-sm">KPR</span>
            )}
          </div>
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="font-bold text-white text-sm leading-tight">{property.name}</h3>
            <p className="text-white/80 text-xs mt-0.5">{property.location}</p>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-extrabold text-red-600">Rp {property.price}</span>
              <span className="text-xs text-gray-500 ml-1">Juta</span>
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
              {lowestInstallment > 0 ? `Rp ${new Intl.NumberFormat("id-ID").format(Math.round(lowestInstallment * 1_000_000))}/bln` : "Hubungi kami"}
            </span>
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  );
}

function PropertyPreviewSection({
  onSelectProperty,
}: {
  onSelectProperty: (p: Property) => void;
}) {
  const { properties: PROPERTIES } = usePropertyStore();
  const [activeCategory, setActiveCategory] = useState<PropertyCategory | "all">("all");
  const router = useRouter();

  const filtered = activeCategory === "all"
    ? PROPERTIES
    : PROPERTIES.filter((p) => p.category === activeCategory);

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 bg-red-50 text-red-700 border-red-200">
            <Home className="w-3.5 h-3.5 mr-1.5" />
            Proyek Kami
          </Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Pilih Proyek <span className="text-red-600">Idaman</span> Anda
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Tersedia berbagai proyek — Siap Huni, Kavling, dan Inden — dengan harga terjangkau dan skema pembayaran Syariah &amp; KPR.
          </p>
        </FadeIn>

        <FadeIn delay={0.1} className="flex justify-center mb-10">
          <Select value={activeCategory} onValueChange={(v) => setActiveCategory(v as PropertyCategory | "all")}>
            <SelectTrigger className="w-[180px] h-10 text-xs font-semibold border-gray-200 focus:ring-red-500 focus:border-red-500">
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              <SelectItem value="inden">Inden</SelectItem>
              <SelectItem value="kavling">Kavling</SelectItem>
              <SelectItem value="siap_huni">Siap Huni</SelectItem>
            </SelectContent>
          </Select>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.slice(0, 6).map((property) => (
            <CompactPropertyCard
              key={property.id}
              property={property}
              onSelect={onSelectProperty}
            />
          ))}
        </div>

        <FadeIn className="text-center mt-10">
          <button
            onClick={() => router.push("/?tab=proyek")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-50 text-red-700 font-semibold rounded-xl hover:bg-red-100 transition-colors"
          >
            Lihat Semua Proyek
            <ArrowRight className="w-4 h-4" />
          </button>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─────────────────────────── CARA BELI ─────────────────────────── */

function CaraBeliSection() {
  const { settings: S } = useSettingsStore();
  const steps = [
    { num: 1, title: "Konsultasi Gratis", desc: "Hubungi kami via WhatsApp untuk konsultasi gratis tentang pilihan rumah dan skema pembayaran.", icon: MessageCircle, gradient: "from-green-500 to-green-600" },
    { num: 2, title: "Pilih Proyek", desc: "Pilih proyek yang sesuai kebutuhan dan budget Anda dari pilihan Siap Huni, Kavling, atau Inden.", icon: Home, gradient: "from-red-500 to-red-600" },
    { num: 3, title: "Hitung Cicilan", desc: "Gunakan kalkulator simulasi cicilan kami untuk menentukan DP dan tenor yang tepat.", icon: Calculator, gradient: "from-amber-500 to-amber-600" },
    { num: 4, title: "Booking & Akad", desc: "Lakukan booking fee dan proses akad jual beli. Serah terima kunci dan rumah siap huni!", icon: KeyRound, gradient: "from-purple-500 to-purple-600" },
  ];

  return (
    <section className="py-20 md:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-green-50 text-green-700 border-green-200">
            <Handshake className="w-3.5 h-3.5 mr-1.5" />
            Cara Memiliki Rumah
          </Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Proses <span className="text-red-600">Mudah</span> & Transparan
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Hanya 4 langkah untuk memiliki rumah impian Anda.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden lg:block absolute top-16 left-[calc(12.5%+24px)] right-[calc(12.5%+24px)] h-0.5 bg-gradient-to-r from-green-300 via-red-300 to-purple-300 z-0" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <FadeIn key={step.num} delay={i * 0.15}>
                <div className="relative z-10 text-center">
                  <div className={`w-16 h-16 mx-auto mb-5 bg-gradient-to-br ${step.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="w-8 h-8 mx-auto -mt-8 mb-4 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center relative z-10">
                    <span className="text-sm font-extrabold text-gray-700">{step.num}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </FadeIn>
            );
          })}
        </div>

        <FadeIn className="flex flex-col sm:flex-row gap-4 justify-center mt-14">
          <a
            href={`https://wa.me/${S.contact_wa}?text=Halo,%20saya%20ingin%20cek%20unit%20tersedia`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-600 text-white font-bold rounded-2xl shadow-lg hover:bg-green-700 transition-all active:scale-95 text-lg"
          >
            <MessageCircle className="w-5 h-5" />
            Cek Unit Tersedia
          </a>
          <a
            href="/?tab=proyek"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-red-600 text-white font-bold rounded-2xl shadow-lg hover:bg-red-700 transition-all active:scale-95 text-lg"
          >
            <Calculator className="w-5 h-5" />
            Hitung Cicilan Saya
          </a>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─────────────────────────── TESTIMONIALS ─────────────────────────── */

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
      <CardContent className="p-6">
        {/* Stars */}
        <div className="flex gap-0.5 mb-4">
          {Array.from({ length: 5 }).map((_, si) => (
            <Star
              key={si}
              className={`w-4 h-4 ${
                si < t.rating
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-200"
              }`}
            />
          ))}
        </div>

        <p className="text-gray-600 leading-relaxed mb-6 italic">
          &ldquo;{t.text}&rdquo;
        </p>

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {t.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 text-sm truncate">
              {t.name}
            </p>
            <p className="text-xs text-gray-400 truncate">{t.role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TestimonialsSection({ limit }: { limit?: number }) {
  const { testimonials, fetchTestimonials } = useTestimonialStore();

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const items = testimonials.length > 0 ? testimonials : [];
  const displayItems = limit ? items.slice(0, limit) : items;

  if (displayItems.length === 0) {
    return null;
  }

  // If limit is passed, show static grid (e.g. on Home page)
  if (limit) {
    return (
      <section className="py-20 md:py-28 bg-warm-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <Badge
              variant="secondary"
              className="mb-4 bg-yellow-50 text-yellow-700 border-yellow-200"
            >
              <Star className="w-3.5 h-3.5 mr-1.5" />
              Testimoni Warga
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Apa Kata <span className="text-red-600">Penghuni</span> Kami?
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              Dengarkan cerita dan pengalaman warga yang sudah memilih Bandung
              Raya Residence sebagai rumah mereka.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayItems.map((t, i) => (
              <FadeIn key={t.id} delay={i * 0.1}>
                <TestimonialCard t={t} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Infinite vertical scroll marquee — duplicates items for seamless loop
  const duplicated = [...displayItems, ...displayItems];

  return (
    <section className="py-20 md:py-28 bg-warm-bg overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-12">
          <Badge
            variant="secondary"
            className="mb-4 bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            <Star className="w-3.5 h-3.5 mr-1.5" />
            Testimoni Warga
          </Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Apa Kata <span className="text-red-600">Penghuni</span> Kami?
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Dengarkan cerita dan pengalaman warga yang sudah memilih Bandung
            Raya Residence sebagai rumah mereka.
          </p>
        </FadeIn>
      </div>

      {/* Marquee viewport — 2 cols × 3 rows on desktop, 1 col × 3 rows on mobile */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top fade */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-warm-bg to-transparent z-10 pointer-events-none" />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-warm-bg z-10 pointer-events-none" />

        <div
          className="overflow-hidden"
          style={{ maxHeight: "calc(3 * 14.5rem + 2 * 1.5rem)" }}
        >
          <div className="animate-[testimonial-scroll_40s_linear_infinite] grid grid-cols-1 md:grid-cols-2 gap-6 hover:[animation-play-state:paused]">
            {duplicated.map((t, i) => (
              <TestimonialCard key={`${t.id}-${i}`} t={t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── FAQ ─────────────────────────── */

function FAQSection() {
  return (
    <section className="py-20 md:py-28 bg-warm-bg">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 bg-red-50 text-red-700 border-red-200">
            <HelpCircle className="w-3.5 h-3.5 mr-1.5" />
            FAQ
          </Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Pertanyaan <span className="text-red-600">Umum</span>
          </h2>
          <p className="text-gray-500 text-lg">
            Jawaban atas pertanyaan yang sering ditanyakan calon pembeli.
          </p>
        </FadeIn>

        <FadeIn>
          <Accordion type="single" collapsible className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-white rounded-xl border border-gray-200 px-6 shadow-sm data-[state=open]:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-base font-semibold text-gray-900 hover:text-red-700 hover:no-underline py-5">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed pb-5">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─────────────────────────── GALLERY PREVIEW (Home) ─────────────────────────── */

function GalleryPreviewSection() {
  const { galleryItems, loading: galleryLoading, fetchGalleryItems } = useGalleryStore();
  const { settings: S } = useSettingsStore();
  const router = useRouter();

  useEffect(() => { fetchGalleryItems(); }, [fetchGalleryItems]);

  const previewItems = galleryItems.slice(0, 8);

  if (galleryLoading || previewItems.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-warm-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 bg-red-50 text-red-700 border-red-200">
            <Camera className="w-3.5 h-3.5 mr-1.5" />
            Dokumentasi
          </Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Galeri <span className="text-red-600">Foto</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Dokumentasi proyek dan lingkungan {S.company_name}.
          </p>
        </FadeIn>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {previewItems.map((img, i) => (
            <FadeIn key={img.id} delay={i * 0.05}>
              <div className="aspect-[4/3] overflow-hidden rounded-xl shadow-md group cursor-pointer">
                <img
                  src={img.image}
                  alt={img.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </FadeIn>
          ))}
        </div>
        <FadeIn className="text-center mt-10">
          <button
            onClick={() => router.push("/?tab=gallery")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-50 text-red-700 font-semibold rounded-xl hover:bg-red-100 transition-colors"
          >
            Lihat Semua Foto
            <ArrowRight className="w-4 h-4" />
          </button>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─────────────────────────── CTA ─────────────────────────── */

function CTASection() {
  const { settings: S } = useSettingsStore();
  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-red-700 via-red-600 to-red-800 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-red-400/20 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeIn>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-yellow-300 text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            Unit Terbatas Bulan Ini
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
            Jangan Tunda Lagi!
            <br />
            <span className="text-yellow-300">
              Miliki Rumah Impian Anda Sekarang
            </span>
          </h2>

          <p className="text-red-100 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            Hubungi kami sekarang untuk konsultasi gratis. Tim marketing kami
            siap membantu Anda menemukan rumah yang tepat.
          </p>

          {/* Trust pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {["DP bisa dicicil", "Tanpa bunga / riba", "Tanpa denda", "Booking fee terjangkau"].map((pill) => (
              <span
                key={pill}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 backdrop-blur-sm text-white text-sm rounded-full border border-white/10"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                {pill}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`https://wa.me/${S.contact_wa}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-500 text-white font-bold rounded-2xl shadow-2xl hover:bg-green-600 transition-all active:scale-95 text-lg"
            >
              <MessageCircle className="w-5 h-5" />
              Booking Sekarang
            </a>
            <a
              href={`https://wa.me/${S.contact_wa}?text=Halo,%20saya%20ingin%20cek%20unit%20tersedia`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-2xl border border-white/20 hover:bg-white/20 transition-all active:scale-95 text-lg"
            >
              <Home className="w-5 h-5" />
              Cek Unit Tersedia
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─────────────────────────── BLOG PREVIEW ─────────────────────────── */

function BlogPreviewSection() {
  const router = useRouter();
  const { articles } = useBlogStore();
  const displayArticles = articles.slice(0, 3);

  const COLORS = [
    "from-red-500 to-red-600",
    "from-amber-500 to-amber-600",
    "from-green-500 to-green-600",
    "from-blue-500 to-blue-600",
    "from-purple-500 to-purple-600",
    "from-teal-500 to-teal-600",
    "from-orange-500 to-orange-600",
    "from-emerald-500 to-emerald-600",
  ];

  return (
    <section className="py-20 md:py-28 bg-warm-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 bg-red-50 text-red-700 border-red-200">
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
            Blog & Artikel
          </Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Informasi <span className="text-red-600">Terbaru</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Tips, panduan, dan informasi seputar properti, KPR, dan investasi rumah.
          </p>
        </FadeIn>

        {displayArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayArticles.map((article, i) => {
              const color = COLORS[i % COLORS.length];
              const coverImg = article.images?.[0];
              return (
                <FadeIn key={article.id} delay={i * 0.1}>
                  <Card onClick={() => router.push(`/?tab=blog/${article.slug}`)} className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group cursor-pointer">
                    <div className="h-40 overflow-hidden relative">
                      {coverImg ? (
                        <img src={coverImg} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className={`h-full bg-gradient-to-br ${color} flex items-center justify-center`}>
                          <BookOpen className="w-12 h-12 text-white/30" />
                        </div>
                      )}
                      <Badge className="absolute top-3 left-3 bg-white/20 text-white border-0 backdrop-blur-sm text-xs">
                        {article.category}
                      </Badge>
                    </div>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                        <span>{article.dateFormatted || article.createdAt}</span>
                        <span>•</span>
                        <span>{article.readTime || "5 menit"}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{article.views || 0}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2 group-hover:text-red-700 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                        {article.excerpt}
                      </p>
                    </CardContent>
                  </Card>
                </FadeIn>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Belum ada artikel.</p>
          </div>
        )}

        <FadeIn className="text-center mt-10">
          <button
            onClick={() => router.push("/?tab=blog")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-50 text-red-700 font-semibold rounded-xl hover:bg-red-100 transition-colors"
          >
            Lihat Semua Artikel
            <ArrowRight className="w-4 h-4" />
          </button>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─────────────────────────── PAGE BANNER ─────────────────────────── */

function PageBanner({ title, subtitle, bgImage }: { title: string; subtitle?: string; bgImage?: string }) {
  return (
    <section className="relative min-h-[50vh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={bgImage || "/images/properties/hero_cover.png"}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg text-gray-300 max-w-2xl">{subtitle}</p>
          )}
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────── PROPERTIES (existing) ─────────────────────────── */

function PropertyCard({
  property,
  onSelect,
}: {
  property: Property;
  onSelect: (p: Property) => void;
}) {
  // Auto-calculate lowest installment for Syariah
  const finTypes = property.financingTypes ?? ["syariah", "kpr"];
  const hasSyariah = finTypes.includes("syariah");
  const dpOpts = property.dpOptions || [];
  const tenorOpts = property.tenorOptions || [];

  let lowestInstallment = 0;
  if (hasSyariah && dpOpts.length > 0 && tenorOpts.length > 0) {
    const margin = property.syariahMargin ?? 15;
    const vals: number[] = [];
    for (const dp of dpOpts) for (const t of tenorOpts) {
      if (property.price <= 0 || margin <= 0 || t <= 0) continue;
      const dpAmt = property.price * (dp / 100);
      const sp = property.price * (1 + margin / 100);
      vals.push((sp - dpAmt) / (t * 12));
    }
    if (vals.length > 0) lowestInstallment = Math.min(...vals);
  }
  // Also check KPR data
  if (property.kprInstallments) {
    const kprVals = Object.values(property.kprInstallments).flatMap((dp) => Object.values(dp)).filter((v) => v > 0);
    if (kprVals.length > 0) {
      const kprLow = Math.min(...kprVals);
      if (lowestInstallment === 0 || kprLow < lowestInstallment) lowestInstallment = kprLow;
    }
  }

  return (
    <FadeIn className="h-full">
      <Card className="group h-full overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
        {/* Image */}
        <div className="relative h-52 overflow-hidden">
          <img
            src={property.image}
            alt={property.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-1.5">
            {property.tag && (
              <Badge className="bg-red-600 text-white border-0 shadow-lg text-[10px] px-2">
                {property.tag}
              </Badge>
            )}
            <Badge className="bg-white/90 text-gray-700 border-0 shadow-lg text-[10px] px-2">
              {CATEGORY_LABELS[property.category as PropertyCategory] || property.category}
            </Badge>
          </div>
          <div className="absolute top-3 right-3 flex gap-1">
            {finTypes.includes("syariah") && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-500/90 text-white backdrop-blur-sm">Syariah</span>
            )}
            {finTypes.includes("kpr") && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/90 text-white backdrop-blur-sm">KPR</span>
            )}
          </div>
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-white text-xs flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {property.location}
            </p>
          </div>
        </div>

        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="bg-red-50 text-red-700 text-xs font-semibold">
              {CATEGORY_LABELS[property.category as PropertyCategory] || property.category}
            </Badge>
            <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs font-semibold">
              {property.type}
            </Badge>
          </div>

          <h3 className="font-bold text-base text-gray-900 mb-1 group-hover:text-red-700 transition-colors line-clamp-1">
            {property.name}
          </h3>

          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-2xl font-extrabold text-red-600">
              Rp {property.price}{" "}
              <span className="text-sm font-medium text-gray-500">Juta</span>
            </span>
          </div>

          {/* Spec pills: LT, LB, KT, KM */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <p className="text-[10px] text-gray-400">LB</p>
              <p className="text-xs font-bold text-gray-700">{property.buildingArea}<span className="text-[10px] font-normal"> m²</span></p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <p className="text-[10px] text-gray-400">LT</p>
              <p className="text-xs font-bold text-gray-700">{property.landArea}<span className="text-[10px] font-normal"> m²</span></p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <p className="text-[10px] text-gray-400">KT</p>
              <p className="text-xs font-bold text-gray-700">{property.bedrooms}</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <p className="text-[10px] text-gray-400">KM</p>
              <p className="text-xs font-bold text-gray-700">{property.bathrooms}</p>
            </div>
          </div>

          {/* Features */}
          {(() => {
            let featList: string[] = [];
            try {
              const raw = typeof property.features === "string" ? JSON.parse(property.features) : property.features;
              featList = Array.isArray(raw) ? raw.map(String) : typeof raw === "string" && raw.trim() ? raw.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
            } catch { featList = []; }
            if (featList.length === 0) return null;
            return (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {featList.slice(0, 4).map((f) => (
                  <span key={f} className="text-[11px] px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded-md border border-yellow-200">
                    {f}
                  </span>
                ))}
                {featList.length > 4 && (
                  <span className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md">
                    +{featList.length - 4}
                  </span>
                )}
              </div>
            );
          })()}

          <Separator className="mb-3" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Cicilan Mulai</p>
              <p className="text-sm font-bold text-green-600">
                {lowestInstallment > 0 ? `Rp ${new Intl.NumberFormat("id-ID").format(Math.round(lowestInstallment * 1_000_000))}/bln` : "Hubungi kami"}
              </p>
            </div>
            <Button onClick={() => onSelect(property)} size="sm" className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-md shadow-red-200">
              Detail <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  );
}

/* ─────────────────────────── PAGINATION ─────────────────────────── */
const PROYEK_PER_PAGE = 9;
const GALLERY_PER_PAGE = 12;

function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (p: number) => void }) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all disabled:opacity-30 disabled:pointer-events-none"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold transition-all ${
              currentPage === p
                ? "bg-red-600 text-white shadow-md shadow-red-200"
                : "border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all disabled:opacity-30 disabled:pointer-events-none"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function PropertiesSection({
  onSelectProperty,
}: {
  onSelectProperty: (p: Property) => void;
}) {
  const { properties: PROPERTIES } = usePropertyStore();
  const [filter, setFilter] = useState<"semua" | "termurah" | "terlaris">(
    "semua"
  );
  const [activeCategory, setActiveCategory] = useState<PropertyCategory | "all">("all");
  const [page, setPage] = useState(1);
  const [prevFilterKey, setPrevFilterKey] = useState(`${activeCategory}-${filter}`);

  if (prevFilterKey !== `${activeCategory}-${filter}`) {
    setPrevFilterKey(`${activeCategory}-${filter}`);
    setPage(1);
  }

  const filtered = PROPERTIES.filter((p) => {
    if (activeCategory !== "all" && p.category !== activeCategory) return false;
    if (filter === "termurah") return p.price <= 250;
    if (filter === "terlaris")
      return ["Best Seller", "Populer", "Eksklusif"].includes(p.tag);
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PROYEK_PER_PAGE);
  const paged = filtered.slice((page - 1) * PROYEK_PER_PAGE, page * PROYEK_PER_PAGE);

  const categories: { key: PropertyCategory | "all"; label: string; icon: typeof Hammer }[] = [
    { key: "all", label: "Semua", icon: Home },
    { key: "inden", label: "Inden", icon: Hammer },
    { key: "kavling", label: "Kavling", icon: LandPlot },
    { key: "siap_huni", label: "Siap Huni", icon: KeyRound },
  ];

  return (
    <section className="py-20 md:py-28 bg-warm-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-12">
          <Badge
            variant="secondary"
            className="mb-4 bg-red-50 text-red-700 border-red-200"
          >
            <Home className="w-3.5 h-3.5 mr-1.5" />
            Katalog Properti
          </Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Pilih Rumah <span className="text-red-600">Idaman</span> Anda
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Tersedia berbagai tipe rumah dengan harga terjangkau dan skema
            pembayaran Syariah & KPR yang fleksibel.
          </p>
        </FadeIn>

        {/* Filter Inputs */}
        <FadeIn delay={0.1} className="flex justify-center gap-3 mb-10">
          <Select value={activeCategory} onValueChange={(v) => setActiveCategory(v as PropertyCategory | "all")}>
            <SelectTrigger className="w-[160px] h-10 text-xs font-semibold border-gray-200 focus:ring-red-500 focus:border-red-500">
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              <SelectItem value="inden">Inden</SelectItem>
              <SelectItem value="kavling">Kavling</SelectItem>
              <SelectItem value="siap_huni">Siap Huni</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filter} onValueChange={(v) => setFilter(v as "semua" | "termurah" | "terlaris")}>
            <SelectTrigger className="w-[160px] h-10 text-xs font-semibold border-gray-200 focus:ring-red-500 focus:border-red-500">
              <SelectValue placeholder="Semua Harga" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Harga</SelectItem>
              <SelectItem value="termurah">Termurah</SelectItem>
              <SelectItem value="terlaris">Terlaris</SelectItem>
            </SelectContent>
          </Select>
        </FadeIn>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paged.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onSelect={onSelectProperty}
            />
          ))}
        </div>

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </section>
  );
}

/* ─────────────────────────── LIGHTBOX ─────────────────────────── */

function LightboxOverlay({
  images,
  activeIndex,
  onClose,
}: {
  images: string[];
  activeIndex: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(activeIndex);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && current > 0) setCurrent((c) => c - 1);
      if (e.key === "ArrowRight" && current < images.length - 1)
        setCurrent((c) => c + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, images.length, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-lg">
        {current + 1} / {images.length}
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (current > 0) setCurrent((c) => c - 1);
            }}
            disabled={current === 0}
            className={`absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 flex items-center justify-center rounded-full transition-all ${
              current === 0
                ? "bg-white/5 text-white/20 cursor-not-allowed"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (current < images.length - 1) setCurrent((c) => c + 1);
            }}
            disabled={current === images.length - 1}
            className={`absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 flex items-center justify-center rounded-full transition-all ${
              current === images.length - 1
                ? "bg-white/5 text-white/20 cursor-not-allowed"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </>
      )}

      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.25 }}
          src={images[current]}
          alt={`Foto ${current + 1}`}
          className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
      </AnimatePresence>

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto px-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrent(idx);
              }}
              className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                current === idx
                  ? "border-red-500 opacity-100"
                  : "border-transparent opacity-40 hover:opacity-80"
              }`}
            >
              <img
                src={img}
                alt={`Mini ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ─────────────────────────── PROPERTY GALLERY ─────────────────────────── */

function PropertyGallery({
  images,
  name,
  tag,
  location,
}: {
  images: string[];
  name: string;
  tag: string;
  location: string;
}) {
  const [activeImg, setActiveImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      <div
        className="relative h-72 sm:h-80 overflow-hidden rounded-t-xl cursor-pointer group"
        onClick={() => setLightboxOpen(true)}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={activeImg}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            src={images[activeImg]}
            alt={`${name} - Foto ${activeImg + 1}`}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
          <Camera className="w-4 h-4" />
        </div>
        <div className="absolute bottom-4 left-6 right-6">
          <Badge className="bg-red-600 text-white border-0 mb-2">
            {tag}
          </Badge>
          <h3 className="text-2xl font-extrabold text-white">
            {name}
          </h3>
          <p className="text-white/80 text-sm flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5" />
            {location}
          </p>
        </div>
        {images.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg">
            {activeImg + 1}/{images.length}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 p-3 bg-gray-50 overflow-x-auto">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveImg(idx);
                setLightboxOpen(true);
              }}
              className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                activeImg === idx
                  ? "border-red-600 shadow-md shadow-red-200"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {lightboxOpen && (
          <LightboxOverlay
            images={images}
            activeIndex={activeImg}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ─────────────────────────── PROPERTY DETAIL DIALOG ─────────────────────────── */

function PropertyDetailDialog({
  property,
  open,
  onClose,
}: {
  property: Property | null;
  open: boolean;
  onClose: () => void;
}) {
  const { settings: S } = useSettingsStore();
  const images = property?.gallery || (property ? [property.image] : []);

  if (!property) return null;

  const formatRp = (n: number) =>
    new Intl.NumberFormat("id-ID").format(Math.round(n));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{property.name} - {property.type}</DialogTitle>
          <DialogDescription>Detail properti {property.name} tipe {property.type} di {property.location}</DialogDescription>
        </DialogHeader>
        <PropertyGallery
          images={images}
          name={property.name}
          tag={property.tag}
          location={property.location}
        />

        <div className="p-6">
          {/* Title & Badges */}
          <div className="flex items-start gap-2 mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-extrabold text-gray-900">{property.name}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                {property.location}
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Badge variant="secondary" className="bg-red-50 text-red-700 text-xs font-semibold w-fit">
                {CATEGORY_LABELS[property.category as PropertyCategory] || property.category}
              </Badge>
              <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs w-fit">
                {property.type}
              </Badge>
              <div className="flex gap-1">
                {(property.financingTypes ?? []).includes("syariah") && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-100 text-green-700">Syariah</span>
                )}
                {(property.financingTypes ?? []).includes("kpr") && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">KPR Bank</span>
                )}
              </div>
            </div>
          </div>

          {/* Price & Type */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <p className="text-xs text-red-500 uppercase tracking-wider mb-1">Harga Rumah</p>
              <p className="text-xl font-extrabold text-red-700">Rp {formatRp(property.price * 1_000_000)}</p>
              <p className="text-[11px] text-red-400 mt-0.5">({property.price} Juta)</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 text-center">
              <p className="text-xs text-yellow-600 uppercase tracking-wider mb-1">Tipe Bangunan</p>
              <p className="text-xl font-extrabold text-yellow-700">{property.type}</p>
              <p className="text-[11px] text-yellow-500 mt-0.5">LB {property.buildingArea} m² / LT {property.landArea} m²</p>
            </div>
          </div>

          {/* Spec Grid: LB, LT, KT, KM */}
          <div className="grid grid-cols-4 gap-2 mb-5">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
              <Building2 className="w-5 h-5 text-red-500 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400">Luas Bangun</p>
                <p className="font-bold text-sm">{property.buildingArea} m²</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
              <LandPlot className="w-5 h-5 text-red-500 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400">Luas Tanah</p>
                <p className="font-bold text-sm">{property.landArea} m²</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
              <Home className="w-5 h-5 text-red-500 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400">Kamar Tidur</p>
                <p className="font-bold text-sm">{property.bedrooms}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
              <Users className="w-5 h-5 text-red-500 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400">Kamar Mandi</p>
                <p className="font-bold text-sm">{property.bathrooms}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div className="mb-5">
              <h4 className="font-bold text-gray-900 mb-2">Deskripsi</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{property.description}</p>
            </div>
          )}

          {/* Features */}
          {(() => {
            let featList: string[] = [];
            try {
              const raw = typeof property.features === "string" ? JSON.parse(property.features) : property.features;
              featList = Array.isArray(raw) ? raw.map(String) : typeof raw === "string" && raw.trim() ? raw.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
            } catch { featList = []; }
            if (featList.length === 0) return null;
            return (
              <div className="mb-5">
                <h4 className="font-bold text-gray-900 mb-2">Fitur Unggulan</h4>
                <div className="flex flex-wrap gap-2">
                  {featList.map((f) => (
                    <div key={f} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* CTA Buttons */}
          <div className="flex gap-3">
            <a
              href={`https://wa.me/${S.contact_wa}?text=Halo,%20saya%20tertarik%20dengan%20rumah%20${encodeURIComponent(property.name)}%20${encodeURIComponent(property.type)}%20di%20${encodeURIComponent(property.location)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
            <a
              href={`tel:${S.contact_phone.replace(/-/g, "")}`}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
            >
              <Phone className="w-4 h-4" />
              Telepon
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─────────────────────────── CALCULATOR ─────────────────────────── */

function CalculatorSection() {
  const { settings: S } = useSettingsStore();
  const { properties: PROPERTIES } = usePropertyStore();
  const [finType, setFinType] = useState<"syariah" | "kpr">("syariah");
  const [selectedPropId, setSelectedPropId] = useState("");
  const [dp, setDp] = useState("30");
  const [tenor, setTenor] = useState("5");

  const effectivePropId = selectedPropId || PROPERTIES[0]?.id || "";

  const prop = PROPERTIES.find((p) => p.id === effectivePropId);
  const dpNum = parseInt(dp);
  const tenorNum = parseInt(tenor);
  const dpAmount = prop ? prop.price * dpNum / 100 : 0;
  const remaining = prop ? prop.price - dpAmount : 0;

  // Available financing types for this property
  const finTypes = prop?.financingTypes ?? ["syariah", "kpr"];
  const hasSyariah = finTypes.includes("syariah");
  const hasKPR = finTypes.includes("kpr");

  // Effective fin type: only show what's available
  const effectiveFinType = !hasSyariah && hasKPR ? "kpr" : !hasKPR && hasSyariah ? "syariah" : finType;

  /* Syariah: auto-calculate from margin */
  const syariahMonthly = (() => {
    if (!prop || !hasSyariah) return 0;
    const margin = prop.syariahMargin ?? 15;
    if (prop.price <= 0 || margin <= 0 || tenorNum <= 0) return 0;
    const dpAmt = prop.price * 1_000_000 * (dpNum / 100);
    const sellingPrice = prop.price * 1_000_000 * (1 + margin / 100);
    const loan = sellingPrice - dpAmt;
    return loan / (tenorNum * 12) / 1_000_000;
  })();

  /* KPR: from saved grid data or annuity formula fallback */
  const kprMonthly = (() => {
    if (!prop || !hasKPR) return 0;
    // Try from saved KPR grid first
    const saved = prop.kprInstallments?.[dpNum]?.[tenorNum];
    if (saved && saved > 0) return saved;
    // Fallback: annuity formula with 7.5% p.a.
    const loan = remaining * 1_000_000;
    const r = 0.075 / 12;
    const n = tenorNum * 12;
    if (r === 0 || n === 0) return 0;
    return (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) / 1_000_000;
  })();

  const monthly = effectiveFinType === "syariah" ? syariahMonthly : kprMonthly;
  const isFlat = effectiveFinType === "syariah";

  const formatRp = (n: number) =>
    new Intl.NumberFormat("id-ID").format(Math.round(n));

  const handlePropertyChange = (newId: string) => {
    setSelectedPropId(newId);
    const newProp = PROPERTIES.find((p) => p.id === newId);
    if (newProp) {
      const newTypes = newProp.financingTypes ?? ["syariah", "kpr"];
      if (finType === "syariah" && newTypes.includes("syariah")) {
        if (!newProp.dpOptions.includes(dpNum)) setDp(String(newProp.dpOptions[0]));
        if (!newProp.tenorOptions.includes(tenorNum)) setTenor(String(newProp.tenorOptions[newProp.tenorOptions.length - 1]));
      } else if (finType === "kpr" && newTypes.includes("kpr")) {
        const dps = newProp.kprDpOptions ?? [10, 15, 20, 30];
        if (!dps.includes(dpNum)) setDp(String(dps[0]));
        const tenors = newProp.kprTenorOptions ?? [5, 10, 15, 20];
        if (!tenors.includes(tenorNum)) setTenor(String(tenors[0]));
      } else {
        // Switch to first available type
        const first = newTypes[0] || "syariah";
        setFinType(first as "syariah" | "kpr");
      }
    }
  };

  const handleFinTypeChange = (type: "syariah" | "kpr") => {
    setFinType(type);
    if (type === "syariah" && prop) {
      if (!prop.dpOptions.includes(dpNum)) setDp(String(prop.dpOptions[0]));
      if (!prop.tenorOptions.includes(tenorNum)) setTenor(String(prop.tenorOptions[prop.tenorOptions.length - 1]));
    } else if (type === "kpr" && prop) {
      const dps = prop.kprDpOptions ?? [10, 15, 20, 30];
      if (!dps.includes(dpNum)) setDp(String(dps[0]));
      const tenors = prop.kprTenorOptions ?? [5, 10, 15, 20];
      if (!tenors.includes(tenorNum)) setTenor(String(tenors[0]));
    }
  };

  const dpOptions = effectiveFinType === "syariah"
    ? (prop?.dpOptions ?? [30, 50])
    : (prop?.kprDpOptions ?? [10, 15, 20, 30]);
  const tenorOptions = effectiveFinType === "syariah"
    ? (prop?.tenorOptions ?? [1, 5])
    : (prop?.kprTenorOptions ?? [5, 10, 15, 20]);
  const dpMin = dpOptions[0];
  const dpMax = dpOptions[dpOptions.length - 1];
  const tenorMin = tenorOptions[0];
  const tenorMax = tenorOptions[tenorOptions.length - 1];

  return (
    <section id="simulasi" className="py-20 md:py-28 bg-warm-bg relative">
      {/* Decorative circles — clipped independently */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-red-100/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-yellow-100/50 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-8">
          <Badge
            variant="secondary"
            className="mb-4 bg-red-50 text-red-700 border-red-200"
          >
            <Calculator className="w-3.5 h-3.5 mr-1.5" />
            Simulasi Cicilan
          </Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Hitung <span className="text-red-600">Cicilan</span> Anda
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Kalkulator simulasi cicilan {effectiveFinType === "syariah" ? "syariah" : "KPR"}. Tentukan DP dan tenor sesuai
            kemampuan Anda.
          </p>
        </FadeIn>

        {/* Financing Type Tabs: only show available types */}
        {hasSyariah && hasKPR && (
        <FadeIn delay={0.05} className="flex justify-center mb-10">
          <div className="inline-flex bg-white rounded-2xl p-1.5 shadow-md border border-gray-100">
            {(["syariah", "kpr"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleFinTypeChange(type)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  finType === type
                    ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-200"
                    : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                }`}
              >
                {type === "syariah" ? "Islamic (Syariah)" : "KPR Bank"}
              </button>
            ))}
          </div>
        </FadeIn>
        )}

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto items-start">
          <FadeIn direction="left" className="min-w-0 overflow-hidden">
            <Card className="border-0 shadow-xl min-w-0 overflow-hidden">
              <CardContent className="p-5 md:p-8 space-y-6">
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Pilih Properti
                  </Label>
                  <Select value={effectivePropId} onValueChange={handlePropertyChange}>
                    <SelectTrigger className="h-12 text-sm md:text-base w-full !whitespace-normal">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-w-[min(90vw,20rem)]">
                      {PROPERTIES.map((p) => (
                        <SelectItem key={p.id} value={p.id} className="py-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-sm leading-tight">{p.name}</span>
                            <span className="text-xs text-gray-500">Rp {p.price} Juta</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Uang Muka (DP): {dp}%
                  </Label>
                  <input
                    type="range"
                    min={dpMin}
                    max={dpMax}
                    step={dpOptions.length > 2 && (dpOptions[1] - dpOptions[0]) > 5 ? (dpOptions[1] - dpOptions[0]) : 5}
                    value={dp}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      const closest = dpOptions.reduce((a, b) =>
                        Math.abs(b - val) < Math.abs(a - val) ? b : a
                      );
                      setDp(String(closest));
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    {dpOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setDp(String(opt))}
                        className={`${dpNum === opt ? "text-red-600 font-bold" : "hover:text-gray-600"} transition-colors`}
                      >
                        {opt}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tenor: slider for Syariah, tab buttons for KPR */}
                {effectiveFinType === "syariah" ? (
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Tenor: {tenor} Tahun
                    </Label>
                    <input
                      type="range"
                      min={tenorMin}
                      max={tenorMax}
                      step={1}
                      value={tenor}
                      onChange={(e) => setTenor(e.target.value)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>{tenorMin} Tahun</span>
                      <span>{tenorMax} Tahun</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Tenor KPR: {tenor} Tahun
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {tenorOptions.map((yr) => (
                        <button
                          key={yr}
                          type="button"
                          onClick={() => setTenor(String(yr))}
                          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                            tenorNum === yr
                              ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-200"
                              : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600"
                          }`}
                        >
                          {yr} Tahun
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className={`rounded-xl p-4 border ${effectiveFinType === "syariah" ? "bg-amber-50 border-amber-200" : "bg-blue-50 border-blue-200"}`}>
                  <p className={`text-xs flex items-center gap-1.5 ${effectiveFinType === "syariah" ? "text-amber-700" : "text-blue-700"}`}>
                    {effectiveFinType === "syariah"
                      ? <><Shield className="w-3.5 h-3.5" /> Skema Syariah — tanpa riba, tanpa denda, tanpa penalti. Cicilan flat per bulan.</>
                      : <><Percent className="w-3.5 h-3.5" /> Simulasi KPR Bank — bunga fluktuatif. {prop?.kprInstallments?.[dpNum]?.[tenorNum] ? 'Data dari admin.' : 'Estimasi bunga eff. 7.5% p.a.'}</>}
                  </p>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn direction="right" className="min-w-0 overflow-hidden">
            <Card className="border-0 shadow-xl text-white bg-gradient-to-br from-red-600 to-red-700 min-w-0 overflow-hidden">
              <CardContent className="p-5 md:p-8">
                <div className="text-center mb-8">
                  <p className="text-red-200 text-sm uppercase tracking-wider mb-2">
                    Cicilan Bulanan
                  </p>
                  <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold break-all">
                    Rp {formatRp(monthly * 1_000_000)}
                  </p>
                  <p className="text-red-200 text-sm mt-2">
                    /bulan ({isFlat ? "flat" : "annuity"})
                  </p>
                  <Badge className="mt-3 bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
                    {effectiveFinType === "syariah" ? "Otomatis dari margin" : prop?.kprInstallments?.[dpNum]?.[tenorNum] ? "Data dari admin" : `Estimasi 7.5% p.a.`}
                  </Badge>
                </div>

                <Separator className="bg-white/20 mb-6" />

                <div className="space-y-4">
                  {[
                    { label: "Harga Rumah", value: `Rp ${prop ? formatRp(prop.price * 1_000_000) : "0"}` },
                    { label: `Uang Muka (${dp}%)`, value: `Rp ${formatRp(dpAmount * 1_000_000)}` },
                    { label: "Sisa Pembayaran", value: `Rp ${formatRp(remaining * 1_000_000)}` },
                    { label: `Tenor (${tenor} tahun)`, value: `${tenorNum * 12} bulan` },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center gap-2 min-w-0">
                      <span className="text-red-200 text-sm shrink-0">{row.label}</span>
                      <span className="font-bold text-sm md:text-base text-right break-all min-w-0">{row.value}</span>
                    </div>
                  ))}
                </div>

                <Separator className="bg-white/20 my-6" />

                <a
                  href={`https://wa.me/${S.contact_wa}?text=Halo,%20saya%20tertarik%20simulasi%20cicilan:%0AProperti:%20${encodeURIComponent(prop?.name ?? "")}%0AHarga:%20Rp%20${prop?.price}%20Juta%0ATipe:%20${effectiveFinType === "syariah" ? "Syariah" : "KPR"}%0ADP:%20${dp}%25%0ATenor:%20${tenor}%20tahun%0ACicilan:%20Rp%20${formatRp(monthly * 1_000_000)}/bulan`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-white text-red-700 font-bold rounded-xl hover:bg-red-50 transition-colors shadow-lg text-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  Konsultasi via WhatsApp
                </a>
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        {/* Installment table */}
        {prop && (
          <FadeIn className="mt-12 max-w-5xl mx-auto">
            <Card className="border-0 shadow-xl overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-xl font-extrabold text-gray-900 mb-1">
                  Tabel Cicilan {effectiveFinType === "syariah" ? "Syariah" : "KPR"} — {prop.name}
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Rp {prop.price} Juta
                  {effectiveFinType === "syariah"
                    ? ` · Margin ${(prop.syariahMargin ?? 15)}% · Otomatis dihitung`
                    : " · Bunga fluktuatif per bank"}
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className={`text-white ${effectiveFinType === "syariah" ? "bg-gradient-to-r from-amber-500 to-amber-600" : "bg-gradient-to-r from-red-600 to-red-700"}`}>
                        <th className="px-4 py-3 text-left font-semibold rounded-tl-xl">
                          DP ↓ &nbsp;/ Tenor →
                        </th>
                        {tenorOptions.map((t) => (
                          <th
                            key={t}
                            className={`px-4 py-3 text-center font-semibold ${t === tenorMax ? "rounded-tr-xl" : ""}`}
                          >
                            {t} Thn
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dpOptions.map((dpVal, idx) => (
                        <tr
                          key={dpVal}
                          className={`${idx % 2 === 0 ? "bg-white" : effectiveFinType === "syariah" ? "bg-amber-50/50" : "bg-red-50/50"} ${
                            dpVal === dpNum ? "ring-2 ring-inset " + (effectiveFinType === "syariah" ? "ring-amber-500" : "ring-red-500") : ""
                          }`}
                        >
                          <td className="px-4 py-3 font-semibold text-gray-700">
                            {dpVal}%
                          </td>
                          {tenorOptions.map((t) => {
                            let val = 0;
                            if (effectiveFinType === "syariah") {
                              // Auto-calculate from price + margin
                              const margin = prop.syariahMargin ?? 15;
                              const dpAmt = prop.price * (dpVal / 100);
                              const sp = prop.price * (1 + margin / 100);
                              const loan = sp - dpAmt;
                              val = loan / (t * 12);
                            } else {
                              // KPR: from saved grid or annuity fallback
                              const saved = prop.kprInstallments?.[dpVal]?.[t];
                              if (saved && saved > 0) { val = saved; }
                              else {
                                const loanRupiah = (prop.price * 1_000_000) * (1 - dpVal / 100);
                                const r = 0.075 / 12;
                                const n = t * 12;
                                if (r > 0 && n > 0) val = (loanRupiah * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) / 1_000_000;
                              }
                            }
                            const isActive = dpVal === dpNum && t === tenorNum;
                            return (
                              <td
                                key={t}
                                className={`px-4 py-3 text-center ${
                                  isActive
                                    ? effectiveFinType === "syariah"
                                      ? "bg-amber-200 font-extrabold text-amber-800"
                                      : "bg-yellow-100 font-extrabold text-red-700"
                                    : "text-gray-600"
                                }`}
                              >
                                {val > 0
                                  ? `Rp ${formatRp(val * 1_000_000)}`
                                  : "-"}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                  <div className={`w-3 h-3 rounded border ${effectiveFinType === "syariah" ? "bg-amber-200 border-amber-300" : "bg-yellow-100 border-yellow-300"}`} />
                  <span>= Kombinasi yang sedang dipilih</span>
                  {effectiveFinType === "syariah" && (
                    <span className="ml-2">✓ Otomatis — Akad Murabahah, cicilan flat per bulan</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        )}
      </div>
    </section>
  );
}

/* ─────────────────────────── LOCATION ─────────────────────────── */

function LocationSection() {
  const { settings: S } = useSettingsStore();
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <FadeIn direction="left">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={S.location_bg_image || "/images/location.png"}
                alt={`Lokasi ${S.company_name}`}
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-2 text-white">
                  <MapPin className="w-5 h-5 text-red-400" />
                  <span className="font-bold text-lg">{S.contact_address}</span>
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn direction="right">
            <Badge
              variant="secondary"
              className="mb-4 bg-red-50 text-red-700 border-red-200"
            >
              <MapPin className="w-3.5 h-3.5 mr-1.5" />
              Lokasi Strategis
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
              Berlokasi di <span className="text-red-600">Jantung Bandung</span>
            </h2>
            <p className="text-gray-500 text-lg mb-8 leading-relaxed">
              {S.company_name} berlokasi di {S.contact_address} dengan akses mudah ke berbagai fasilitas penting.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: Building2, text: "Dekat Pusat Kota" },
                { icon: Home, text: "Dekat Sekolah & Kampus" },
                { icon: Heart, text: "Dekat Rumah Sakit" },
                { icon: Car, text: "Akses Tol & Jalan Utama" },
                { icon: Users, text: "Dekat Pusat Perbelanjaan" },
                { icon: TreePine, text: "Lingkungan Asri & Hijau" },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-red-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── CONTACT ─────────────────────────── */

function ContactSection() {
  const { settings: S } = useSettingsStore();
  const [formData, setFormData] = useState({
    nama: "",
    nomor: "",
    minat: "",
    pesan: "",
  });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Halo, saya ${formData.nama}.%0A%0ANomor: ${formData.nomor}%0AMinat: ${formData.minat}%0A%0APesan:%0A${formData.pesan}`;
    const waUrl = `https://wa.me/${S.contact_wa}?text=${text}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <section className="py-20 md:py-28 bg-warm-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-12">
          <Badge
            variant="secondary"
            className="mb-4 bg-red-50 text-red-700 border-red-200"
          >
            <Phone className="w-3.5 h-3.5 mr-1.5" />
            Hubungi Kami
          </Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Kami Siap <span className="text-red-600">Membantu</span> Anda
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Isi form di bawah atau hubungi kami langsung. Pesan Anda akan dikirim ke WhatsApp kami.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact Info */}
          <FadeIn delay={0.1} className="lg:col-span-2 flex flex-col gap-4">
            <a
              href={`https://wa.me/${S.contact_wa}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 bg-green-50 border border-green-200 rounded-2xl hover:bg-green-100 transition-colors group"
            >
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-md shadow-green-200 group-hover:scale-105 transition-transform">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-green-600 font-semibold uppercase tracking-wider">WhatsApp</p>
                <p className="font-bold text-gray-900">{S.contact_phone}</p>
                <p className="text-xs text-gray-400">({S.contact_person})</p>
              </div>
            </a>

            <a
              href={`tel:${S.contact_phone.replace(/-/g, "")}`}
              className="flex items-center gap-4 p-5 bg-red-50 border border-red-200 rounded-2xl hover:bg-red-100 transition-colors group"
            >
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-md shadow-red-200 group-hover:scale-105 transition-transform">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-red-600 font-semibold uppercase tracking-wider">Telepon</p>
                <p className="font-bold text-gray-900">{S.contact_phone}</p>
                <p className="text-xs text-gray-400">Senin - Sabtu</p>
              </div>
            </a>

            <a
              href={`https://instagram.com/${S.social_instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 bg-pink-50 border border-pink-200 rounded-2xl hover:bg-pink-100 transition-colors group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md shadow-pink-200 group-hover:scale-105 transition-transform">
                <Instagram className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-pink-600 font-semibold uppercase tracking-wider">Instagram</p>
                <p className="font-bold text-gray-900">{`@${S.social_instagram}`}</p>
                <p className="text-xs text-gray-400">Follow untuk update</p>
              </div>
            </a>

            <div className="flex items-center gap-4 p-5 bg-yellow-50 border border-yellow-200 rounded-2xl">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center shadow-md shadow-yellow-200">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-yellow-600 font-semibold uppercase tracking-wider">Alamat</p>
                <p className="font-bold text-gray-900">{S.company_name}</p>
                <p className="text-xs text-gray-400">{S.contact_address}</p>
              </div>
            </div>
          </FadeIn>

          {/* Contact Form */}
          <FadeIn delay={0.2} className="lg:col-span-3">
            <Card className="border-0 shadow-xl">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-md shadow-red-200">
                    <Send className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Kirim Pesan via WhatsApp</h3>
                    <p className="text-xs text-gray-400">Isi form, pesan otomatis dikirim ke WhatsApp kami</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          required
                          placeholder="Masukkan nama Anda"
                          value={formData.nama}
                          onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                          className="pl-10 h-11"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Nomor WhatsApp <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          required
                          type="tel"
                          placeholder="08xxxxxxxxxx"
                          value={formData.nomor}
                          onChange={(e) => setFormData({ ...formData, nomor: e.target.value })}
                          className="pl-10 h-11"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Saya Tertarik Dengan
                    </Label>
                    <Select value={formData.minat} onValueChange={(v) => setFormData({ ...formData, minat: v })}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Pilih topik..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Info Properti">Info Properti / Tipe Rumah</SelectItem>
                        <SelectItem value="Simulasi Cicilan">Simulasi Cicilan</SelectItem>
                        <SelectItem value="Jadwal Survey">Jadwal Survey Lokasi</SelectItem>
                        <SelectItem value="Syariah">Skema Pembayaran Syariah</SelectItem>
                        <SelectItem value="KPR">Skema Pembayaran KPR Bank</SelectItem>
                        <SelectItem value="Promo">Info Promo / Diskon</SelectItem>
                        <SelectItem value="Lainnya">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Pesan <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      required
                      rows={4}
                      placeholder="Tulis pesan atau pertanyaan Anda di sini..."
                      value={formData.pesan}
                      onChange={(e) => setFormData({ ...formData, pesan: e.target.value })}
                      className="resize-none"
                    />
                  </div>

                  {sent && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                      <p className="text-sm text-green-700 font-medium">Pesan berhasil dikirim ke WhatsApp!</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-green-700 transition-all active:scale-[0.98] shadow-lg shadow-green-200 text-base"
                  >
                    <Send className="w-5 h-5" />
                    Kirim via WhatsApp
                  </button>
                </form>
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        {/* Map */}
        <FadeIn delay={0.3} className="mt-12">
          <MapWrapper latitude={S.map_latitude} longitude={S.map_longitude} companyName={S.company_name} />
        </FadeIn>
      </div>
    </section>
  );
}

/* ─────────────────────────── GALLERY PAGE ─────────────────────────── */

function ProyekGallery() {
  const { galleryItems, loading: galleryLoading, fetchGalleryItems } = useGalleryStore();
  const { settings: S } = useSettingsStore();
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>("all");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [prevCategory, setPrevCategory] = useState(activeCategory);

  useEffect(() => { fetchGalleryItems(); }, [fetchGalleryItems]);

  if (prevCategory !== activeCategory) {
    setPrevCategory(activeCategory);
    setPage(1);
  }

  const filtered = activeCategory === "all"
    ? galleryItems
    : galleryItems.filter((img) => img.category === activeCategory);

  const totalPages = Math.ceil(filtered.length / GALLERY_PER_PAGE);
  const paged = filtered.slice((page - 1) * GALLERY_PER_PAGE, page * GALLERY_PER_PAGE);

  if (galleryLoading) {
    return (
      <section className="py-20 md:py-28 bg-warm-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 bg-red-50 text-red-700 border-red-200">
              <Camera className="w-3.5 h-3.5 mr-1.5" />
              Gallery
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Dokumentasi <span className="text-red-600">Proyek</span> Kami
            </h2>
          </FadeIn>
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 md:py-28 bg-warm-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 bg-red-50 text-red-700 border-red-200">
            <Camera className="w-3.5 h-3.5 mr-1.5" />
            Gallery
          </Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Dokumentasi <span className="text-red-600">Proyek</span> Kami
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Lihat foto-foto proyek dan lingkungan {S.company_name}.
          </p>
        </FadeIn>

        <FadeIn delay={0.1} className="flex justify-center mb-10">
          <Select value={activeCategory} onValueChange={(v) => setActiveCategory(v as GalleryCategory)}>
            <SelectTrigger className="w-[180px] h-10 text-xs font-semibold border-gray-200 focus:ring-red-500 focus:border-red-500">
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              <SelectItem value="inden">Inden</SelectItem>
              <SelectItem value="kavling">Kavling</SelectItem>
              <SelectItem value="siap_huni">Siap Huni</SelectItem>
              <SelectItem value="lingkungan">Lingkungan</SelectItem>
              <SelectItem value="proses_bangun">Proses Bangun</SelectItem>
            </SelectContent>
          </Select>
        </FadeIn>

        {paged.length === 0 ? (
          <div className="text-center py-16">
            <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Belum ada foto untuk kategori ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {paged.map((img, i) => (
              <FadeIn key={`${img.id}-${activeCategory}-${page}`} delay={i * 0.05}>
                <div
                  className="relative group cursor-pointer overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all"
                  onClick={() => { setLightboxIndex((page - 1) * GALLERY_PER_PAGE + i); setLightboxOpen(true); }}
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={img.image}
                      alt={img.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm font-bold">{img.title}</p>
                    <Badge className="mt-1 bg-white/20 text-white border-0 backdrop-blur-sm text-xs">
                      {CATEGORY_LABELS[img.category] || img.category}
                    </Badge>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        )}

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

        <AnimatePresence>
          {lightboxOpen && (
            <LightboxOverlay
              images={filtered.map((img) => img.image)}
              activeIndex={lightboxIndex}
              onClose={() => setLightboxOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ─────────────────────────── TENTANG KAMI PAGE ─────────────────────────── */

function TentangKamiPage() {
  const { galleryItems, fetchGalleryItems } = useGalleryStore();
  const { bankItems, loading: bankLoading, fetchBankItems } = useBankStore();
  const { settings: S } = useSettingsStore();
  useEffect(() => { fetchGalleryItems(); }, [fetchGalleryItems]);
  useEffect(() => { fetchBankItems(); }, [fetchBankItems]);
  const homeGalleryItems = galleryItems.slice(0, 8);

  return (
    <>
      {/* Tentang Kami */}
      <PageBanner title="Tentang Kami" subtitle={`Mengenal lebih dekat ${S.company_name}`} bgImage={S.page_banner_image} />

      <section className="py-20 md:py-28 bg-warm-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <FadeIn direction="left">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={S.tentangkami_image || "/images/properties/hero_cover.png"}
                  alt={S.company_name}
                  className="w-full h-[400px] object-cover"
                />
              </div>
            </FadeIn>
            <FadeIn direction="right">
              <Badge variant="secondary" className="mb-4 bg-red-50 text-red-700 border-red-200">
                <Building2 className="w-3.5 h-3.5 mr-1.5" />
                {S.company_legal_name}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
                Developer Perumahan <span className="text-red-600">Terpercaya</span> di Bandung
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                {S.company_name} adalah developer perumahan berpengalaman yang telah membangun lebih dari {S.total_units_sold} unit rumah di kawasan Bandung dan Sentul. Dengan komitmen menghadirkan hunian berkualitas, kami menyediakan pilihan skema pembayaran Syariah maupun KPR Bank sesuai kebutuhan Anda.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Berdiri sejak bertahun-tahun lalu, {S.company_legal_name} telah dipercaya oleh ratusan keluarga untuk mewujudkan rumah impian mereka. Kepuasan pelanggan adalah prioritas utama kami.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Visi & Misi */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <FadeIn>
              <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-8 text-white h-full">
                <Award className="w-10 h-10 text-yellow-300 mb-4" />
                <h3 className="text-2xl font-extrabold mb-4">Visi</h3>
                <p className="text-red-100 text-lg leading-relaxed">
                  Menjadi developer perumahan terdepan di Indonesia yang menghadirkan hunian berkualitas, terjangkau, dan penuh keberkahan untuk seluruh keluarga Indonesia.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 text-white h-full">
                <BookOpen className="w-10 h-10 text-yellow-300 mb-4" />
                <h3 className="text-2xl font-extrabold mb-4">Misi</h3>
                <ul className="text-gray-300 text-lg leading-relaxed space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 shrink-0" />
                    <span>Membangun rumah berkualitas dengan desain modern dan material terbaik</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 shrink-0" />
                    <span>Menyediakan skema pembayaran Syariah & KPR yang transparan dan mudah</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 shrink-0" />
                    <span>Menciptakan lingkungan hunian yang asri, aman, dan nyaman</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 shrink-0" />
                    <span>Memberikan pelayanan prima dan pendampingan penuh ke konsumen</span>
                  </li>
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Keunggulan Detail (berbeda level dari Home) */}
      <TentangKamiKeunggulanSection />

      {/* Track Record */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-red-700 via-red-600 to-red-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Track Record <span className="text-yellow-300">Kami</span>
            </h2>
          </FadeIn>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {[
              { value: `${S.total_units_sold}+`, label: "Unit Terjual" },
              { value: "10+", label: "Tahun Pengalaman" },
              { value: "3", label: "Lokasi Proyek" },
              { value: "98%", label: "Kepuasan Klien" },
            ].map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.1}>
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <p className="text-3xl md:text-4xl font-extrabold text-yellow-300">{stat.value}</p>
                  <p className="text-white/80 text-sm mt-2">{stat.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Timeline */}
          <FadeIn>
            <div className="max-w-3xl mx-auto space-y-8">
              {[
                { year: "2018", title: "Awal Mula", desc: `${S.company_legal_name} didirikan dan memulai proyek perumahan pertama di Bandung.` },
                { year: "2020", title: "Ekspansi", desc: "Membuka proyek kedua di kawasan Sentul dengan 3 klaster baru." },
                { year: "2023", title: `${S.total_units_sold} Unit`, desc: `Mencapai milestone ${S.total_units_sold} unit rumah terjual di seluruh proyek.` },
                { year: "2025", title: "Terus Bertumbuh", desc: "Meluncurkan proyek baru dengan desain modern dan konsep ramah lingkungan." },
              ].map((item, i) => (
                <div key={item.year} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-red-800 font-extrabold text-sm shrink-0">
                      {item.year}
                    </div>
                    {i < 3 && <div className="w-0.5 h-full bg-white/20 mt-2" />}
                  </div>
                  <div className="pb-8">
                    <h4 className="text-lg font-bold text-white mb-1">{item.title}</h4>
                    <p className="text-red-200 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Legalitas */}
      <section className="py-20 md:py-28 bg-warm-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 bg-green-50 text-green-700 border-green-200">
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              Legalitas
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Dokumen <span className="text-red-600">Lengkap & Aman</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              Semua legalitas terpenuhi untuk kenyamanan dan keamanan investasi Anda.
            </p>
          </FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { title: "SHM", desc: "Sertifikat Hak Milik", icon: FileText },
              { title: "IMB", desc: "Izin Mendirikan Bangunan", icon: Building2 },
              { title: "Akta", desc: "Akta Notaris Resmi", icon: FileText },
              { title: "NUP", desc: "Nomor Unit Pembelian", icon: FileText },
              { title: "PJB", desc: "Perjanjian Jual Beli", icon: Handshake },
              { title: "Bank", desc: "Kerjasama Bank & Lembaga Keuangan", icon: LandPlot },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <FadeIn key={item.title} delay={i * 0.08}>
                  <Card className="h-full border-0 shadow-md hover:shadow-lg transition-shadow text-center">
                    <CardContent className="p-5">
                      <div className="w-12 h-12 mx-auto bg-green-100 rounded-xl flex items-center justify-center mb-3">
                        <Icon className="w-6 h-6 text-green-600" />
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h4>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </CardContent>
                  </Card>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* Partner */}
      <section className="py-16 md:py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-10">
            <Badge variant="secondary" className="mb-4 bg-blue-50 text-blue-700 border-blue-200">
              <Handshake className="w-3.5 h-3.5 mr-1.5" />
              Mitra Perbankan
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Didukung <span className="text-red-600">Bank & Lembaga Keuangan</span> Terpercaya
            </h2>
          </FadeIn>
          {bankLoading ? (
            <div className="flex gap-6 justify-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-28 h-12 bg-gray-100 rounded-lg animate-pulse shrink-0" />
              ))}
            </div>
          ) : bankItems.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Belum ada data mitra bank</p>
          ) : (
            <>
              {/* Fade edges */}
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
                {/* Scrolling track — duplicate items for seamless loop */}
                <div
                  className="flex gap-8 w-max hover:[animation-play-state:paused]"
                  style={{ animation: "bank-slide 25s linear infinite" }}
                >
                  {[...bankItems, ...bankItems].map((bank, i) => (
                    <div
                      key={`${bank.id}-${i}`}
                      className="flex flex-col items-center justify-center w-28 h-20 shrink-0 bg-gray-50 rounded-xl border border-gray-100 hover:border-red-200 hover:shadow-md transition-all"
                    >
                      {bank.image ? (
                        <img
                          src={bank.image}
                          alt={bank.name}
                          className="w-20 h-10 object-contain"
                          onError={(e) => {
                            const img = e.currentTarget;
                            img.style.display = "none";
                            const fb = img.nextElementSibling as HTMLElement;
                            if (fb) fb.style.display = "flex";
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-amber-500 rounded-lg flex items-center justify-center">
                          <LandPlot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <span className="text-[10px] text-gray-500 mt-1 truncate max-w-full px-1">{bank.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Dokumentasi */}
      <section className="py-20 md:py-28 bg-warm-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 bg-red-50 text-red-700 border-red-200">
              <Camera className="w-3.5 h-3.5 mr-1.5" />
              Dokumentasi
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Galeri <span className="text-red-600">Foto</span>
            </h2>
          </FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {homeGalleryItems.map((img, i) => (
              <FadeIn key={img.id} delay={i * 0.05}>
                <div className="aspect-[4/3] overflow-hidden rounded-xl shadow-md">
                  <img src={img.image} alt={img.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn className="text-center mt-10">
            <a
              href="/?tab=gallery"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-50 text-red-700 font-semibold rounded-xl hover:bg-red-100 transition-colors"
            >
              Lihat Semua Foto
              <ArrowRight className="w-4 h-4" />
            </a>
          </FadeIn>
        </div>
      </section>

      {/* Testimoni */}
      <TestimonialsSection />
    </>
  );
}

/* ─────────────────────────── BLOG ARTICLE PAGE ─────────────────────────── */

function BlogArticlePage({ slug }: { slug: string }) {
  const { settings: S } = useSettingsStore();
  const activeTab = `blog/${slug}`;
  const router = useRouter();
  const { articles, fetchArticleBySlug, refetchArticles } = useBlogStore();
  const [viewCount, setViewCount] = useState(0);

  // Fetch article by slug if not already in store
  useEffect(() => {
    if (!articles.find((a) => a.slug === slug)) {
      fetchArticleBySlug(slug);
    }
    // Also make sure all articles are loaded for "Artikel Lainnya"
    if (!articles.length) {
      refetchArticles();
    }
  }, [slug, articles, fetchArticleBySlug, refetchArticles]);

  // Increment views on visit (once per session per slug)
  useEffect(() => {
    const sessionKey = `viewed_${slug}`;
    if (!sessionStorage.getItem(sessionKey)) {
      fetch("/api/blogs/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.views !== undefined) {
            setViewCount(data.views);
            sessionStorage.setItem(sessionKey, "1");
          }
        })
        .catch(() => {});
    }
  }, [slug]);

  const article = articles.find((a) => a.slug === slug);
  const coverImg = article?.images?.[0];
  const displayViews = viewCount || article?.views || 0;

  // Loading state
  if (!article) {
    return (
      <>
        <Navbar activeTab={activeTab} />
        <div className="min-h-screen flex flex-col items-center justify-center bg-warm-bg">
          <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mb-4" />
          <p className="text-gray-400 text-sm">Memuat artikel...</p>
        </div>
        <Chatbot />
      </>
    );
  }

  // Get other articles for "Artikel Lainnya"
  const otherArticles = articles.filter((a) => a.id !== article.id).slice(0, 3);

  return (
    <>
      <Navbar activeTab={activeTab} />

      {/* Hero image */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        {coverImg ? (
          <img src={coverImg} alt={article.title} className="w-full h-full object-cover" />
        ) : (
          <div className="h-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
            <BookOpen className="w-24 h-24 text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => router.push("/?tab=blog")}
              className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Blog
            </button>
            <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm text-sm mb-3">
              {article.category}
            </Badge>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight drop-shadow-lg">
              {article.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Article content */}
      <article className="py-10 md:py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-visible">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-8 pb-8 border-b border-gray-100">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{article.dateFormatted || article.createdAt}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{article.readTime || "5 menit"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              <span>{displayViews} dibaca</span>
            </div>
          </div>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-lg text-gray-600 leading-relaxed font-medium mb-10 border-l-4 border-red-500 pl-5 italic">
              {article.excerpt}
            </p>
          )}

          {/* Rich HTML content */}
          <div
            className="prose prose-sm md:prose-base max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-red-600 prose-img:rounded-xl prose-blockquote:border-l-red-500 prose-blockquote:text-gray-500 prose-blockquote:italic prose-li:text-gray-700
            [&>*]:!max-w-full [&_*]:!max-w-full [&_img]:max-w-full [&_img]:h-auto [&_video]:max-w-full [&_iframe]:max-w-full [&_table]:table-fixed [&_td]:break-words [&_th]:break-words [&_p]:break-words [&_p]:overflow-wrap-anywhere [&_span]:!inline [&_span]:break-words [&_br]:block"
            dangerouslySetInnerHTML={{ __html: (article.content || "<p class='text-gray-400'>Konten belum tersedia.</p>").replace(/&nbsp;/g, " ") }}
          />

          {/* Footer CTA */}
          <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-bold text-gray-900 mb-1">Tertarik dengan properti kami?</p>
                <p className="text-sm text-gray-500">Konsultasikan kebutuhan rumah Anda secara gratis.</p>
              </div>
              <a
                href={`https://wa.me/${S.contact_wa}?text=Halo,%20saya%20tertarik%20dengan%20properti%20${encodeURIComponent(S.company_name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl text-sm transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4" />
                Hubungi via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </article>

      {/* Artikel Lainnya */}
      {otherArticles.length > 0 && (
        <section className="py-12 md:py-16 bg-warm-bg">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-8">Artikel Lainnya</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {otherArticles.map((a) => {
                const img = a.images?.[0];
                return (
                  <Card
                    key={a.id}
                    onClick={() => router.push(`/?tab=blog/${a.slug}`)}
                    className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group cursor-pointer"
                  >
                    <div className="h-36 overflow-hidden relative">
                      {img ? (
                        <img src={img} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="h-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                          <BookOpen className="w-10 h-10 text-white/20" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.readTime || "5 menit"}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{a.views || 0}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm group-hover:text-red-700 transition-colors line-clamp-2 leading-snug">
                        {a.title}
                      </h3>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <Footer />
      <Chatbot />
    </>
  );
}

/* ─────────────────────────── BLOG PAGE ─────────────────────────── */

function BlogPage() {
  const router = useRouter();
  const { settings: S } = useSettingsStore();
  const BLOG_PER_PAGE = 6;
  const [page, setPage] = useState(1);
  const { articles, refetchArticles } = useBlogStore();

  useEffect(() => { refetchArticles(); }, [refetchArticles]);

  const featuredArticle = articles[0];
  const restArticles = articles.slice(1);
  const totalPages = Math.ceil(restArticles.length / BLOG_PER_PAGE);
  const paged = restArticles.slice((page - 1) * BLOG_PER_PAGE, page * BLOG_PER_PAGE);
  const popularArticles = articles.slice(0, 4);

  // Gather categories from real data
  const categories = [...new Set(articles.map((a) => a.category))];

  const COLORS = [
    "from-red-500 to-red-600",
    "from-amber-500 to-amber-600",
    "from-green-500 to-green-600",
    "from-blue-500 to-blue-600",
    "from-purple-500 to-purple-600",
    "from-teal-500 to-teal-600",
    "from-orange-500 to-orange-600",
    "from-emerald-500 to-emerald-600",
  ];

  return (
    <>
      <PageBanner title="Blog & Artikel" subtitle="Tips, panduan, dan informasi seputar properti, KPR, dan investasi rumah" bgImage={S.page_banner_image} />
      <section className="py-16 md:py-24 bg-warm-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {articles.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">Belum Ada Artikel</h3>
              <p className="text-sm text-gray-400">Artikel akan segera tersedia.</p>
            </div>
          ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* ── Main Content ── */}
            <div className="flex-1 min-w-0">
              {/* Featured Article (Full Width) */}
              {featuredArticle && page === 1 && (
                <FadeIn>
                  <Card onClick={() => router.push(`/?tab=blog/${featuredArticle.slug}`)} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer mb-8">
                    <div className="h-64 md:h-72 overflow-hidden relative">
                      {featuredArticle.images?.[0] ? (
                        <img src={featuredArticle.images[0]} alt={featuredArticle.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className={`h-full bg-gradient-to-br ${COLORS[0]} flex items-center justify-center`}>
                          <BookOpen className="w-24 h-24 text-white/15" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <Badge className="absolute top-4 left-4 bg-white/20 text-white border-0 backdrop-blur-sm text-sm px-3 py-1 z-10">
                        {featuredArticle.category}
                      </Badge>
                      <Badge className="absolute top-4 right-4 bg-yellow-400 text-gray-900 border-0 text-xs font-bold px-2.5 py-1 z-10">
                        <Star className="w-3.5 h-3.5 mr-1" />
                        Artikel Pilihan
                      </Badge>
                      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-10">
                        <div className="flex items-center gap-3 text-sm text-white/70 mb-3">
                          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{featuredArticle.dateFormatted}</span>
                          <span>•</span>
                          <span>{featuredArticle.readTime || "5 menit"}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" />{featuredArticle.views || 0}</span>
                        </div>
                        <h2 className="text-xl md:text-3xl font-extrabold text-white mb-3 group-hover:text-yellow-300 transition-colors leading-tight drop-shadow-lg">
                          {featuredArticle.title}
                        </h2>
                        <p className="text-white/80 leading-relaxed mb-4 max-w-2xl">
                          {featuredArticle.excerpt}
                        </p>
                        <span className="inline-flex items-center gap-1.5 text-white font-semibold text-sm group-hover:gap-2.5 transition-all">
                          Baca selengkapnya
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </Card>
                </FadeIn>
              )}

              {/* Articles Grid */}
              {paged.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {paged.map((article, i) => {
                  const color = COLORS[(i + 1) % COLORS.length];
                  const coverImg = article.images?.[0];
                  return (
                    <FadeIn key={`${article.id}-${page}`} delay={i * 0.05}>
                      <Card onClick={() => router.push(`/?tab=blog/${article.slug}`)} className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group cursor-pointer">
                        <div className="h-44 overflow-hidden relative">
                          {coverImg ? (
                            <img src={coverImg} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className={`h-full bg-gradient-to-br ${color} flex items-center justify-center`}>
                              <BookOpen className="w-16 h-16 text-white/20" />
                            </div>
                          )}
                          <Badge className="absolute top-3 left-3 bg-white/20 text-white border-0 backdrop-blur-sm text-xs z-10">
                            {article.category}
                          </Badge>
                        </div>
                        <CardContent className="p-5">
                          <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{article.dateFormatted}</span>
                            <span>•</span>
                            <span>{article.readTime || "5 menit"}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{article.views || 0}</span>
                          </div>
                          <h3 className="font-bold text-gray-900 mb-2 group-hover:text-red-700 transition-colors line-clamp-2 leading-snug">
                            {article.title}
                          </h3>
                          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                            {article.excerpt}
                          </p>
                        </CardContent>
                      </Card>
                    </FadeIn>
                  );
                })}
              </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-sm">Tidak ada artikel lagi.</p>
                </div>
              )}

              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>

            {/* ── Sidebar ── */}
            <aside className="w-full lg:w-[340px] shrink-0 space-y-6">
              {/* Artikel Populer */}
              {popularArticles.length > 0 && (
              <FadeIn delay={0.15}>
                <Card className="border-0 shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-red-600 to-red-700 px-5 py-4">
                    <h3 className="text-white font-bold flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Artikel Populer
                    </h3>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {popularArticles.map((article, idx) => {
                        const coverImg = article.images?.[0];
                        return (
                          <a
                            key={article.id}
                            onClick={(e) => { e.preventDefault(); router.push(`/?tab=blog/${article.slug}`); }}
                            href={`/?tab=blog/${article.slug}`}
                            className={`flex gap-3 group cursor-pointer ${idx < 3 ? "pb-4 border-b border-gray-100" : ""}`}
                          >
                            <div className="relative shrink-0">
                              {coverImg ? (
                                <img src={coverImg} alt={article.title} className="w-16 h-16 rounded-lg object-cover" />
                              ) : (
                                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                                  <BookOpen className="w-5 h-5 text-gray-300" />
                                </div>
                              )}
                              <div className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold z-10">
                                {idx + 1}
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-gray-800 group-hover:text-red-700 transition-colors line-clamp-2 leading-snug">
                                {article.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-[11px] text-gray-400">{article.dateFormatted}</span>
                                <span className="text-[11px] text-gray-300">•</span>
                                <span className="text-[11px] text-gray-400">{article.readTime || "5 menit"}</span>
                                <span className="text-[11px] text-gray-300">•</span>
                                <span className="flex items-center gap-0.5 text-[11px] text-gray-400"><Eye className="w-3 h-3" />{article.views || 0}</span>
                              </div>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
              )}

              {/* Kategori */}
              {categories.length > 0 && (
              <FadeIn delay={0.25}>
                <Card className="border-0 shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-5 py-4">
                    <h3 className="text-white font-bold flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Kategori
                    </h3>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => {
                        const count = articles.filter((a) => a.category === cat).length;
                        return (
                          <span
                            key={cat}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-lg text-sm text-gray-600 hover:text-red-700 font-medium transition-colors cursor-default"
                          >
                            {cat}
                            <span className="text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full">{count}</span>
                          </span>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
              )}

              {/* CTA WhatsApp */}
              <FadeIn delay={0.35}>
                <Card className="border-0 shadow-lg overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 text-white">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 bg-yellow-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-7 h-7 text-yellow-400" />
                    </div>
                    <h4 className="font-bold text-lg mb-2">Masih Bingung?</h4>
                    <p className="text-sm text-gray-400 mb-5 leading-relaxed">
                      Konsultasikan kebutuhan rumah Anda dengan tim ahli kami secara gratis.
                    </p>
                    <a
                      href={`https://wa.me/${S.contact_wa}?text=Halo,%20saya%20ingin%20konsultasi%20tentang%20rumah`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl text-sm transition-colors w-full justify-center"
                    >
                      <Phone className="w-4 h-4" />
                      Hubungi via WhatsApp
                    </a>
                  </CardContent>
                </Card>
              </FadeIn>
            </aside>
          </div>
          )}
        </div>
      </section>
    </>
  );
}

/* ─────────────────────────── KONTAK PAGE ─────────────────────────── */

function KontakPage() {
  const { settings: S } = useSettingsStore();
  return (
    <>
      <PageBanner title="Hubungi Kami" subtitle="Tim marketing kami siap melayani Anda" bgImage={S.page_banner_image} />
      <ContactSection />
    </>
  );
}

/* ─────────────────────────── GALLERY PAGE WRAPPER ─────────────────────────── */

function GalleryPage() {
  const { settings: S } = useSettingsStore();
  return (
    <>
      <PageBanner title="Gallery" subtitle="Dokumentasi foto proyek dan lingkungan kami" bgImage={S.page_banner_image} />
      <ProyekGallery />
    </>
  );
}

/* ─────────────────────────── PROYEK PAGE ─────────────────────────── */

function ProyekPage({
  onSelectProperty,
}: {
  onSelectProperty: (p: Property) => void;
}) {
  const { settings: S } = useSettingsStore();
  return (
    <>
      <PageBanner title="Proyek Kami" subtitle="Pilih rumah idaman Anda dari berbagai tipe yang tersedia" bgImage={S.page_banner_image} />
      <PropertiesSection onSelectProperty={onSelectProperty} />
      <CalculatorSection />
    </>
  );
}

/* ─────────────────────────── FOOTER ─────────────────────────── */

function Footer() {
  const { settings: S } = useSettingsStore();
  const { properties: PROPERTIES } = usePropertyStore();
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img
                src="/images/logo-brr.png"
                alt="Logo BRR"
                className="w-10 h-10 rounded-xl object-contain"
              />
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] text-gray-500 font-semibold tracking-wide">
                  {S.company_legal_name}
                </span>
                <span className="text-sm text-white font-extrabold">
                  {S.company_name}
                </span>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              {S.company_name} — Developer perumahan terpercaya di
              Bandung & Sentul. Menyediakan hunian berkualitas dengan skema pembayaran
              Syariah & KPR.
            </p>
            <div className="flex gap-3">
              <a
                href={`https://instagram.com/${S.social_instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-red-600 rounded-xl flex items-center justify-center transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={`https://wa.me/${S.contact_wa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-green-600 rounded-xl flex items-center justify-center transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-4">Menu</h4>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.tab}>
                  <a
                    href={`/?tab=${link.tab}`}
                    className="text-gray-400 hover:text-red-400 transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Proyek */}
          <div>
            <h4 className="font-bold text-white mb-4">Proyek</h4>
            <ul className="space-y-2.5">
              {(["Siap Huni", "Kavling", "Inden"] as const).map((cat) => (
                <li key={cat}>
                  <a
                    href="/?tab=proyek"
                    className="text-gray-400 hover:text-red-400 transition-colors text-sm"
                  >
                    {cat}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white mb-4">Kontak</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm">{S.contact_phone}</p>
                  <p className="text-xs text-gray-500">({S.contact_person})</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Instagram className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{`@${S.social_instagram}`}</p>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{S.contact_address}</p>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="bg-gray-800 my-10" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} {S.company_name}. All rights
            reserved.
          </p>
          <p className="text-gray-500 text-xs">
            Perumahan Terpercaya di Bandung & Sentul
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────── LOADING ─────────────────────────── */

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Memuat...</p>
      </div>
    </div>
  );
}

/* ─────────────────────────── MAIN PAGE ─────────────────────────── */

function PageContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "home";
  const { settings: S, fetchSettings } = useSettingsStore();
  const { properties: PROPERTIES, loading: propertiesLoading, refetchProperties } = usePropertyStore();
  const [selectedProperty, setSelectedProperty] = useState<
    Property | null
  >(null);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    refetchProperties();
  }, [refetchProperties]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [tab]);

  const handleSelectProperty = useCallback((p: Property) => {
    setSelectedProperty(p);
  }, []);

  const renderContent = () => {
    // Check if it's a blog article URL: ?tab=blog/slug (before switch since switch uses strict ===)
    const blogSlugMatch = tab.match(/^blog\/(.+)$/);
    if (blogSlugMatch) {
      return <BlogArticlePage slug={blogSlugMatch[1]} />;
    }

    switch (tab) {
      case "tentang":
        return (
          <>
            <Navbar activeTab={tab} />
            <TentangKamiPage />
            <Footer />
            <Chatbot />
          </>
        );
      case "proyek":
        return (
          <>
            <Navbar activeTab={tab} />
            <ProyekPage onSelectProperty={handleSelectProperty} />
            <PropertyDetailDialog
              property={selectedProperty}
              open={!!selectedProperty}
              onClose={() => setSelectedProperty(null)}
            />
            <Footer />
            <Chatbot />
          </>
        );
      case "gallery":
        return (
          <>
            <Navbar activeTab={tab} />
            <GalleryPage />
            <Footer />
            <Chatbot />
          </>
        );
      case "blog":
        return (
          <>
            <Navbar activeTab={tab} />
            <BlogPage />
            <Footer />
            <Chatbot />
          </>
        );
      case "kontak":
        return (
          <>
            <Navbar activeTab={tab} />
            <KontakPage />
            <Footer />
            <Chatbot />
          </>
        );
      default:
        return (
          <>
            <Navbar activeTab={tab} />
            <Hero />
            <PromoStrip />
            <FeaturesSection />
            <PropertyPreviewSection onSelectProperty={handleSelectProperty} />
            <CaraBeliSection />
            <CalculatorSection />
            <LocationSection />
            <FAQSection />
            <GalleryPreviewSection />
            <CTASection />
            <PropertyDetailDialog
              property={selectedProperty}
              open={!!selectedProperty}
              onClose={() => setSelectedProperty(null)}
            />
            <Footer />
            <Chatbot />
          </>
        );
    }
  };

  return <main className="min-h-screen flex flex-col bg-white">{renderContent()}</main>;
}

export default function HomePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PageContent />
    </Suspense>
  );
}
