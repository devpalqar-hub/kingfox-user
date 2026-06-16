"use client";

import { useState } from "react";
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

export default function Workspace({ params }: { params: { id: string } }) {
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
    removeLayer,
  } = useDesignStore();

  // ─── Local State ──────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isMobile3DOpen, setIsMobile3DOpen] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<
    "size" | "color" | "elements" | "layers"
  >("size");
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [rightPropsLayerId, setRightPropsLayerId] = useState<string | null>(null);

  const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
  const currentLayers = project.designs[activeView] || [];

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

  // ─── Section Renderers ────────────────────────────────────────────────────

  /**
   * Step 1 — SIZE
   * Size is first so that in the future the API can filter available
   * colors by the selected size.
   */
  const renderSizeSection = () => (
    <div className={styles.sectionBlock}>
      <h3 className={styles.sectionTitle}>
        <span className={styles.sectionNumber}>1</span> SIZE
      </h3>
      <p className={styles.sectionDesc}>
        Choose a size — available colors will update based on your selection.
      </p>
      <div className={styles.sizeGrid}>
        {SIZES.map((s) => (
          <button
            key={s}
            className={`${styles.sizeBtn} ${selectedSize === s ? styles.active : ""}`}
            onClick={() => setSelectedSize(s)}
          >
            {s}
          </button>
        ))}
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
        {[
          "#FFFFFF", "#000000", "#9CA3AF", "#D1D5DB",
          "#EF4444", "#F59E0B", "#EAB308", "#10B981",
          "#3B82F6", "#8B5CF6", "#EC4899", "#14B8A6",
        ].map((hex) => (
          <div
            key={hex}
            className={`${styles.colorSwatch} ${project.apparelConfig.colorHex === hex ? styles.active : ""
              }`}
            onClick={() => changeApparelColor(hex, hex)}
            style={{ backgroundColor: hex }}
            title={hex}
          />
        ))}
        <div className={`${styles.colorSwatch} ${styles.addMore}`}>
          <Plus size={14} />
        </div>
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
       * PROPERTIES PANEL  (desktop: floating popup; mobile: inline above)
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

      {/*
       * ══════════════════════════════════════════════════════════════════
       * MODALS
       * ══════════════════════════════════════════════════════════════════
       */}
      {isModalOpen && (
        <CostEstimateModal
          onClose={() => setIsModalOpen(false)}
          onProceed={() => {
            alert("Proceeding to checkout...");
            setIsModalOpen(false);
          }}
        />
      )}

      {isClearModalOpen && (
        <ClearConfirmModal onClose={() => setIsClearModalOpen(false)} />
      )}
    </div>
  );
}