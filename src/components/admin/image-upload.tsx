"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, ImageIcon, AlertCircle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value: string; // comma-separated URLs
  onChange: (url: string) => void;
  label?: string;
  maxSizeKB?: number;
  maxImages?: number;
}

export default function ImageUpload({
  value,
  onChange,
  label = "Upload Gambar",
  maxSizeKB = 300,
  maxImages = 5,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const images: string[] = value ? value.split(",").map((s) => s.trim()).filter(Boolean) : [];

  const handleUpload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("Hanya file gambar yang diperbolehkan");
        return;
      }

      if (file.size > 20 * 1024 * 1024) {
        setError("Ukuran file maksimal 20MB (akan dikompres otomatis)");
        return;
      }

      setError("");
      setUploading(true);
      setProgress("Mengupload & mengkompres...");

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Gagal mengupload");
          return;
        }

        const origKB = (data.originalSize / 1024).toFixed(1);
        const compKB = (data.compressedSize / 1024).toFixed(1);
        setProgress(`Selesai! ${origKB}KB → ${compKB}KB`);
        setTimeout(() => setProgress(""), 3000);

        // Add new image to the list
        const updated = [...images, data.url].slice(0, maxImages);
        onChange(updated.join(","));
      } catch {
        setError("Terjadi kesalahan saat upload");
      } finally {
        setUploading(false);
      }
    },
    [onChange, images, maxImages]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated.join(","));
  };

  const isFull = images.length >= maxImages;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium leading-none">{label}</label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{images.length}/{maxImages} gambar</span>
          {progress && (
            <span className="text-xs text-green-600 font-medium">{progress}</span>
          )}
        </div>
      </div>

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((url, idx) => (
            <div
              key={idx}
              className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200"
            >
              <img src={url} alt={`Gambar ${idx + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all" />
              {!uploading && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                  className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white p-0.5 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
              {idx === 0 && (
                <span className="absolute bottom-1 left-1 bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded font-medium">
                  Utama
                </span>
              )}
            </div>
          ))}
          {/* Add more button */}
          {!isFull && (
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={cn(
                "aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all",
                dragOver
                  ? "border-red-400 bg-red-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                uploading && "pointer-events-none opacity-50"
              )}
            >
              <Plus className="w-4 h-4 text-gray-400 mb-0.5" />
              <span className="text-[10px] text-gray-400">Tambah</span>
            </div>
          )}
        </div>
      )}

      {/* Empty state / drop zone */}
      {images.length === 0 && (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "relative border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 overflow-hidden",
            dragOver
              ? "border-red-400 bg-red-50 scale-[1.01]"
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
            uploading && "pointer-events-none opacity-60"
          )}
        >
          <div className="flex flex-col items-center justify-center py-8 px-4">
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 text-red-500 animate-spin mb-3" />
                <p className="text-sm text-gray-500 font-medium">
                  Mengkompres gambar (maks {maxSizeKB}KB)...
                </p>
                <p className="text-xs text-gray-400 mt-1">Tunggu sebentar ya</p>
              </>
            ) : (
              <>
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors",
                    dragOver ? "bg-red-100" : "bg-gray-100"
                  )}
                >
                  {dragOver ? (
                    <Upload className="w-6 h-6 text-red-500" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  <span className="text-red-500">Klik untuk upload</span> atau drag & drop
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  JPEG, PNG, WebP — Maks {maxImages} gambar — Auto kompres ke ≤{maxSizeKB}KB
                </p>
              </>
            )}
          </div>

          {uploading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-500">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
