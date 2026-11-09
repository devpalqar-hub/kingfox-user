"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Box,
  Crop,
  Hand,
  Image as ImageIcon,
  PencilRuler,
  ShoppingCart,
  Trash2,
  Type,
  X,
} from "lucide-react";
import type { ImageLayer, Layer, TextLayer } from "@/types/design-studio";
import {
  PRINT_PX_PER_MM,
  VIEW_LABELS,
  garmentForCategory,
  viewsOf,
  type StudioView,
} from "@/lib/design-studio/printZones";
import {
  drawFrame,
  measureText,
  preloadLayerImages,
} from "@/lib/design-studio/frameRenderer";
import { useDesignStore } from "@/stores/design-studio/useDesignStore";
import {
  addToCustomCartAPI,
  getCustomDesignTypesAPI,
  uploadImagesAPI,
} from "@/services/custom-design.service";
import { useToast } from "@/context/ToastContext";
import { useConfirm } from "@/context/ConfirmContext";
import CostEstimateModal from "@/components/design-studio/modals/CostEstimateModal";
import ClearConfirmModal from "@/components/design-studio/modals/ClearConfirmModal";
import FrameEditor from "./FrameEditor";
import GarmentViewer, { type ViewerApi } from "./GarmentViewer";
import s from "./studio.module.css";

const categoryToShirtType: Record<string, string> = {
  "oversized-tee": "OVERSIZED",
  "classic-hoodie": "HOODIE",
  "crewneck-sweatshirt": "HALF_SLEEVE",
  "long-sleeve-tee": "FULL_SLEEVE",
  "polo-Tshirt": "POLO",
};

const TEXT_COLORS = ["#111111", "#ffffff", "#2563eb", "#dc2626", "#16a34a", "#f59e0b"];

const uid = () => Math.random().toString(36).slice(2, 10);

