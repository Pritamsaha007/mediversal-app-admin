"use client";
import {
  Search,
  Phone,
  Pencil,
  Check,
  X,
  Save,
  Loader2,
  Upload,
  ImagePlus,
  Trash2,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useAdminStore } from "@/app/store/adminStore";
import {
  readHeroSection,
  upsertHeroSection,
  HeroSectionData,
} from "../services";
import { uploadFile } from "@/app/admin/dashboard/lab_tests/services";
import { fileToBase64 } from "@/app/utils/functions";

const getBucketName = (): string => {
  const bucket =
    process.env.NODE_ENV === "development"
      ? process.env.NEXT_PUBLIC_AWS_BUCKET_NAME_DEV
      : process.env.NEXT_PUBLIC_AWS_BUCKET_NAME_PROD;
  if (!bucket) throw new Error("AWS bucket name not configured");
  return bucket;
};

const FOLDER_PATH = "simran/hero-section/banners";

function AnimatedCounter({
  end,
  suffix = "",
}: {
  end: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) setIsVisible(true);
      },
      { threshold: 0.1 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    const duration = 1000;
    const steps = 20;
    const increment = end / steps;
    const stepDuration = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else setCount(Math.floor(current));
    }, stepDuration);
    return () => clearInterval(timer);
  }, [isVisible, end]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl font-extrabold text-[#095A50] sm:text-4xl lg:text-5xl">
        {count.toLocaleString()}
        {suffix}
      </div>
    </div>
  );
}

