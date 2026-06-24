"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Type,
  Image as ImageIcon,
  Palette,
  Minus,
  Trash2,
  Box,
  Layers,
  X,
  RotateCcw,
  Plus,
  Eye,
} from "lucide-react";
import { useDesignStore } from "@/stores/design-studio/useDesignStore";
import { TextLayer, ImageLayer } from "@/types/design-studio";
import ThreeCanvas from "@/components/design-studio/canvas/ThreeCanvas";
import DesignEditor2D from "@/components/design-studio/editor/DesignEditor2D";
import LayerPanel from "@/components/design-studio/layers/LayerPanel";
import PropertiesPanel from "@/components/design-studio/properties/PropertiesPanel";
import CostEstimateModal from "@/components/design-studio/modals/CostEstimateModal";
import ClearConfirmModal from "@/components/design-studio/modals/ClearConfirmModal";
import styles from "./page.module.css";
import { getCustomDesignTypesAPI, uploadImagesAPI, addToCustomCartAPI } from "@/services/custom-design.service";
import { useToast } from "@/context/ToastContext";
import { ArrowLeft } from "lucide-react";

const categoryToShirtType: Record<string, string> = {
  'oversized-tee': 'OVERSIZED',
  'classic-hoodie': 'HOODIE',
  'crewneck-sweatshirt': 'HALF_SLEEVE',
  'long-sleeve-tee': 'FULL_SLEEVE',
  'polo-Tshirt': 'POLO'
};