export default function Studio({ categoryId }: { categoryId: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const spec = useMemo(() => garmentForCategory(categoryId), [categoryId]);
  const views = useMemo(() => viewsOf(spec), [spec]);

  const {
    project,
    activeView,
    selectedLayerId,
    switchView,
    addLayer,
    updateLayer,
    removeLayer,
    selectLayer,
    calculatePricing,
    changeApparelColor,
    setApparelSize,
    setApparelCategory,
    setApparelQuantity,
    setAvailableVariants,
    availableVariants,
  } = useDesignStore();

  const [mobilePane, setMobilePane] = useState<"design" | "preview">("design");
  const [showZone, setShowZone] = useState(true);
  const [isEstimateOpen, setIsEstimateOpen] = useState(false);
  const [isClearOpen, setIsClearOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [sheet, setSheet] = useState<null | "text" | "image" | "options">(null);
  const [invalid, setInvalid] = useState<null | "size" | "color">(null);

  // The studio fills exactly the space below the site header, so measure where
  // the header ends instead of assuming its height.
  const pageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;
    const measure = () =>
      el.style.setProperty(
        "--site-header",
        `${Math.round(el.getBoundingClientRect().top + window.scrollY)}px`,
      );
    measure();
    const timers = [setTimeout(measure, 300), setTimeout(measure, 1500)];
    window.addEventListener("resize", measure);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const fileRef = useRef<HTMLInputElement>(null);
  const viewerApi = useRef<ViewerApi | null>(null);
  // Size at the moment the slider was grabbed, so scaling is not cumulative.
  const scaleBase = useRef<{ id: string; w: number; h: number; fontSize?: number } | null>(null);

  // The store may hold a view this garment doesn't offer (e.g. after switching
  // from polo to hoodie) — snap back to front.
  const view: StudioView = spec.zones[activeView] ? activeView : "front";
  useEffect(() => {
    if (!spec.zones[activeView]) switchView("front");
  }, [spec, activeView, switchView]);

  const zone = spec.zones[view]!;
  const frame = useMemo(
    () => ({ widthMm: zone.sizeMm[0], heightMm: zone.sizeMm[1] }),
    [zone],
  );
  const layers = project.designs;
  const current: Layer[] = layers[view] ?? [];
  const selected = current.find((l) => l.id === selectedLayerId) ?? null;

  // ── Variants (size / colour / price) ──────────────────────────────────────
  const [variantsState, setVariantsState] = useState<"loading" | "ready" | "error">("loading");

  // Make the store match this garment (a different garment starts with no size
  // or colour chosen — each has its own).
  useEffect(() => {
    setApparelCategory(categoryId);
  }, [categoryId, setApparelCategory]);

  useEffect(() => {
    let cancelled = false;
    const fetchVariants = async () => {
      setAvailableVariants([]);
      setVariantsState("loading");
      try {
        const shirtType = categoryToShirtType[categoryId] || "HALF_SLEEVE";
        const data = await getCustomDesignTypesAPI(shirtType);
        if (cancelled) return;
        setAvailableVariants(data[shirtType] ?? []);
        setVariantsState("ready");
      } catch (error) {
        console.error("Failed to fetch custom design types", error);
        if (!cancelled) setVariantsState("error");
      }
    };
    fetchVariants();
    return () => {
      cancelled = true;
    };
  }, [categoryId, setAvailableVariants]);

  // On phones, start by asking for the mandatory size and colour.
  useEffect(() => {
    const { size: chosen } = useDesignStore.getState().project.apparelConfig;
    if (!chosen && window.matchMedia("(max-width: 999px)").matches) setSheet("options");
  }, [categoryId]);

  const uniqueSizes = Array.from(new Set(availableVariants.map((v) => v.size)));
  const colorsForSize = availableVariants.filter(
    (v) => v.size === project.apparelConfig.size,
  );
  const size = project.apparelConfig.size;
  const variantId = project.apparelConfig.customDesignVariantId;
  const hasSize = Boolean(size);
  const hasColor = Boolean(variantId);
  const selectionDone = hasSize && hasColor;
  const colorHex = project.apparelConfig.colorHex || "#f5f5f5";
  const unitPrice = project.apparelConfig.basePrice ?? 0;
  const quantity = project.apparelConfig.quantity || 1;
  const total = unitPrice * quantity;

  // ── Layer helpers ─────────────────────────────────────────────────────────
  const nextZ = () => current.reduce((m, l) => Math.max(m, l.zIndex), 0) + 1;

  const baseLayer = () => ({
    id: uid(),
    rotation: 0,
    zIndex: nextZ(),
    isLocked: false,
    isVisible: true,
    opacity: 1,
  });

  const addText = () => {
    const t = {
      text: "YOUR TEXT",
      fontFamily: "Arial Black",
      fontSize: 30,
      fontWeight: 800,
      letterSpacing: 1,
    };
    let size = measureText(t);
    // New text always starts inside the print area (max 80% of its width).
    if (size.width > frame.widthMm * 0.8) {
      t.fontSize = Math.max(8, Math.floor((t.fontSize * frame.widthMm * 0.8) / size.width));
      size = measureText(t);
    }
    const layer: TextLayer = {
      ...baseLayer(),
      type: "text",
      name: "Text",
      ...t,
      colorHex: colorHex.toLowerCase() === "#ffffff" || colorHex === "#f5f5f5" ? "#111111" : "#ffffff",
      textAlign: "center",
      width: size.width,
      height: size.height,
      x: Math.round((frame.widthMm - size.width) / 2),
      y: Math.round((frame.heightMm - size.height) / 2),
    };
    addLayer(layer);
  };

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      const img = new window.Image();
      img.onload = () => {
        const ratio = img.naturalWidth / Math.max(1, img.naturalHeight);
        // Start at 70% of the boundary, keeping the image's own proportions.
        let w = frame.widthMm * 0.7;
        let h = w / ratio;
        if (h > frame.heightMm * 0.7) {
          h = frame.heightMm * 0.7;
          w = h * ratio;
        }
        const layer: ImageLayer = {
          ...baseLayer(),
          type: "image",
          name: file.name || "Image",
          width: Math.round(w),
          height: Math.round(h),
          x: Math.round((frame.widthMm - w) / 2),
          y: Math.round((frame.heightMm - h) / 2),
          asset: {
            assetId: uid(),
            originalUrl: url,
            thumbnailUrl: url,
            mimeType: file.type || "image/png",
          },
        };
        addLayer(layer);
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  const startRescale = () => {
    if (!selected) return;
    scaleBase.current = {
      id: selected.id,
      w: selected.width,
      h: selected.height,
      fontSize: selected.type === "text" ? (selected as TextLayer).fontSize : undefined,
    };
  };

  const rescale = (percent: number) => {
    const base = scaleBase.current;
    if (!selected || !base || base.id !== selected.id) return;
    const k = percent / 100;
    const cx = selected.x + selected.width / 2;
    const cy = selected.y + selected.height / 2;
    const w = Math.max(5, Math.round(base.w * k));
    const h = Math.max(5, Math.round(base.h * k));
    const changes: Partial<Layer> = {
      width: w,
      height: h,
      x: Math.round(cx - w / 2),
      y: Math.round(cy - h / 2),
    };
    if (base.fontSize) {
      (changes as Partial<TextLayer>).fontSize = Math.max(4, base.fontSize * k);
    }
    updateLayer(selected.id, changes);
  };

  const setText = (text: string) => {
    if (!selected || selected.type !== "text") return;
    const next = { ...selected, text } as TextLayer;
    const size = measureText(next);
    const cx = selected.x + selected.width / 2;
    updateLayer(selected.id, {
      text,
      width: size.width,
      height: size.height,
      x: Math.round(cx - size.width / 2),
    } as Partial<Layer>);
  };

  const handleBack = async () => {
    const hasContent = views.some((v) => (layers[v] ?? []).length > 0);
    if (hasContent) {
      const confirmed = await confirm({
        title: "Discard changes?",
        message:
          "Going back will discard your current design changes. Do you want to continue?",
        confirmText: "Yes, discard",
        cancelText: "Cancel",
      });
      if (!confirmed) return;
      useDesignStore.getState().clearAll();
    }
    router.push("/design-studio/select");
  };

  // ── Checkout ──────────────────────────────────────────────────────────────
  const dataURLtoFile = (dataurl: string, filename: string) => {
    const arr = dataurl.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/png";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  /** Exact print artwork (300 DPI, transparent) for one view. */
  const renderPrintPng = async (v: StudioView): Promise<string> => {
    const z = spec.zones[v]!;
    const content = layers[v] ?? [];
    await preloadLayerImages(content);
    const canvas = document.createElement("canvas");
    drawFrame(canvas, { widthMm: z.sizeMm[0], heightMm: z.sizeMm[1] }, content, {
      scale: PRINT_PX_PER_MM,
    });
    return canvas.toDataURL("image/png");
  };

  const handleCheckout = async () => {
    try {
      setIsCheckingOut(true);

      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        showToast("Please log in before checking out.", "error");
        return;
      }

      const variantId = project.apparelConfig.customDesignVariantId;
      if (!variantId) {
        showToast("Please select a valid size and color combination.", "error");
        return;
      }

      const api = viewerApi.current;
      if (!api) {
        showToast("The 3D preview is still loading. Please try again.", "error");
        return;
      }

      showToast("Preparing your custom design...", "info");

      // Garment snapshots (what the customer sees in the cart).
      const frontDataUrl = api.capture("front");
      const backDataUrl = api.capture("back");
      if (!frontDataUrl || !backDataUrl) {
        showToast("Failed to capture design images.", "error");
        return;
      }

      const filesToUpload: File[] = [
        dataURLtoFile(frontDataUrl, "front.png"),
        dataURLtoFile(backDataUrl, "back.png"),
      ];

      // Exact print files for every view that has artwork.
      const printedViews = views.filter((v) => (layers[v] ?? []).length > 0);
      for (const v of printedViews) {
        filesToUpload.push(dataURLtoFile(await renderPrintPng(v), `print-${v}.png`));
      }

      const stickerText = views
        .flatMap((v) => (layers[v] ?? []).filter((l): l is TextLayer => l.type === "text"))
        .map((l) => l.text)
        .filter(Boolean)
        .join(" | ");

      let urls: string[];
      try {
        const uploadResult = await uploadImagesAPI(filesToUpload);
        urls = uploadResult.urls;
      } catch (uploadErr: unknown) {
        console.error("Image upload failed:", uploadErr);
        const status = (uploadErr as { response?: { status?: number } })?.response?.status;
        showToast(
          status === 401 || status === 403
            ? "Session expired. Please log in again."
            : "Image upload failed. Please try again.",
          "error",
        );
        return;
      }

      if (!urls || urls.length < 2) {
        showToast("Image upload returned incomplete data.", "error");
        return;
      }

      try {
        await addToCustomCartAPI({
          customDesignVariantId: variantId,
          quantity,
          frontImageUrl: urls[0],
          backImageUrl: urls[1],
          stickerText: stickerText || undefined,
          assetImageUrls: urls.length > 2 ? urls.slice(2) : undefined,
          notes: printedViews.length
            ? `300 DPI print files (in order): ${printedViews
                .map((v) => VIEW_LABELS[v])
                .join(", ")}`
            : undefined,
        });
      } catch (cartErr: unknown) {
        console.error("Add to cart failed:", cartErr);
        const status = (cartErr as { response?: { status?: number } })?.response?.status;
        showToast(
          status === 401 || status === 403
            ? "Session expired. Please log in again."
            : "Failed to add to cart. Please try again.",
          "error",
        );
        return;
      }

      showToast("Custom design added to cart!", "success");
      router.push("/cart");
    } catch (err) {
      console.error("Checkout error:", err);
      showToast("An unexpected error occurred. Please try again.", "error");
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Size, then colour, are mandatory. On phones the Options sheet is where they
  // are chosen, so a failed check brings it up.
  const requireSelection = (): boolean => {
    if (selectionDone) return true;
    if (!hasSize) {
      showToast("Please select a size first.", "error");
      setInvalid("size");
    } else {
      showToast(`Please select a color for size ${size}.`, "error");
      setInvalid("color");
    }
    if (window.matchMedia("(max-width: 999px)").matches) setSheet("options");
    return false;
  };

  const openEstimate = () => {
    if (!requireSelection()) return;
    calculatePricing();
    setIsEstimateOpen(true);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const garmentImage = GARMENT_IMAGES[spec.key]?.[view];
  const editorAspect = garmentImage
    ? garmentImage.width / garmentImage.height
    : frame.widthMm / frame.heightMm;

  const layerPanel = selected ? (
                <div className={s.layerPanel}>
                  <div className={s.layerPanelHead}>
                    <span className={s.layerName}>{selected.name}</span>
                    <button className={s.deleteBtn} onClick={() => removeLayer(selected.id)}>
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>

                  {selected.type === "text" && (
                    <>
                      <label className={s.fieldLabel}>
                        <span className={`${s.fieldName} ${s.fieldNameDesktopHidden}`}>Text</span>
                        <input
                          aria-label="Text"
                          className={s.textInput}
                          value={(selected as TextLayer).text}
                          onChange={(e) => setText(e.target.value)}
                        />
                      </label>
                      <div className={s.fieldLabel}>
                        <span className={`${s.fieldName} ${s.fieldNameDesktopHidden}`}>
                          Text color
                        </span>
                        <div className={s.swatchRow}>
                          {TEXT_COLORS.map((c) => (
                            <button
                              key={c}
                              aria-label={`Text color ${c}`}
                              className={`${s.textSwatch} ${
                                (selected as TextLayer).colorHex === c ? s.textSwatchActive : ""
                              }`}
                              style={{ background: c }}
                              onClick={() => updateLayer(selected.id, { colorHex: c } as Partial<Layer>)}
                            />
                          ))}
                          <input
                            type="color"
                            className={s.colorInput}
                            value={(selected as TextLayer).colorHex}
                            onChange={(e) =>
                              updateLayer(selected.id, { colorHex: e.target.value } as Partial<Layer>)
                            }
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <label className={s.fieldLabel}>
                    <span className={s.fieldName}>Size</span>
                    <input
                      className={s.slider}
                      type="range"
                      min={20}
                      max={250}
                      defaultValue={100}
                      key={selected.id}
                      onPointerDown={startRescale}
                      onKeyDown={startRescale}
                      onChange={(e) => rescale(Number(e.target.value))}
                    />
                  </label>
                  <label className={s.fieldLabel}>
                    <span className={s.fieldName}>Rotate</span>
                    <input
                      className={s.slider}
                      type="range"
                      min={-180}
                      max={180}
                      value={selected.rotation}
                      onChange={(e) =>
                        updateLayer(selected.id, { rotation: Number(e.target.value) })
                      }
                    />
                  </label>
                </div>

  ) : null;

  const sizeHint =
    variantsState === "loading"
      ? "Loading sizes…"
      : variantsState === "error"
        ? "Couldn't load sizes. Please refresh the page."
        : "No sizes are available for this product right now.";

  const optionFields = (
    <>
      <div className={`${s.optionBlock} ${invalid === "size" && !hasSize ? s.optionInvalid : ""}`}>
        <span className={s.optionLabel}>
          <span className={`${s.stepNum} ${hasSize ? s.stepDone : ""}`}>{hasSize ? "✓" : "1"}</span>
          Select size
          {!hasSize && <span className={s.required}>Required</span>}
        </span>
        {uniqueSizes.length ? (
          <div className={s.sizeGrid}>
            {uniqueSizes.map((sz) => (
              <button
                key={sz}
                className={`${s.sizeBtn} ${size === sz ? s.sizeBtnActive : ""}`}
                onClick={() => {
                  setApparelSize(sz);
                  setInvalid(null);
                }}
              >
                {sz}
              </button>
            ))}
          </div>
        ) : (
          <p className={s.hint}>{sizeHint}</p>
        )}
      </div>

      <div
        className={`${s.optionBlock} ${!hasSize ? s.optionLocked : ""} ${
          invalid === "color" && !hasColor ? s.optionInvalid : ""
        }`}
      >
        <span className={s.optionLabel}>
          <span className={`${s.stepNum} ${hasColor ? s.stepDone : ""}`}>{hasColor ? "✓" : "2"}</span>
          Select color
          {hasColor ? (
            <span className={s.chosenName}>{project.apparelConfig.colorName}</span>
          ) : (
            hasSize && <span className={s.required}>Required</span>
          )}
        </span>
        {!hasSize ? (
          <p className={s.hint}>Choose a size first — the colors available depend on the size.</p>
        ) : colorsForSize.length ? (
          <div className={s.swatchGrid}>
            {colorsForSize.map((variant) => (
              <button
                key={variant.id}
                title={`${variant.color}${variant.outOfStock ? " (Out of stock)" : ""}`}
                aria-label={variant.color}
                className={`${s.garmentSwatch} ${
                  project.apparelConfig.colorHex === variant.colorCode ? s.garmentSwatchActive : ""
                } ${variant.outOfStock ? s.garmentSwatchOut : ""}`}
                style={{ background: variant.colorCode }}
                onClick={() => {
                  if (variant.outOfStock) {
                    showToast("This color is out of stock in the selected size.", "error");
                  } else {
                    changeApparelColor(variant.colorCode, variant.color);
                    setInvalid(null);
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <p className={s.hint}>No colors are available in size {size}. Try another size.</p>
        )}
      </div>

      <div className={s.optionBlock}>
        <span className={s.optionLabel}>
          <Layers size={17} /> Quantity
        </span>
        <div className={s.qtyRow}>
          <button
            className={s.qtyBtn}
            onClick={() => setApparelQuantity(Math.max(1, quantity - 1))}
          >
            −
          </button>
          <span className={s.qtyValue}>{quantity}</span>
          <button className={s.qtyBtn} onClick={() => setApparelQuantity(quantity + 1)}>
            +
          </button>
        </div>
      </div>
    </>
  );

  const stepNotice = !selectionDone ? (
    <p className={s.stepNotice}>
      {!hasSize
        ? "Start here: choose your size, then your color."
        : `Now choose a color for size ${size}.`}
    </p>
  ) : null;

  const addLabel = isCheckingOut
    ? "Adding to cart…"
    : !hasSize
      ? "Select a size"
      : !hasColor
        ? "Select a color"
        : "Add to cart";

  return (
    <div className={s.page} ref={pageRef}>
      <div className={s.inner}>
        <div className={s.topBar}>
          <button className={s.backBtn} onClick={handleBack}>
            <ArrowLeft size={15} /> Back
          </button>
          <div>
            <h1 className={s.title}>Customize {spec.label}</h1>
            <p className={s.subtitle}>
              Place your design inside the dashed boundary — that is exactly what gets printed.
            </p>
          </div>
        </div>

        <div className={s.viewTabs}>
          {views.map((v) => {
            const count = (layers[v] ?? []).length;
            return (
              <button
                key={v}
                className={`${s.viewTab} ${v === view ? s.viewTabActive : ""}`}
                onClick={() => switchView(v)}
              >
                {VIEW_LABELS[v]}
                {count > 0 && <span className={s.viewTabBadge}>{count}</span>}
              </button>
            );
          })}
        </div>

        <div className={s.main}>
          <div className={s.stage}>
            <div className={s.paneToggle}>
              <button
                className={`${s.paneToggleBtn} ${mobilePane === "design" ? s.paneToggleActive : ""}`}
                onClick={() => setMobilePane("design")}
              >
                <PencilRuler size={15} /> Design
              </button>
              <button
                className={`${s.paneToggleBtn} ${mobilePane === "preview" ? s.paneToggleActive : ""}`}
                onClick={() => setMobilePane("preview")}
              >
                <Box size={15} /> 3D Preview
              </button>
            </div>

            {/* 2D boundary editor */}
            <section
              className={`${s.card} ${s.pane} ${mobilePane !== "design" ? s.paneHiddenMobile : ""}`}
            >
              <div className={s.cardHead}>
                <h2 className={s.cardTitle}>
                  <Crop size={18} /> Print Area
                  <span
                    className={s.infoDot}
                    title="Artwork outside the dashed boundary is not printed."
                  >
                    <Info size={15} />
                  </span>
                </h2>
                <span className={s.cardMeta}>
                  {VIEW_LABELS[view]} ({zone.sizeMm[0] / 10} × {zone.sizeMm[1] / 10} cm)
                </span>
              </div>
              <div className={s.printBody}>
                <div className={s.toolsRow}>
                  <button className={s.toolBtn} onClick={addText}>
                    <Type size={20} /> <span>Add text</span>
                  </button>
                  <button className={s.toolBtn} onClick={() => fileRef.current?.click()}>
                    <ImageIcon size={20} /> <span>Upload image</span>
                  </button>
                </div>

                <div className={s.editorArea}>
                  <div
                    className={s.editorWrap}
                    style={{ "--aspect": editorAspect.toFixed(3) } as React.CSSProperties}
                  >
                    <FrameEditor
                      frame={frame}
                      image={garmentImage}
                      layers={current}
                      background={colorHex}
                      selectedId={selectedLayerId}
                      onSelect={selectLayer}
                      onPatch={updateLayer}
                      onDelete={removeLayer}
                    />
                  </div>
                </div>
              </div>

              <div className={s.layerDock}>
              {layerPanel ?? (
                <p className={s.dockHint}>
                  Add text or upload an image, then tap it to change its size, colour and
                  rotation.
                </p>
              )}
            </section>

            {/* 3D preview */}
            <section
              className={`${s.card} ${s.pane} ${mobilePane !== "preview" ? s.paneHiddenMobile : ""}`}
            >
              <h2 className={s.cardTitle}>3D preview</h2>
              <div className={s.viewerBox}>
                <GarmentViewer
                  spec={spec}
                  colorHex={colorHex}
                  view={view}
                  layers={layers}
                  showZone={showZone}
                  apiRef={viewerApi}
                />
              </div>
              <label className={s.zoneToggle}>
                <input
                  type="checkbox"
                  checked={showZone}
                  onChange={(e) => setShowZone(e.target.checked)}
                />
                Show print boundary on the garment
              </label>
            </section>
          </div>

          {/* Options */}
          <aside className={`${s.card} ${s.optionsCard}`}>
            <h2 className={`${s.cardTitle} ${s.optionsTitle}`}>
              <SlidersHorizontal size={18} /> Customize Options
            </h2>
            {stepNotice}
            {optionFields}

            <div className={s.optionBlock}>
              <div className={s.priceRow}>
                <span className={s.priceLabel}>
                  {unitPrice ? `₹${unitPrice} × ${quantity}` : "Select size & color"}
                </span>
                <span className={s.priceValue}>{unitPrice ? `₹${total}` : "—"}</span>
              </div>
              <button
                className={`${s.primaryBtn} ${!selectionDone ? s.primaryBtnIncomplete : ""}`}
                onClick={openEstimate}
                disabled={isCheckingOut}
              >
                <ShoppingCart size={17} />
                <span className={s.primaryBtnText}>{addLabel}</span>
                <ArrowRight size={18} />
              </button>
              <button className={s.secondaryBtn} onClick={() => setIsClearOpen(true)}>
                <Trash2 size={14} /> Clear design
              </button>
            </div>
          </aside>
        </div>
      </div>

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onUpload} />

      {/* Mobile bottom bar */}
      <div className={s.mobileBar}>
        <button
          className={`${s.barTool} ${selected?.type === "text" ? s.barToolActive : ""}`}
          onClick={() => setSheet("text")}
        >
          <Type size={20} />
          <span>Text</span>
        </button>
        <button
          className={`${s.barTool} ${selected?.type === "image" ? s.barToolActive : ""}`}
          onClick={() => setSheet("image")}
        >
          <ImageIcon size={20} />
          <span>Image</span>
        </button>
        <button
          className={`${s.barTool} ${!selectionDone ? s.barToolAlert : ""}`}
          onClick={() => setSheet("options")}
        >
          <SlidersHorizontal size={20} />
          <span>{selectionDone ? "Options" : "Size & color"}</span>
          {!selectionDone && <i className={s.barDot} />}
        </button>
        <button
          className={`${s.mobileBarBtn} ${!selectionDone ? s.mobileBarBtnIncomplete : ""}`}
          onClick={openEstimate}
          disabled={isCheckingOut}
        >
          {isCheckingOut
            ? "Adding…"
            : !selectionDone
              ? addLabel
              : unitPrice
                ? `Add to cart · ₹${total}`
                : "Add to cart"}
        </button>
      </div>

      {sheet && (
        <div className={s.sheet} role="dialog" aria-modal="true">
          <div className={s.sheetHead}>
            <h2 className={s.cardTitle}>
              {sheet === "text" && (
                <>
                  <Type size={18} /> Text
                </>
              )}
              {sheet === "image" && (
                <>
                  <ImageIcon size={18} /> Image
                </>
              )}
              {sheet === "options" && (
                <>
                  <SlidersHorizontal size={18} />{" "}
                  {selectionDone ? "Customize Options" : "Choose size & color"}
                </>
              )}
            </h2>
            <button className={s.sheetClose} aria-label="Close" onClick={() => setSheet(null)}>
              <X size={20} />
            </button>
          </div>

          <div className={s.sheetBody}>
            {sheet === "text" && (
              <>
                <button className={s.sheetAction} onClick={addText}>
                  <Type size={18} /> Add text
                </button>
                {selected?.type === "text" ? (
                  layerPanel
                ) : (
                  <p className={s.dockHint}>
                    Tap &ldquo;Add text&rdquo;, then change the wording, colour, size and rotation
                    here. Drag it on the garment to place it.
                  </p>
                )}
              </>
            )}

            {sheet === "image" && (
              <>
                <button className={s.sheetAction} onClick={() => fileRef.current?.click()}>
                  <ImageIcon size={18} /> Upload image
                </button>
                {selected?.type === "image" ? (
                  layerPanel
                ) : (
                  <p className={s.dockHint}>
                    Upload a picture, then change its size and rotation here. Drag it on the
                    garment to place it.
                  </p>
                )}
              </>
            )}

            {sheet === "options" && (
              <>
                {stepNotice}
                {optionFields}
                <div className={s.optionBlock}>
                  <div className={s.priceRow}>
                    <span className={s.priceLabel}>
                      {unitPrice ? `₹${unitPrice} × ${quantity}` : "Select size & color"}
                    </span>
                    <span className={s.priceValue}>{unitPrice ? `₹${total}` : "—"}</span>
                  </div>
                  <button
                    className={s.secondaryBtn}
                    onClick={() => {
                      setSheet(null);
                      setIsClearOpen(true);
                    }}
                  >
                    <Trash2 size={14} /> Clear design
                  </button>
                </div>
              </>
            )}
          </div>

          <div className={s.sheetFoot}>
            <button
              className={`${s.primaryBtn} ${
                sheet === "options" && !selectionDone ? s.primaryBtnIncomplete : ""
              }`}
              onClick={() => {
                if (sheet === "options" && !selectionDone) {
                  setInvalid(hasSize ? "color" : "size");
                  return;
                }
                setSheet(null);
              }}
            >
              <span className={s.primaryBtnText} style={{ textAlign: "center" }}>
                {sheet === "options" && !selectionDone ? addLabel : "Done"}
              </span>
            </button>
          </div>
        </div>
      )}

      {isEstimateOpen && (
        <CostEstimateModal
          onClose={() => setIsEstimateOpen(false)}
          onProceed={() => {
            setIsEstimateOpen(false);
            handleCheckout();
          }}
        />
      )}
      {isClearOpen && <ClearConfirmModal onClose={() => setIsClearOpen(false)} />}
    </div>
  );
}
