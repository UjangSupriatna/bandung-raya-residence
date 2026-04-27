"use client";

import { useMemo, useCallback } from "react";
import dynamic from "next/dynamic";

// Quill doesn't support SSR — dynamic import with ssr: false
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
      <span className="text-sm text-gray-400">Memuat editor...</span>
    </div>
  ),
});

// Import Quill styles
import "react-quill-new/dist/quill.snow.css";

interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export default function RichEditor({
  value,
  onChange,
  placeholder = "Tulis konten artikel di sini...",
  readOnly = false,
}: RichEditorProps) {
  // Quill toolbar configuration
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ indent: "-1" }, { indent: "+1" }],
          ["blockquote", "link", "image"],
          ["clean"],
        ],
        handlers: {
          image: () => {
            // Prompt for image URL
            const url = window.prompt("Masukkan URL gambar:");
            if (url) {
              const quillEditor = document.querySelector(".ql-editor");
              if (quillEditor) {
                // Access Quill instance through the editor element
                const quill = (quillEditor as any).__quill;
                if (quill) {
                  const range = quill.getSelection(true);
                  quill.clipboard.dangerouslyPasteHTML(
                    range ? range.index : 0,
                    `<img src="${url}" alt="gambar" style="max-width:100%;height:auto;border-radius:8px;margin:8px 0;" />`
                  );
                }
              }
            }
          },
        },
      },
    }),
    []
  );

  const formats = useMemo(
    () => [
      "header",
      "bold",
      "italic",
      "underline",
      "strike",
      "color",
      "background",
      "list",
      "indent",
      "blockquote",
      "link",
      "image",
    ],
    []
  );

  const handleChange = useCallback(
    (content: string) => {
      onChange(content);
    },
    [onChange]
  );

  return (
    <div className="rich-editor-wrapper rounded-lg border border-gray-200 overflow-hidden bg-white [&_.ql-container]:border-0 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-gray-200 [&_.ql-toolbar]:bg-gray-50">
      <ReactQuill
        theme="snow"
        value={value || ""}
        onChange={handleChange}
        placeholder={placeholder}
        readOnly={readOnly}
        modules={modules}
        formats={formats}
      />
      <style jsx global>{`
        /* Quill editor custom styles */
        .rich-editor-wrapper .ql-editor {
          min-height: 250px;
          max-height: 400px;
          overflow-y: auto;
          font-size: 14px;
          line-height: 1.7;
          padding: 1rem;
        }
        .rich-editor-wrapper .ql-editor.ql-blank::before {
          font-style: normal;
          color: #9ca3af;
        }
        .rich-editor-wrapper .ql-toolbar .ql-formats {
          margin-right: 8px;
        }
        .rich-editor-wrapper .ql-toolbar button:hover,
        .rich-editor-wrapper .ql-toolbar .ql-active {
          color: #dc2626 !important;
        }
        .rich-editor-wrapper .ql-toolbar .ql-stroke {
          stroke: #6b7280;
        }
        .rich-editor-wrapper .ql-toolbar button:hover .ql-stroke,
        .rich-editor-wrapper .ql-toolbar .ql-active .ql-stroke {
          stroke: #dc2626;
        }
        .rich-editor-wrapper .ql-toolbar .ql-fill {
          fill: #6b7280;
        }
        .rich-editor-wrapper .ql-toolbar button:hover .ql-fill,
        .rich-editor-wrapper .ql-toolbar .ql-active .ql-fill {
          fill: #dc2626;
        }
        .rich-editor-wrapper .ql-toolbar .ql-picker-label:hover .ql-stroke {
          stroke: #dc2626;
        }
        /* Content styling inside editor */
        .rich-editor-wrapper .ql-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 8px 0;
        }
        .rich-editor-wrapper .ql-editor h1 { font-size: 1.5rem; font-weight: 700; margin: 0.5rem 0; }
        .rich-editor-wrapper .ql-editor h2 { font-size: 1.25rem; font-weight: 600; margin: 0.5rem 0; }
        .rich-editor-wrapper .ql-editor h3 { font-size: 1.1rem; font-weight: 600; margin: 0.5rem 0; }
        .rich-editor-wrapper .ql-editor blockquote {
          border-left: 4px solid #dc2626;
          padding-left: 1rem;
          color: #6b7280;
          font-style: italic;
          margin: 0.5rem 0;
        }
        .rich-editor-wrapper .ql-editor a {
          color: #dc2626;
          text-decoration: underline;
        }
        /* Scrollbar */
        .rich-editor-wrapper .ql-editor::-webkit-scrollbar {
          width: 6px;
        }
        .rich-editor-wrapper .ql-editor::-webkit-scrollbar-track {
          background: transparent;
        }
        .rich-editor-wrapper .ql-editor::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .rich-editor-wrapper .ql-editor::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
}
