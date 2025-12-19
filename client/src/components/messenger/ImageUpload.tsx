import { useRef, useState, type ChangeEvent } from "react";

interface ImageUploadProps {
  onUpload: (file: File) => Promise<void> | void;
  isUploading: boolean;
}

const ImageUpload = ({ onUpload, isUploading }: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    const isImage = /^image\/(jpe?g|png|gif|webp)$/i.test(file.type);
    const isTooLarge = file.size > 5 * 1024 * 1024;

    if (!isImage) {
      setError("Only JPG, PNG, GIF, or WEBP images are allowed.");
      setPreview(null);
      setSelectedFile(null);
      return;
    }

    if (isTooLarge) {
      setError("Image is too large. Max size is 5MB.");
      setPreview(null);
      setSelectedFile(null);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setSelectedFile(file);
  };

  const clearSelection = () => {
    setPreview(null);
    setSelectedFile(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = async () => {
    if (!selectedFile) return;
    setError("");
    try {
      await onUpload(selectedFile);
      clearSelection();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Upload failed. Please try again.";
      setError(message);
    }
  };

  return (
    <div className="space-y-1 rounded-lg border border-slate-100 bg-slate-50/80 p-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-700">Image</span>
        {preview && (
          <button
            type="button"
            onClick={clearSelection}
            className="text-xs text-red-500 underline"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
          className="text-xs"
        />
        <button
          type="button"
          onClick={handleUploadClick}
          disabled={!selectedFile || isUploading}
          className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {preview && (
        <div className="flex items-center gap-2 rounded border border-slate-200 bg-white p-2 text-xs text-slate-600">
          <img
            src={preview}
            alt="Preview"
            className="h-14 w-14 rounded object-cover"
          />
          <div className="flex-1">
            <p className="font-medium text-slate-700">Ready to send</p>
            <p className="text-[11px] text-slate-500">
              {selectedFile?.name?.slice(0, 30) || ""}{" "}
              {isUploading ? "(uploading...)" : ""}
            </p>
          </div>
        </div>
      )}

      {error && <div className="text-xs text-red-500">{error}</div>}
    </div>
  );
};

export default ImageUpload;
