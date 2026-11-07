"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Box,
  Crop,
  Droplet,
  Hand,
  Image as ImageIcon,
  Info,
  Layers,
  PencilRuler,
  Shirt,
  ShoppingCart,
  SlidersHorizontal,
  Trash2,
  Type,
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
import GarmentThumb from "./GarmentThumb";
import { GARMENT_IMAGES } from "@/lib/design-studio/garmentImages";
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
    setApparelQuantity,
    setAvailableVariants,
    availableVariants,
  } = useDesignStore();

  const [mobilePane, setMobilePane] = useState<"design" | "preview">("design");
  const [showZone, setShowZone] = useState(true);
  const [isEstimateOpen, setIsEstimateOpen] = useState(false);
  const [isClearOpen, setIsClearOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

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
  useEffect(() => {
    const fetchVariants = async () => {
      try {
        const shirtType = categoryToShirtType[categoryId] || "HALF_SLEEVE";
        const data = await getCustomDesignTypesAPI(shirtType);
        if (data[shirtType]) setAvailableVariants(data[shirtType]);
      } catch (error) {
        console.error("Failed to fetch custom design types", error);
      }
    };
    fetchVariants();
  }, [categoryId, setAvailableVariants]);

  const uniqueSizes = Array.from(new Set(availableVariants.map((v) => v.size)));
  const colorsForSize = availableVariants.filter(
    (v) => v.size === project.apparelConfig.size,
  );
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

  const openEstimate = () => {
    calculatePricing();
    setIsEstimateOpen(true);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const garmentImage = GARMENT_IMAGES[spec.key]?.[view];
  const editorAspect = garmentImage
    ? garmentImage.width / garmentImage.height
    : frame.widthMm / frame.heightMm;

  return (
    <div className={s.page}>
      <div className={s.inner}>
        <div className={s.topBar}>
          <button className={s.backBtn} onClick={handleBack}>
            <ArrowLeft size={15} /> Back
          </button>
          <span className={s.studioPill}>Design Studio</span>
          <h1 className={s.title}>
            <span className={s.titleMark}>Customize {spec.label}</span>
          </h1>
          <p className={s.subtitle}>
            Place your design inside the dashed boundary — that is exactly what gets printed.
          </p>
        </div>

        <div className={s.main}>
          <nav className={s.viewTabs} aria-label="Garment side">
            {views.map((v) => {
              const count = (layers[v] ?? []).length;
              const TabIcon = v === "front" || v === "back" ? Shirt : Hand;
              return (
                <button
                  key={v}
                  className={`${s.viewTab} ${v === view ? s.viewTabActive : ""}`}
                  onClick={() => switchView(v)}
                >
                  <TabIcon size={22} />
                  <span>{VIEW_LABELS[v]}</span>
                  {count > 0 && <span className={s.viewTabBadge}>{count}</span>}
                </button>
              );
            })}
          </nav>

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
              className={`${s.card} ${s.pane} ${s.printCard} ${mobilePane !== "design" ? s.paneHiddenMobile : ""}`}
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
                  <input ref={fileRef} type="file" accept="image/*" hidden onChange={onUpload} />
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
              {selected ? (
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
              ) : (
                <p className={s.dockHint}>
                  Add text or upload an image, then tap it to change its size, colour and
                  rotation.
                </p>
              )}
              </div>
            </section>

            {/* 3D preview */}
            <section
              className={`${s.card} ${s.pane} ${s.previewCard} ${mobilePane !== "preview" ? s.paneHiddenMobile : ""}`}
            >
              <div className={s.cardHead}>
                <h2 className={s.cardTitle}>
                  <Box size={18} /> 3D Preview
                </h2>
                <label className={s.zoneToggle}>
                  <input
                    type="checkbox"
                    checked={showZone}
                    onChange={(e) => setShowZone(e.target.checked)}
                  />
                  Show boundary
                </label>
              </div>
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
              <div className={s.thumbRow}>
                {views.map((v) => (
                  <button
                    key={v}
                    title={VIEW_LABELS[v]}
                    aria-label={VIEW_LABELS[v]}
                    className={`${s.thumb} ${v === view ? s.thumbActive : ""}`}
                    onClick={() => switchView(v)}
                  >
                    <GarmentThumb image={GARMENT_IMAGES[spec.key]?.[v]} color={colorHex} />
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Options */}
          <aside className={`${s.card} ${s.optionsCard}`}>
            <h2 className={`${s.cardTitle} ${s.optionsTitle}`}>
              <SlidersHorizontal size={18} /> Customize Options
            </h2>
            <div className={s.optionBlock}>
              <span className={s.optionLabel}>
                <Shirt size={17} /> Size
              </span>
              <div className={s.sizeGrid}>
                {(uniqueSizes.length ? uniqueSizes : ["S", "M", "L", "XL"]).map((sz) => (
                  <button
                    key={sz}
                    className={`${s.sizeBtn} ${
                      project.apparelConfig.size === sz ? s.sizeBtnActive : ""
                    }`}
                    onClick={() => setApparelSize(sz)}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            <div className={s.optionBlock}>
              <span className={s.optionLabel}>
                <Droplet size={17} /> Color
              </span>
              {colorsForSize.length ? (
                <div className={s.swatchGrid}>
                  {colorsForSize.map((variant) => (
                    <button
                      key={variant.id}
                      title={`${variant.color}${variant.outOfStock ? " (Out of stock)" : ""}`}
                      aria-label={variant.color}
                      className={`${s.garmentSwatch} ${
                        project.apparelConfig.colorHex === variant.colorCode
                          ? s.garmentSwatchActive
                          : ""
                      } ${variant.outOfStock ? s.garmentSwatchOut : ""}`}
                      style={{ background: variant.colorCode }}
                      onClick={() => {
                        if (variant.outOfStock) {
                          showToast("This color is out of stock in the selected size.", "error");
                        } else {
                          changeApparelColor(variant.colorCode, variant.color);
                        }
                      }}
                    />
                  ))}
                </div>
              ) : (
                <p className={s.hint}>Select a size to see available colors.</p>
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

            <div className={s.optionBlock}>
              <div className={s.priceRow}>
                <span className={s.priceLabel}>
                  {unitPrice ? `₹${unitPrice} × ${quantity}` : "Select size & color"}
                </span>
                <span className={s.priceValue}>{unitPrice ? `₹${total}` : "—"}</span>
              </div>
              <button className={s.primaryBtn} onClick={openEstimate} disabled={isCheckingOut}>
                <ShoppingCart size={17} />
                <span className={s.primaryBtnText}>
                  {isCheckingOut ? "Adding to cart…" : "Add to cart"}
                </span>
                <ArrowRight size={18} />
              </button>
              <button className={s.secondaryBtn} onClick={() => setIsClearOpen(true)}>
                <Trash2 size={14} /> Clear design
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile sticky bar */}
      <div className={s.mobileBar}>
        <div className={s.mobileBarPrice}>
          <span className={s.priceLabel}>Total</span>
          <span className={s.priceValue}>{unitPrice ? `₹${total}` : "—"}</span>
        </div>
        <button className={s.mobileBarBtn} onClick={openEstimate} disabled={isCheckingOut}>
          <ShoppingCart size={16} />
          {isCheckingOut ? "Adding…" : "Add to cart"}
        </button>
      </div>

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
