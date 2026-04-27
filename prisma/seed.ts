import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const db = new PrismaClient();

// ──── Testimonials Data (20) ────
const TESTIMONIALS_DATA = [
  { name: "Ahmad Fauzi", role: "Penghuni Tipe Anggrek A1", text: "Proses pembelian rumah sangat mudah dan transparan. Tim marketing ramah dan selalu siap membantu. Cicilan syariah membuat hati tenang tanpa riba.", rating: 5 },
  { name: "Siti Nurhaliza", role: "Penghuni Tipe Melati B3", text: "Lingkungan yang asri dan aman untuk keluarga. Anak-anak bisa bermain dengan nyaman. Sangat puas dengan kualitas bangunan rumah.", rating: 5 },
  { name: "Budi Santoso", role: "Penghuni Type Mawar C2", text: "Harga sangat kompetitif dibanding perumahan lain di sekitar Bandung. DP ringan dan proses KPR syariah cepat. Recommended!", rating: 5 },
  { name: "Dewi Lestari", role: "Penghuni Tipe Dahlia A5", text: "Sertifikat SHM sudah pecah per unit, jadi sangat aman. Lokasi strategis dekat dengan akses tol dan fasilitas umum.", rating: 5 },
  { name: "Rizky Pratama", role: "Penghuni Tipe Anggrek B1", text: "Infrastruktur perumahan sangat bagus, jalan lebar, drainase tertata rapi. Banjir? Tidak pernah selama 2 tahun tinggal di sini.", rating: 5 },
  { name: "Anisa Rahma", role: "Penghuni Tipe Melati A2", text: "Komunitas warga sangat harmonis. Ada kegiatan rutin seperti pengajian dan arisan. Betah banget tinggal di sini!", rating: 5 },
  { name: "Hendra Wijaya", role: "Penghuni Tipe Mawar A1", text: "Proses akad cepat, hanya 2 minggu dari booking fee. Tim BRR sangat profesional dan kooperatif dengan bank syariah.", rating: 4 },
  { name: "Rina Marlina", role: "Penghuni Tipe Dahlia B4", text: "Desain rumah modern minimalis sesuai dengan selera millenial. Finishing rapi dan material berkualitas tinggi.", rating: 5 },
  { name: "Dedi Mulyadi", role: "Penghuni Tipe Anggrek C3", text: "Investasi properti terbaik yang pernah saya lakukan. Harga rumah sudah naik 30% sejak saya beli 2 tahun lalu.", rating: 5 },
  { name: "Lina Susanti", role: "Penghuni Tipe Melati C1", text: "Keamanan 24 jam dengan CCTV dan security. Sangat nyaman untuk keluarga dengan anak kecil.", rating: 5 },
  { name: "Wahyu Hidayat", role: "Penghuni Tipe Mawar B2", text: "Akses ke pusat kota Bandung hanya 15 menit. Dekat dengan sekolah, rumah sakit, dan pusat perbelanjaan.", rating: 4 },
  { name: "Fitri Handayani", role: "Penghuni Tipe Dahlia A3", text: "Taman dan ruang terbuka hijau yang luas. Udara segar setiap pagi. Perfect untuk quality time keluarga.", rating: 5 },
  { name: "Agus Setiawan", role: "Penghuni Tipe Anggrek A4", text: "Pembelian cash keras dapat diskon yang menarik. Saya berhemat puluhan juta dibanding beli di developer lain.", rating: 5 },
  { name: "Yuni Astuti", role: "Penghuni Tipe Melati B5", text: "Listrik underground dan air bersih 24 jam. Tidak pernah mati lampu atau kekurangan air. Sangat memuaskan.", rating: 5 },
  { name: "Irfan Maulana", role: "Penghuni Tipe Mawar C4", text: "DP bisa dicicil 6 bulan sangat membantu. Saya yang gaji UMR pun bisa punya rumah impian. Terima kasih BRR!", rating: 5 },
  { name: "Nita Puspita", role: "Penghuni Tipe Dahlia C2", text: "Rumah sudah termasuk instalasi AC, kitchen set, dan carport. Jadi tinggal bawa koper langsung huni.", rating: 5 },
  { name: "Joko Susilo", role: "Penghuni Tipe Anggrek B5", text: "After sales service sangat responsif. Ada kendala kecil langsung ditangani. Developer yang bertanggung jawab.", rating: 4 },
  { name: "Mega Putri", role: "Penghuni Tipe Melati A4", text: "Saya rekomendasikan BRR ke semua teman dan saudara. Kualitas bangunan premium tapi harga masih terjangkau.", rating: 5 },
  { name: "Dian Prasetyo", role: "Penghuni Tipe Mawar A3", text: "Cicilan flat tanpa naik selama tenor. Tidak seperti KPR konvensional yang bisa berubah-ubah. Sungguh syariah!", rating: 5 },
  { name: "Ratna Sari", role: "Penghuni Tipe Dahlia B1", text: "Perumahan yang benar-benar mengutamakan kenyamanan penghuni. Taman bermain anak, masjid, dan lapangan olahraga tersedia lengkap.", rating: 5 },
];

async function main() {
  console.log("Seeding Bandung Raya Residence...\n");

  // ── 1. Superadmin ──
  const email = "admin@brr.co.id";
  const password = "12345678";

  const existingAdmin = await db.admin.findUnique({ where: { email } });
  if (existingAdmin) {
    console.log("[OK] Admin sudah ada:", existingAdmin.email);
  } else {
    const hashedPassword = await hash(password, 12);
    await db.admin.create({
      data: { name: "Super Admin", email, password: hashedPassword, role: "superadmin" },
    });
    console.log("[OK] Superadmin dibuat!");
    console.log("   Email   :", email);
    console.log("   Password:", password);
  }

  // ── 2. Testimonials (20 data) ──
  const testimonialCount = await db.testimonial.count();
  if (testimonialCount > 0) {
    console.log(`[OK] Testimoni sudah ada (${testimonialCount}), skip.`);
  } else {
    for (const t of TESTIMONIALS_DATA) {
      await db.testimonial.create({
        data: {
          name: t.name,
          role: t.role,
          text: t.text,
          rating: t.rating,
          featured: t.rating === 5,
        },
      });
    }
    console.log("[OK] 20 testimoni berhasil dibuat!");
  }

  console.log("\nSeeding selesai!");
}

main()
  .catch((e) => { console.error("Error:", e); process.exit(1); })
  .finally(() => db.$disconnect());