export default function Workspace({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { showToast } = useToast();

  // ─── Store ────────────────────────────────────────────────────────────────
  const {
    project,
    activeView,
    selectedLayerId,
    switchView,
    addLayer,
    selectLayer,
    calculatePricing,
    changeApparelColor,
    setApparelSize,
    setAvailableVariants,
    availableVariants,
    removeLayer,
    setApparelQuantity,
  } = useDesignStore();

  // ─── Local State ──────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isMobile3DOpen, setIsMobile3DOpen] = useState(false);

  // Force a resize event after the mobile drawer slides in to wake up the WebGL Canvas
  useEffect(() => {
    if (isMobile3DOpen) {
      const timer = setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 350); // wait for 0.35s CSS transition
      return () => clearTimeout(timer);
    }
  }, [isMobile3DOpen]);
  const [activeMobileTab, setActiveMobileTab] = useState<
    "size" | "color" | "elements" | "layers"
  >("size");
  const [rightPropsLayerId, setRightPropsLayerId] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const currentLayers = project.designs[activeView] || [];

  // ─── Fetch Variants ───────────────────────────────────────────────────────
  useEffect(() => {
    const fetchVariants = async () => {
      try {
        const shirtType = categoryToShirtType[project.apparelConfig.categoryId] || 'HOODIE';
        const data = await getCustomDesignTypesAPI(shirtType);
        if (data[shirtType]) {
          setAvailableVariants(data[shirtType]);
        }
      } catch (error) {
        console.error("Failed to fetch custom design types", error);
      }
    };
    fetchVariants();
  }, [project.apparelConfig.categoryId]);

  const uniqueSizes = Array.from(new Set(availableVariants.map(v => v.size)));
  const availableColorsForSize = availableVariants.filter(v => v.size === project.apparelConfig.size);

  // ─── Layer Handlers ───────────────────────────────────────────────────────

  const handleAddText = () => {
    const newTextLayer: TextLayer = {
      id: `text_${Date.now()}`,
      type: "text",
      name: "Text Layer",
      text: "KINGFOX",
      fontFamily: "Inter",
      fontSize: 100,
      fontWeight: 700,
      letterSpacing: 0,
      colorHex: "#000000",
      textAlign: "center",
      x: 150,
      y: 200,
      width: 200,
      height: 50,
      rotation: 0,
      zIndex: currentLayers.length + 1,
      isLocked: false,
      isVisible: true,
      opacity: 1,
    };
    addLayer(newTextLayer);
  };

  const handleBack = () => {
    useDesignStore.getState().clearAll();
    router.push("/design-studio/select");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const dataUrl = evt.target?.result as string;
        const newImageLayer: ImageLayer = {
          id: `img_${Date.now()}`,
          type: "image",
          name: file.name || "Image Layer",
          asset: {
            assetId: "local",
            originalUrl: dataUrl,
            thumbnailUrl: dataUrl,
            mimeType: file.type,
          },
          x: 175,
          y: 200,
          width: 150,
          height: 150,
          rotation: 0,
          zIndex: currentLayers.length + 1,
          isLocked: false,
          isVisible: true,
          opacity: 1,
        };
        addLayer(newImageLayer);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddLine = () => {
    const newLineLayer: import("@/types/design-studio").LineLayer = {
      id: `line_${Date.now()}`,
      type: "line",
      name: "Line Layer",
      thickness: 5,
      colorHex: "#000000",
      x: 150,
      y: 250,
      width: 200,
      height: 20,
      rotation: 0,
      zIndex: currentLayers.length + 1,
      isLocked: false,
      isVisible: true,
      opacity: 1,
    };
    addLayer(newLineLayer);
  };

  // ─── Checkout Flow ────────────────────────────────────────────────────────
  const captureScreenshot = (): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const canvas = document.querySelector('canvas');
        if (canvas) {
          resolve(canvas.toDataURL('image/png'));
        } else {
          resolve('');
        }
      }, 500); // give time for threejs to render
    });
  };

  const handleCheckout = async () => {
    try {
      setIsCheckingOut(true);

      // 0. Check authentication
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        showToast("Please log in before checking out.", "error");
        setIsCheckingOut(false);
        return;
      }

      // 1. Check variant selection
      const variantId = project.apparelConfig.customDesignVariantId;
      if (!variantId) {
        showToast("Please select a valid size and color combination.", "error");
        setIsCheckingOut(false);
        return;
      }

      showToast("Preparing your custom design...", "info");

      // 2. Capture Front
      switchView("front");
      const frontDataUrl = await captureScreenshot();

      // 3. Capture Back
      switchView("back");
      const backDataUrl = await captureScreenshot();

      if (!frontDataUrl || !backDataUrl) {
        showToast("Failed to capture design images.", "error");
        setIsCheckingOut(false);
        return;
      }

      // Convert data URL to File
      const dataURLtoFile = (dataurl: string, filename: string) => {
        const arr = dataurl.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'image/png';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
      };

      const frontFile = dataURLtoFile(frontDataUrl, 'front.png');
      const backFile = dataURLtoFile(backDataUrl, 'back.png');

      const allImageLayers = [
        ...project.designs.front.filter(l => l.type === 'image'),
        ...project.designs.back.filter(l => l.type === 'image'),
        ...(project.designs.sleeve ? project.designs.sleeve.filter(l => l.type === 'image') : [])
      ] as ImageLayer[];

      const allTextLayers = [
        ...project.designs.front.filter(l => l.type === 'text'),
        ...project.designs.back.filter(l => l.type === 'text'),
        ...(project.designs.sleeve ? project.designs.sleeve.filter(l => l.type === 'text') : [])
      ] as TextLayer[];

      const stickerText = allTextLayers.map(l => l.text).join(' | ');

      const filesToUpload: File[] = [frontFile, backFile];
      allImageLayers.forEach((layer, idx) => {
        if (layer.asset?.originalUrl?.startsWith('data:image')) {
          filesToUpload.push(dataURLtoFile(layer.asset.originalUrl, `asset_${idx}.png`));
        }
      });

      // 4. Upload images
      let urls: string[];
      try {
        const uploadResult = await uploadImagesAPI(filesToUpload);
        urls = uploadResult.urls;
      } catch (uploadErr: any) {
        console.error("Image upload failed:", uploadErr);
        const status = uploadErr?.response?.status;
        if (status === 401 || status === 403) {
          showToast("Session expired. Please log in again.", "error");
        } else {
          showToast("Image upload failed. Please try again.", "error");
        }
        setIsCheckingOut(false);
        return;
      }

      if (!urls || urls.length < 2) {
        showToast("Image upload returned incomplete data.", "error");
        setIsCheckingOut(false);
        return;
      }

      const uploadedFrontUrl = urls[0];
      const uploadedBackUrl = urls[1];
      const assetImageUrls = urls.slice(2);

      // 5. Add to cart
      try {
        await addToCustomCartAPI({
          customDesignVariantId: variantId,
          quantity: project.apparelConfig.quantity,
          frontImageUrl: uploadedFrontUrl,
          backImageUrl: uploadedBackUrl,
          stickerText: stickerText || undefined,
          assetImageUrls: assetImageUrls.length > 0 ? assetImageUrls : undefined,
        });
      } catch (cartErr: any) {
        console.error("Add to cart failed:", cartErr);
        const status = cartErr?.response?.status;
        if (status === 401 || status === 403) {
          showToast("Session expired. Please log in again.", "error");
        } else {
          showToast("Failed to add to cart. Please try again.", "error");
        }
        setIsCheckingOut(false);
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

  // ─── Section Renderers ────────────────────────────────────────────────────

  /**
   * Step 1 — SIZE
   * Size is first so that in the future the API can filter available
   * colors by the selected size.
   */
  const renderSizeSection = () => (
    <div className={styles.sectionBlock}>
      <h3 className={styles.sectionTitle}>
        <span className={styles.sectionNumber}>1</span> SIZE & QUANTITY
      </h3>
      <p className={styles.sectionDesc}>
        Choose your size and how many you'd like to order.
      </p>

      <div style={{ marginBottom: "16px" }}>
        <span style={{ display: "block", marginBottom: "8px", fontSize: "12px", fontWeight: 600, color: "#888" }}>SIZE</span>
        <div className={styles.sizeGrid}>
          {(uniqueSizes.length > 0 ? uniqueSizes : ["XS", "S", "M", "L", "XL", "XXL"]).map((s) => (
            <button
              key={s}
              className={`${styles.sizeBtn} ${project.apparelConfig.size === s ? styles.active : ""}`}
              onClick={() => setApparelSize(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span style={{ display: "block", marginBottom: "8px", fontSize: "12px", fontWeight: 600, color: "#888" }}>QUANTITY</span>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            style={{ width: "36px", height: "36px", border: "1px solid #333", background: "transparent", color: "#030303ff", borderRadius: "4px", cursor: "pointer" }}
            onClick={() => setApparelQuantity(Math.max(1, (project.apparelConfig.quantity || 1) - 1))}
          >
            -
          </button>
          <span style={{ color: "#000000ff", width: "24px", textAlign: "center", fontWeight: "bold" }}>
            {project.apparelConfig.quantity || 1}
          </span>
          <button
            style={{ width: "36px", height: "36px", border: "1px solid #333", background: "transparent", color: "#0c0c0cff", borderRadius: "4px", cursor: "pointer" }}
            onClick={() => setApparelQuantity((project.apparelConfig.quantity || 1) + 1)}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );

  /**
   * Step 2 — COLOR
   * Colors shown here will be filtered by selected size via API in the future.
   */
  const renderColorSection = () => (
    <div className={styles.sectionBlock}>
      <h3 className={styles.sectionTitle}>
        <span className={styles.sectionNumber}>2</span> COLOR
      </h3>
      <p className={styles.sectionDesc}>
        Select a base color for your garment.
      </p>
      <div className={styles.colorGrid}>
        {availableColorsForSize.map((variant) => (
          <div
            key={variant.colorCode}
            className={`${styles.colorSwatch} ${project.apparelConfig.colorHex === variant.colorCode ? styles.active : ""} ${variant.outOfStock ? styles.outOfStock : ""}`}
            onClick={() => {
              if (!variant.outOfStock) {
                changeApparelColor(variant.colorCode, variant.color);
              } else {
                showToast("This color is out of stock in the selected size.", "error");
              }
            }}
            style={{ backgroundColor: variant.colorCode, opacity: variant.outOfStock ? 0.3 : 1, cursor: variant.outOfStock ? 'not-allowed' : 'pointer' }}
            title={`${variant.color} ${variant.outOfStock ? '(Out of Stock)' : ''}`}
          />
        ))}
      </div>
    </div>
  );

  /**
   * Step 3 — ADD ELEMENTS
   * Upload image decals, add text, or add lines.
   */
  const renderElementsSection = () => (
    <div className={styles.sectionBlock}>
      <h3 className={styles.sectionTitle}>
        <span className={styles.sectionNumber}>3</span> ADD ELEMENTS
      </h3>
      <p className={styles.sectionDesc}>
        Add text, artwork or lines to personalize your design.
      </p>
      <div className={styles.elementsGrid}>
        <label className={styles.elementBtn}>
          <ImageIcon size={18} />
          <span>Upload Image (Decal)</span>
          <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
        </label>
        <button className={styles.elementBtn} onClick={handleAddText}>
          <Type size={18} />
          <span>Add Text</span>
        </button>
        <button className={styles.elementBtn} onClick={handleAddLine}>
          <Minus size={18} />
          <span>Add Line</span>
        </button>
      </div>
    </div>
  );

  /**
   * Step 4 — LAYERS
   * Manage, reorder, and control visibility of design layers.
   */
  const renderLayersSection = () => (
    <div className={styles.sectionBlock}>
      <h3 className={styles.sectionTitle}>
        <span className={styles.sectionNumber}>4</span> LAYERS
        <span className={styles.sectionCount}>{currentLayers.length}</span>
      </h3>
      <p className={styles.sectionDesc}>Manage and arrange your design layers.</p>
      {currentLayers.length === 0 ? (
        <div className={styles.layersEmpty}>
          <Layers size={22} />
          <span>No layers added yet.</span>
        </div>
      ) : (
        <LayerPanel
          onOpenProperties={(id: string) => {
            selectLayer(id);
            setRightPropsLayerId(id);
          }}
        />
      )}
    </div>
  );

  /** Action buttons: Clear Canvas + Preview Full Design */
  const renderActionButtons = () => (
    <div className={styles.actionRow}>
      <button
        className={styles.btnSecondary}
        onClick={() => setIsClearModalOpen(true)}
      >
        <Trash2 size={16} /> Clear Canvas
      </button>
      <button
        className={styles.btnPrimary}
        onClick={() => {
          calculatePricing();
          setIsModalOpen(true);
        }}
      >
        <Eye size={16} /> Preview Full Design
      </button>
    </div>
  );

  /**
   * Front / Back view switcher.
   * Controls both the 2D canvas active face and the 3D model rotation.
   */
  const renderViewSwitcher = () => (
    <div className={styles.viewSwitcher}>
      <button
        className={`${styles.viewBtn} ${activeView === "front" ? styles.active : ""}`}
        onClick={() => switchView("front")}
      >
        Front
      </button>
      <button
        className={`${styles.viewBtn} ${activeView === "back" ? styles.active : ""}`}
        onClick={() => switchView("back")}
      >
        Back
      </button>
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className={styles.workspaceContainer}>

      {/*
       * ══════════════════════════════════════════════════════════════════
       * MOBILE TOP NAV  (hidden on desktop)
       * Front/Back toggle + Reset — sits above the 2D canvas on mobile.
       * ══════════════════════════════════════════════════════════════════
       */}
      <div className={styles.mobileTopNav}>
        <button
          className={styles.mobileBackButton}
          onClick={handleBack}
        >
          <ArrowLeft size={16} />
        </button>
        {renderViewSwitcher()}
        <button
          className={styles.iconBtn}
          aria-label="Reset canvas"
          onClick={() => setIsClearModalOpen(true)}
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/*
       * ══════════════════════════════════════════════════════════════════
       * 3D CANVAS AREA  (desktop center — 60%; hidden on mobile)
       * ══════════════════════════════════════════════════════════════════
       */}
      {/* LEFT SIDEBAR */}
      <aside className={styles.leftSidebar}>
        <button
          className={styles.backButton}
          onClick={handleBack}
        >
          <ArrowLeft size={18} className={styles.backButtonIcon} />
          Back to Apparel Selection
        </button>

        {renderSizeSection()}
        {renderColorSection()}
        {renderElementsSection()}
        {renderLayersSection()}
      </aside>

      {/* CENTER - 3D PREVIEW */}
      <div className={styles.threeArea}>
        <div className={styles.threeAreaHeader}>
          {renderViewSwitcher()}

          <button
            className={styles.iconBtn}
            onClick={() => setIsClearModalOpen(true)}
          >
            <RotateCcw size={16} />
          </button>
        </div>

        <ThreeCanvas />
      </div>

      {/* RIGHT - 2D PREVIEW */}
      <div
        className={styles.rightPanel}
        onClick={() => selectLayer(null)}
      >
        <div
          className={styles.twoDSection}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.twoDHeader}>
            <span className={styles.twoDLabel}>
              Design Preview
            </span>
          </div>

          <div className={styles.twoDCanvasArea}>

            <button
              className={styles.mobile3dToggle}
              onClick={() => setIsMobile3DOpen(true)}
              aria-label="Open 3D view"
            >
              <Box size={15} />
              3D
            </button>

            <div className={styles.twoDEditorScaler}>
              <DesignEditor2D />
            </div>
          </div>
        </div>

        <div className={styles.estimateSection}>
          <button
            className={styles.btnPrimary}
            onClick={() => {
              calculatePricing();
              setIsModalOpen(true);
            }}
          >
            Estimate Cost
          </button>
        </div>

        {/*
         * ══════════════════════════════════════════════════════════════════
         * PROPERTIES PANEL  (desktop: bottom of right panel; mobile: inline)
         * ══════════════════════════════════════════════════════════════════
         */}
        {rightPropsLayerId && (
          <aside
            className={styles.rightPropsPanel}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.rightPropsHeader}>
              <h3>Layer Properties</h3>
              <button
                className={styles.rightPropsClose}
                onClick={() => setRightPropsLayerId(null)}
              >
                Close
              </button>
            </div>
            <div className={styles.rightPropsContent}>
              <PropertiesPanel />
            </div>
          </aside>
        )}
      </div>

      {/*
       * ══════════════════════════════════════════════════════════════════
       * MOBILE CONTENT AREA  (hidden on desktop)
       * Tab-switched tool sections below the 2D canvas on mobile.
       * ══════════════════════════════════════════════════════════════════
       */}
      <div className={styles.mobileContentArea}>
        <div className={styles.mobileSectionCard}>
          {activeMobileTab === "size" && renderSizeSection()}
          {activeMobileTab === "color" && renderColorSection()}
          {activeMobileTab === "elements" && renderElementsSection()}
          {activeMobileTab === "layers" && (
            <>
              {renderLayersSection()}
              {rightPropsLayerId && (
                <div className={styles.mobilePropsInline}>
                  <div className={styles.mobilePropsHeader}>
                    <h4 className={styles.mobilePropsTitle}>Layer Properties</h4>
                    <button
                      className={styles.rightPropsClose}
                      onClick={() => setRightPropsLayerId(null)}
                    >
                      Close
                    </button>
                  </div>
                  <PropertiesPanel />
                </div>
              )}
            </>
          )}
        </div>

        <div className={styles.mobileActions}>
          <button
            className={styles.btnSecondary}
            onClick={() => setIsClearModalOpen(true)}
          >
            <Trash2 size={16} /> Clear
          </button>
          <button
            className={styles.btnPrimary}
            onClick={() => {
              calculatePricing();
              setIsModalOpen(true);
            }}
          >
            <Eye size={16} /> Preview
          </button>
        </div>
      </div>

      {/*
       * ══════════════════════════════════════════════════════════════════
       * MOBILE BOTTOM TAB BAR  (hidden on desktop; position: fixed)
       * Order: Size → Color → Elements → Layers (matches step numbering)
       * ══════════════════════════════════════════════════════════════════
       */}
      <nav className={styles.mobileBottomBar} aria-label="Design steps">
        {(
          [
            { id: "size", label: "Size", Icon: Box },
            { id: "color", label: "Color", Icon: Palette },
            { id: "elements", label: "Elements", Icon: Plus },
            { id: "layers", label: "Layers", Icon: Layers },
          ] as const
        ).map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`${styles.mobileTab} ${activeMobileTab === id ? styles.active : ""}`}
            onClick={() => setActiveMobileTab(id)}
            aria-label={label}
          >
            <span className={styles.mobileTabIcon}>
              <Icon size={19} />
            </span>
            <span className={styles.mobileTabLabel}>{label}</span>
          </button>
        ))}
      </nav>

      {/*
       * ══════════════════════════════════════════════════════════════════
       * MOBILE 3D DRAWER  (hidden on desktop)
       *
       * Backdrop: 25% left — tap to close.
       * Drawer:   slides from right, 75% screen width.
       * ThreeCanvas mounted only while open (avoids idle GPU cost).
       * ══════════════════════════════════════════════════════════════════
       */}
      <div
        className={`${styles.drawerBackdrop} ${isMobile3DOpen ? styles.open : ""}`}
        onClick={() => setIsMobile3DOpen(false)}
        aria-hidden="true"
      />

      <div
        className={`${styles.mobile3dDrawer} ${isMobile3DOpen ? styles.open : ""}`}
        aria-label="3D Preview"
        aria-modal="true"
        role="dialog"
      >
        <div className={styles.drawerHeader}>
          <div>
            <h3 className={styles.drawerTitle}>3D Preview</h3>
            <p className={styles.drawerSubtitle}>Drag to rotate and inspect your design.</p>
          </div>
          <button
            className={styles.drawerCloseBtn}
            onClick={() => setIsMobile3DOpen(false)}
            aria-label="Close 3D view"
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.drawerCanvas}>
          {isMobile3DOpen && <ThreeCanvas />}
        </div>

        <div className={styles.drawerViewSwitcher}>
          {renderViewSwitcher()}
        </div>
      </div>

      {/*
       * ══════════════════════════════════════════════════════════════════
       * MODALS
       * ══════════════════════════════════════════════════════════════════
       */}
      {isModalOpen && (
        <CostEstimateModal
          onClose={() => setIsModalOpen(false)}
          onProceed={() => {
            setIsModalOpen(false);
            handleCheckout();
          }}
        />
      )}

      {isClearModalOpen && (
        <ClearConfirmModal onClose={() => setIsClearModalOpen(false)} />
      )}
    </div>
  );
}