function EditableText({
  value,
  onChange,
  multiline = false,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  const confirm = () => {
    onChange(draft);
    setEditing(false);
  };
  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <span className="relative inline-flex flex-col gap-2 w-full">
        {multiline ? (
          <textarea
            autoFocus
            className={`${className} border-2 border-[#095A50] rounded-xl px-3 py-2 outline-none bg-white shadow-sm resize-none w-full transition-all`}
            value={draft}
            rows={3}
            onChange={(e) => setDraft(e.target.value)}
          />
        ) : (
          <input
            autoFocus
            className={`${className} border-2 border-[#095A50] rounded-xl px-3 py-2 outline-none bg-white shadow-sm w-full transition-all`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
        )}
        <span className="flex gap-2">
          <button
            onClick={confirm}
            className="flex items-center gap-1.5 rounded-lg bg-[#90c7c1] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#074a42] transition-colors shadow-sm"
          >
            <Check className="h-3.5 w-3.5" /> Save
          </button>
          <button
            onClick={cancel}
            className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-4 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <X className="h-3.5 w-3.5" /> Cancel
          </button>
        </span>
      </span>
    );
  }

  return (
    <span className="group relative inline-flex items-start gap-0 w-full">
      <span className={className}>{value}</span>
      <button
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-all duration-150 flex-shrink-0 rounded-md bg-[#095A50] p-1.5 shadow-md hover:bg-[#074a42] hover:scale-110"
        title="Edit"
      >
        <Pencil className="h-3 w-3 text-white" />
      </button>
    </span>
  );
}

function EditableNumber({
  value,
  onChange,
  className = "",
  suffix = "",
}: {
  value: number;
  onChange: (v: number) => void;
  className?: string;
  suffix?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    if (!editing) setDraft(String(value));
  }, [value, editing]);

  const confirm = () => {
    const n = parseInt(draft.replace(/,/g, ""), 10);
    if (!isNaN(n)) onChange(n);
    setEditing(false);
  };
  const cancel = () => {
    setDraft(String(value));
    setEditing(false);
  };

  if (editing) {
    return (
      <span className="flex flex-col items-center gap-2">
        <input
          autoFocus
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          className={`${className} border-2 border-[#095A50] rounded-xl px-3 py-2 outline-none bg-white shadow-sm w-36 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
          value={draft}
          onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, ""))}
          onKeyDown={(e) => {
            if (e.key === "Enter") confirm();
            if (e.key === "Escape") cancel();
          }}
        />
        <span className="flex gap-2">
          <button
            onClick={confirm}
            className="flex items-center gap-1 rounded-lg bg-[#095A50] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#074a42] transition-colors shadow-sm"
          >
            <Check className="h-3 w-3" /> Save
          </button>
          <button
            onClick={cancel}
            className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      </span>
    );
  }

  return (
    <span className="group relative flex flex-col items-center">
      <span className={`${className} relative flex items-center gap-1`}>
        {value.toLocaleString()}
        {suffix}
        <button
          onClick={() => {
            setDraft(String(value));
            setEditing(true);
          }}
          className="absolute -top-3 -right-5 opacity-0 group-hover:opacity-100 transition-all duration-150 rounded-md bg-[#095A50] p-1 shadow-md hover:bg-[#074a42] hover:scale-110"
          title="Edit"
        >
          <Pencil className="h-2.5 w-2.5 text-white" />
        </button>
      </span>
    </span>
  );
}

interface ImageItem {
  url: string;
  uploading: boolean;
  error: string | null;
  localPreview: string | null;
}

function ImageGrid({
  images,
  onImagesChange,
  token,
}: {
  images: string[];
  onImagesChange: (imgs: string[]) => void;
  token: string;
}) {
  const addInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const replaceIndexRef = useRef<number | null>(null);

  const [items, setItems] = useState<ImageItem[]>(() =>
    images.map((url) => ({
      url,
      uploading: false,
      error: null,
      localPreview: null,
    })),
  );

  useEffect(() => {
    setItems(
      images.map((url) => ({
        url,
        uploading: false,
        error: null,
        localPreview: null,
      })),
    );
  }, [images.join("|")]);

  useEffect(() => {
    onImagesChange(
      items.filter((i) => i.url && !i.uploading).map((i) => i.url),
    );
  }, [items]);

  const uploadToS3 = async (file: File): Promise<string> => {
    const objectUrl = URL.createObjectURL(file);
    const base64 = await fileToBase64(objectUrl);
    URL.revokeObjectURL(objectUrl);

    const res = await uploadFile(token, {
      bucketName: getBucketName(),
      folderPath: FOLDER_PATH,
      fileName: `banner-${Date.now()}-${file.name}`,
      fileContent: base64,
    });

    if (!res.success) throw new Error("Upload failed");
    return res.result;
  };

  const handleAddFiles = async (fileList: FileList) => {
    const files = Array.from(fileList).filter((f) =>
      /image\/(jpeg|jpg|png|webp)/.test(f.type),
    );
    if (!files.length) return;

    const placeholders: ImageItem[] = files.map((f) => ({
      url: "",
      uploading: true,
      error: null,
      localPreview: URL.createObjectURL(f),
    }));

    let baseLength = 0;
    setItems((prev) => {
      baseLength = prev.length;
      return [...prev, ...placeholders];
    });

    for (let i = 0; i < files.length; i++) {
      const placeholderIdx = baseLength + i;
      try {
        const url = await uploadToS3(files[i]);
        setItems((prev) => {
          const next = [...prev];
          if (next[placeholderIdx]?.localPreview) {
            URL.revokeObjectURL(next[placeholderIdx].localPreview!);
          }
          next[placeholderIdx] = {
            url,
            uploading: false,
            error: null,
            localPreview: null,
          };
          return next;
        });
      } catch (err: any) {
        setItems((prev) => {
          const next = [...prev];
          next[placeholderIdx] = {
            ...next[placeholderIdx],
            uploading: false,
            error: err?.message || "Upload failed",
          };
          return next;
        });
      }
    }

    if (addInputRef.current) addInputRef.current.value = "";
  };

  const handleReplaceFile = async (file: File, idx: number) => {
    const localPreview = URL.createObjectURL(file);
    setItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], uploading: true, error: null, localPreview };
      return next;
    });

    try {
      const url = await uploadToS3(file);
      setItems((prev) => {
        const next = [...prev];
        if (next[idx]?.localPreview)
          URL.revokeObjectURL(next[idx].localPreview!);
        next[idx] = { url, uploading: false, error: null, localPreview: null };
        return next;
      });
    } catch (err: any) {
      setItems((prev) => {
        const next = [...prev];
        if (next[idx]?.localPreview)
          URL.revokeObjectURL(next[idx].localPreview!);
        next[idx] = {
          ...next[idx],
          uploading: false,
          error: err?.message || "Upload failed",
          localPreview: null,
        };
        return next;
      });
    }

    if (replaceInputRef.current) replaceInputRef.current.value = "";
  };

  const handleDelete = (idx: number) => {
    setItems((prev) => {
      if (prev[idx]?.localPreview) URL.revokeObjectURL(prev[idx].localPreview!);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const anyUploading = items.some((i) => i.uploading);

  return (
    <div className="space-y-3">
      <input
        ref={addInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) handleAddFiles(e.target.files);
        }}
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          const idx = replaceIndexRef.current;
          if (file && idx !== null) handleReplaceFile(file, idx);
        }}
      />

      {items.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="group relative overflow-hidden rounded-xl bg-gray-100 aspect-video"
            >
              {(item.localPreview || item.url) && (
                <img
                  src={item.localPreview ?? item.url}
                  alt={`Banner ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
              )}

              {item.uploading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-xl">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                  <span className="mt-1 text-[11px] text-white font-medium">
                    Uploading…
                  </span>
                </div>
              )}

              {item.error && !item.uploading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-red-500/80 rounded-xl px-2 text-center">
                  <span className="text-[11px] text-white font-medium leading-tight">
                    {item.error}
                  </span>
                  <button
                    onClick={() => {
                      replaceIndexRef.current = idx;
                      replaceInputRef.current?.click();
                    }}
                    className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-semibold text-red-600 hover:bg-gray-100"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!item.uploading && !item.error && (
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                  <button
                    onClick={() => {
                      replaceIndexRef.current = idx;
                      replaceInputRef.current?.click();
                    }}
                    className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1.5 text-[11px] font-semibold text-[#095A50] hover:bg-white transition"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(idx)}
                    className="flex items-center gap-1 rounded-full bg-red-500/90 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-red-600 transition"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-sm text-gray-400">
          No banner images yet
        </div>
      )}

      <button
        onClick={() => addInputRef.current?.click()}
        disabled={anyUploading}
        className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-3 text-sm font-semibold transition ${
          anyUploading
            ? "border-gray-200 text-gray-300 cursor-not-allowed"
            : "border-[#095A50]/40 text-[#095A50] hover:border-[#095A50] hover:bg-[#E6FFFC]/50"
        }`}
      >
        {anyUploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Uploading images…
          </>
        ) : (
          <>
            <ImagePlus className="h-4 w-4" /> Add Banner Images
          </>
        )}
      </button>

      <p className="text-[10px] text-gray-400 text-center">
        Supported: JPG, JPEG, PNG, WEBP · Select multiple · Uploaded one by one
      </p>
    </div>
  );
}

export default function HeroSection() {
  const { token } = useAdminStore();

  const [heroData, setHeroData] = useState<HeroSectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [patientsTreated, setPatientsTreated] = useState(0);
  const [specialistDoctors, setSpecialistDoctors] = useState(0);
  const [surgeriesDone, setSurgeriesDone] = useState(0);
  const [hospitalBeds, setHospitalBeds] = useState(0);

  const isDirty = heroData
    ? title !== heroData.title ||
      description !== heroData.description ||
      JSON.stringify(images) !== JSON.stringify(heroData.image_url) ||
      patientsTreated !== heroData.patients_treated ||
      specialistDoctors !== heroData.specialist_doctors ||
      surgeriesDone !== heroData.surgeries_done ||
      hospitalBeds !== heroData.hospital_beds
    : false;

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await readHeroSection(token);
        const data = res.heroSection?.[0];
        if (data) {
          setHeroData(data);
          setTitle(data.title);
          setDescription(data.description);
          setImages(data.image_url);
          setPatientsTreated(data.patients_treated);
          setSpecialistDoctors(data.specialist_doctors);
          setSurgeriesDone(data.surgeries_done);
          setHospitalBeds(data.hospital_beds);
        }
      } catch (err: any) {
        setFetchError(err?.message || "Failed to load hero section data");
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchData();
  }, [token]);

  const handleSave = async () => {
    if (!heroData) return;
    const toastId = toast.loading("Saving changes…");
    try {
      setSaving(true);
      await upsertHeroSection(
        {
          id: heroData.id,
          title,
          description,
          image_url: images,
          is_deleted: heroData.is_deleted,
          patients_treated: patientsTreated,
          specialist_doctors: specialistDoctors,
          surgeries_done: surgeriesDone,
          hospital_beds: hospitalBeds,
        },
        token,
      );
      setHeroData((prev) =>
        prev
          ? {
              ...prev,
              title,
              description,
              image_url: images,
              patients_treated: patientsTreated,
              specialist_doctors: specialistDoctors,
              surgeries_done: surgeriesDone,
              hospital_beds: hospitalBeds,
            }
          : prev,
      );
      toast.success("Hero section updated successfully!", { id: toastId });
    } catch (err: any) {
      toast.error(err?.message || "Failed to save changes.", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const stats = [
    {
      value: patientsTreated,
      label: "Patients treated",
      suffix: "+",
      setter: setPatientsTreated,
    },
    {
      value: specialistDoctors,
      label: "Specialist Doctors",
      suffix: "+",
      setter: setSpecialistDoctors,
    },
    {
      value: surgeriesDone,
      label: "Surgeries Done",
      suffix: "+",
      setter: setSurgeriesDone,
    },
    {
      value: hospitalBeds,
      label: "Hospital Beds",
      suffix: "+",
      setter: setHospitalBeds,
    },
  ];

  if (loading) {
    return (
      <section className="relative flex h-64 items-center justify-center bg-gradient-to-br from-[#E6FFFC] via-[#F0FBF9] to-[#E6FFFC]">
        <Loader2 className="h-8 w-8 animate-spin text-[#095A50]" />
      </section>
    );
  }

  if (fetchError) {
    return (
      <section className="relative flex h-40 items-center justify-center bg-gradient-to-br from-[#E6FFFC] via-[#F0FBF9] to-[#E6FFFC]">
        <p className="text-red-500 text-sm">{fetchError}</p>
      </section>
    );
  }

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-[#E6FFFC] via-[#F0FBF9] to-[#E6FFFC]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#095A50]/10 blur-3xl" />
          <div className="absolute -top-10 -right-20 h-80 w-80 rounded-full bg-[#0073A0]/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-16 sm:pb-20">
          <div className="mb-6 flex items-center justify-end">
            <button
              onClick={handleSave}
              disabled={!isDirty || saving}
              className={`group flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 ${
                isDirty && !saving
                  ? "bg-[#095A50] hover:bg-[#074a42] shadow-lg shadow-[#095A50]/25 hover:shadow-xl hover:shadow-[#095A50]/30 hover:-translate-y-0.5"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
              }`}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save
                  className={`h-4 w-4 transition-transform ${isDirty ? "group-hover:scale-110" : ""}`}
                />
              )}
              {saving ? "Saving…" : "Save Changes"}
              {isDirty && !saving && (
                <span className="ml-1 flex h-2 w-2 rounded-full bg-amber-400 ring-2 ring-amber-400" />
              )}
            </button>
          </div>

          <div className="grid items-start gap-10 lg:grid-cols-2">
            <div>
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-[#095A50] sm:text-5xl lg:text-6xl">
                <EditableText
                  value={title}
                  onChange={setTitle}
                  className="text-4xl font-bold leading-tight tracking-tight text-[#095A50] sm:text-5xl lg:text-6xl"
                />
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-[#161C1F] sm:text-lg">
                <EditableText
                  value={description}
                  onChange={setDescription}
                  multiline
                  className="text-base leading-relaxed text-[#161C1F] sm:text-lg"
                />
              </p>
            </div>

            <div className="rounded-2xl bg-white/60 p-4 shadow-sm border border-white/80 backdrop-blur-sm">
              <div className="mb-3 flex items-center gap-2">
                <Upload className="h-4 w-4 text-[#095A50]" />
                <span className="text-sm font-semibold text-[#095A50]">
                  Banner Images
                </span>
                <span className="ml-auto text-xs text-gray-400">
                  {images.length} image{images.length !== 1 ? "s" : ""}
                </span>
              </div>
              <ImageGrid
                images={images}
                onImagesChange={setImages}
                token={token}
              />
            </div>
          </div>

          <div className="mt-20 flex justify-center">
            <div className="w-full max-w-4xl rounded-2xl bg-white shadow-soft">
              <div className="flex flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] sm:flex-row">
                <div className="flex flex-1 items-center gap-3 px-4 py-4">
                  <Search className="h-5 w-5 text-[#161D1F]" />
                  <input
                    placeholder="What are you experiencing? e.g. chest pain..."
                    className="w-full bg-transparent text-sm text-[#161C1F] outline-none placeholder:text-[#161D1F]"
                  />
                </div>
                <button
                  type="button"
                  className="bg-[#095A50] px-8 py-4 text-sm font-semibold text-white transition hover:opacity-95 sm:rounded-none"
                >
                  Get help
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-full border border-[#FF4D4D]/50 bg-[#FFEAEA] px-5 py-2.5 text-sm font-semibold text-[#FF4D4D] transition hover:opacity-95">
              <Phone className="h-4 w-4" />
              Emergency? <span className="font-extrabold">Call Now</span>
            </button>
            <button className="rounded-full border border-[#095A50]/40 bg-white px-5 py-2.5 text-sm font-semibold text-[#00312B] transition hover:bg-white/70">
              Find a Doctor
            </button>
            <button className="rounded-full border border-[#095A50]/40 bg-white px-5 py-2.5 text-sm font-semibold text-[#00312B] transition hover:bg-white/70">
              Health Checkup
            </button>
            <button className="rounded-full border border-[#095A50]/40 bg-white px-5 py-2.5 text-sm font-semibold text-[#00312B] transition hover:bg-white/70">
              Specialities
            </button>
          </div>

          <div className="mt-20 grid grid-cols-2 gap-8 sm:gap-12 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <EditableNumber
                  value={stat.value}
                  onChange={stat.setter}
                  suffix={stat.suffix}
                  className="text-3xl font-extrabold text-[#095A50] sm:text-4xl lg:text-5xl"
                />
                <p className="mt-2 text-sm text-[#161D1F] sm:text-base">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
