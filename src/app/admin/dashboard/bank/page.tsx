"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Search, LandPlot, Loader2, AlertCircle, Building2 } from "lucide-react";
import ImageUpload from "@/components/admin/image-upload";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BankItem {
  id: string;
  name: string;
  description: string;
  image: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

const emptyForm = { name: "", description: "", image: "", sortOrder: "0", isActive: true };

export default function BankPage() {
  const [items, setItems] = useState<BankItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<BankItem | null>(null);
  const [deleting, setDeleting] = useState<BankItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchBanks = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/bank");
      const data = await res.json();
      let list = data.items || [];
      if (search) {
        const s = search.toLowerCase();
        list = list.filter((i: BankItem) => i.name.toLowerCase().includes(s));
      }
      setItems(list);
    } catch { /* ignore */ }
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchBanks(); }, [fetchBanks]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (b: BankItem) => {
    setEditing(b);
    setForm({
      name: b.name,
      description: b.description,
      image: b.image,
      sortOrder: String(b.sortOrder),
      isActive: b.isActive,
    });
    setErrors({});
    setFormOpen(true);
  };

  const openDelete = (b: BankItem) => { setDeleting(b); setDeleteOpen(true); };

  const clearFieldError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) {
      newErrors.name = "Nama bank wajib diisi";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      const url = editing ? `/api/admin/bank/${editing.id}` : "/api/admin/bank";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { toast.error("Gagal menyimpan"); return; }
      toast.success(editing ? "Bank berhasil diupdate" : "Bank berhasil ditambahkan");
      setFormOpen(false);
      fetchBanks();
    } catch { toast.error("Terjadi kesalahan"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      const res = await fetch(`/api/admin/bank/${deleting.id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Gagal menghapus"); return; }
      toast.success("Bank berhasil dihapus");
      setDeleteOpen(false);
      fetchBanks();
    } catch { toast.error("Terjadi kesalahan"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kerjasama Bank</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola data mitra bank</p>
        </div>
        <Button onClick={openCreate} className="bg-red-600 hover:bg-red-700 text-white gap-2">
          <Plus className="w-4 h-4" /> Tambah Bank
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="Cari bank..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table containerClassName="max-h-[calc(100vh-14rem)]">
            <TableHeader className="sticky top-0 z-10 bg-gray-50">
              <TableRow className="bg-gray-50">
                <TableHead className="w-12">#</TableHead>
                <TableHead>Logo</TableHead>
                <TableHead>Nama Bank</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                      <TableCell><Skeleton className="h-12 w-16 rounded-lg" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                : items.length === 0
                ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-gray-400">
                        <Building2 className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                        {search ? "Tidak ada hasil" : "Belum ada data bank"}
                      </TableCell>
                    </TableRow>
                  )
                : items.map((item) => (
                    <TableRow key={item.id} className="hover:bg-gray-50">
                      <TableCell>
                        <span className="text-xs font-mono text-gray-400">{item.sortOrder}</span>
                      </TableCell>
                      <TableCell>
                        {item.image ? (
                          <div className="relative w-14 h-10">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-14 h-10 object-contain rounded-lg border border-gray-200 bg-white p-0.5"
                              onError={(e) => {
                                const img = e.currentTarget;
                                img.style.display = "none";
                                const fallback = img.nextElementSibling;
                                if (fallback) (fallback as HTMLElement).style.display = "flex";
                              }}
                            />
                            <div className="absolute inset-0 rounded-lg bg-gray-100 items-center justify-center hidden">
                              <LandPlot className="w-5 h-5 text-gray-300" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-14 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <LandPlot className="w-5 h-5 text-gray-300" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-gray-500 text-sm max-w-xs truncate">{item.description}</TableCell>
                      <TableCell>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-md ${item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {item.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(item)} className="text-gray-400 hover:text-blue-600">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openDelete(item)} className="text-gray-400 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Bank" : "Tambah Bank Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>
                Nama Bank <span className="text-red-500">*</span>
              </Label>
              <Input
                value={form.name}
                onChange={(e) => { clearFieldError("name"); setForm({ ...form, name: e.target.value }); }}
                placeholder="contoh: Bank Syariah Indonesia"
                className={errors.name ? "border-red-400 focus-visible:ring-red-400" : ""}
              />
              {errors.name && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.name}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Urutan</Label>
                <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
              </div>
              <div className="space-y-2 flex items-end pb-1">
                <div className="flex items-center gap-2">
                  <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
                  <Label>Aktif</Label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <ImageUpload
                value={form.image}
                onChange={(url) => setForm({ ...form, image: url })}
                label="Logo Bank"
                maxImages={1}
              />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Deskripsi singkat tentang bank..." />
            </div>
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
            <AlertDialogTitle>Hapus Bank</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus <strong>{deleting?.name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
