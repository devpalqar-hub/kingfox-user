"use client";

import { useEffect, useState } from "react";
import {
  Type,
  Image as ImageIcon,
  Download,
  Settings2,
  Palette,
  Minus,
  Trash2,
  Box,
  Layers,
  X,
  RotateCcw,
  Maximize,
  Plus,
  Eye,
  Square,
  Bookmark,
  Lightbulb
} from "lucide-react";
import { useDesignStore } from "@/stores/design-studio/useDesignStore";
import { Layer, TextLayer, ImageLayer } from "@/types/design-studio";
import ThreeCanvas from "@/components/design-studio/canvas/ThreeCanvas";
import DesignEditor2D from "@/components/design-studio/editor/DesignEditor2D";
import LayerPanel from "@/components/design-studio/layers/LayerPanel";
import PropertiesPanel from "@/components/design-studio/properties/PropertiesPanel";
import CostEstimateModal from "@/components/design-studio/modals/CostEstimateModal";
import ClearConfirmModal from "@/components/design-studio/modals/ClearConfirmModal";
import styles from "./page.module.css";

export default function Workspace({ params }: { params: { id: string } }) {
  const {
    project,
    activeView,
    selectedLayerId,
    switchView,
    addLayer,
    updateLayer,
    selectLayer,
    calculatePricing,
    changeApparelColor,
    removeLayer,
  } = useDesignStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isMobile3DOpen, setIsMobile3DOpen] = useState(false);
  
  const [activeMobileTab, setActiveMobileTab] = useState<
    "color" | "elements" | "size" | "layers"
  >("color");
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [rightPropsLayerId, setRightPropsLayerId] = useState<string | null>(
    null,
  );

  const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
  const currentLayers = project.designs[activeView] || [];

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
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
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

  const renderColorSection = () => (
    <div className={styles.sectionBlock}>
      <h3 className={styles.sectionTitle}>
        <span className={styles.sectionNumber}>1</span> CHOOSE COLOR
      </h3>
      <p className={styles.sectionDesc}>Select a base color for your garment.</p>
      <div className={styles.colorGrid}>
        {[
          "#FFFFFF",
          "#000000",
          "#9CA3AF",
          "#D1D5DB",
          "#EF4444",
          "#F59E0B",
          "#10B981",
          "#3B82F6",
          "#8B5CF6",
          "#EC4899",
          "#14B8A6",
        ].map((hex) => (
          <div
            key={hex}
            className={`${styles.colorSwatch} ${project.apparelConfig.colorHex === hex ? styles.active : ""}`}
            onClick={() => changeApparelColor(hex, hex)}
            style={{ backgroundColor: hex }}
            title={hex}
          />
        ))}
        <div className={`${styles.colorSwatch} ${styles.addMore}`}>+</div>
      </div>
    </div>
  );

  const renderElementsSection = () => (
    <div className={styles.sectionBlock}>
      <h3 className={styles.sectionTitle}>
        <span className={styles.sectionNumber}>2</span> ADD ELEMENTS
      </h3>
      <p className={styles.sectionDesc}>Add text, artwork or lines to personalize your design.</p>
      <div className={styles.elementsGrid}>
        <label className={styles.elementBtn}>
          <ImageIcon size={20} /> Upload Image (Decal)
          <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
        </label>
        <button className={styles.elementBtn} onClick={handleAddText}>
          <Type size={20} /> Add Text
        </button>
        <button className={styles.elementBtn} onClick={handleAddLine}>
          <Minus size={20} /> Add Line
        </button>
      </div>
    </div>
  );

  const renderSizeSection = () => (
    <div className={styles.sectionBlock}>
      <h3 className={styles.sectionTitle}>
        <span className={styles.sectionNumber}>3</span> SIZE
      </h3>
      <p className={styles.sectionDesc}>Choose the size you want to preview.</p>
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

  const renderLayersSection = () => (
    <div className={styles.sectionBlock} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <h3 className={styles.sectionTitle}>
        <span className={styles.sectionNumber}>4</span> LAYERS ({currentLayers.length})
      </h3>
      <p className={styles.sectionDesc}>Manage and arrange your design layers.</p>
      {currentLayers.length === 0 ? (
        <div className={styles.layersEmpty}>
          <Layers size={24} />
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

  const renderActionButtons = () => (
    <div className={styles.actionRow}>
      <button className={styles.btnSecondary} onClick={() => setIsClearModalOpen(true)}>
        <Trash2 size={18} /> Clear Canvas
      </button>
    </div>
  );

  return (
    <div className={styles.workspaceContainer}>
      
      {/* Mobile Top Navigation */}
      <div className={styles.mobileTopNav}>
        <div className={styles.viewSwitcher} style={{ margin: 0 }}>
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
        <div className={styles.canvasTools} style={{ boxShadow: "none" }}>
          <button className={styles.iconBtn} aria-label="Reset" onClick={() => setIsClearModalOpen(true)}>
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Left Sidebar - Tools (Desktop) */}
      <aside className={styles.sidebar}>
        {renderColorSection()}
        {renderElementsSection()}
        {renderSizeSection()}
        {renderLayersSection()}
        {renderActionButtons()}
      </aside>

      {/* Main Canvas Area */}
      <main className={styles.canvasArea} onClick={() => selectLayer(null)}>
        {/* Top Canvas Header (Desktop) */}
        <div className={styles.canvasHeader}>
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
          <div className={styles.canvasTools}>
            <button className={styles.iconBtn} aria-label="Reset" onClick={() => setIsClearModalOpen(true)}>
              <RotateCcw size={18} />
            </button>
          </div>
        </div>

        {/* Main Editor Area (2D Editor) */}
        <div className={styles.mainEditor}>
          <DesignEditor2D />
        </div>

        {/* Mobile View 3D Button */}
        <button className={styles.mobile3dToggle} onClick={() => setIsMobile3DOpen(true)}>
          <Box size={18} /> View 3D
        </button>

        {/* Tips section (Desktop) */}
        {/* <div className={styles.tipsSection}>
           <h4 className={styles.tipsTitle}><Lightbulb size={16} color="#F59E0B" /> TIPS</h4>
           <p className={styles.tipsDesc}>Use high resolution images for the best print quality. We recommend PNG files with transparent background.</p>
        </div> */}
      </main>

      {/* Right Sidebar - Preview (Desktop) */}
      <aside className={styles.rightSidebar}>
        <div className={styles.sectionBlock} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <h3 className={styles.sectionTitle} style={{ marginBottom: "16px", textTransform: 'uppercase', letterSpacing: '0.5px' }}>
             DESIGN PREVIEW
          </h3>
          <p className={styles.sectionDesc}>See how your design will look.</p>

          <div className={styles.previewBox}>
            <ThreeCanvas />
          </div>

          <div className={styles.modelInfo}>
            model: /shirt_baked.glb | nodes:true materials:true
          </div>

          <button
            className={styles.btnPrimary}
            style={{ width: "100%", marginTop: "auto" }}
            onClick={() => {
              calculatePricing();
              setIsModalOpen(true);
            }}
          >
            <Eye size={18} /> Preview Full Design
          </button>
        </div>
      </aside>

      {/* Mobile Content Area (Tab Views) */}
      <div className={styles.mobileContentArea}>
        <div className={styles.mobileSectionCard}>
          {activeMobileTab === "color" && renderColorSection()}
          {activeMobileTab === "elements" && renderElementsSection()}
          {activeMobileTab === "size" && renderSizeSection()}
          {activeMobileTab === "layers" && (
            <>
              {renderLayersSection()}
              {rightPropsLayerId && (
                <div style={{ marginTop: "24px", borderTop: "1px solid #eaeaea", paddingTop: "20px" }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                     <h4 style={{ margin: 0 }}>Layer Properties</h4>
                     <button className={styles.rightPropsClose} onClick={() => setRightPropsLayerId(null)}>Close</button>
                  </div>
                  <PropertiesPanel />
                </div>
              )}
            </>
          )}
        </div>
        <div className={styles.mobileActions}>
          <button className={styles.btnSecondary} onClick={() => setIsClearModalOpen(true)}>
            <Trash2 size={18} /> Clear
          </button>
          <button className={styles.btnPrimary} onClick={() => setIsModalOpen(true)}>
            <Eye size={18} /> Preview
          </button>
        </div>
      </div>

      {/* Mobile Bottom Bar (Tabs) */}
      <div className={styles.mobileBottomBar}>
        <button
          className={`${styles.mobileTab} ${activeMobileTab === "color" ? styles.active : ""}`}
          onClick={() => setActiveMobileTab("color")}
        >
          <span className={styles.mobileTabIcon}>
            <Palette size={20} />
          </span>
          <span className={styles.mobileTabLabel}>Color</span>
        </button>
        <button
          className={`${styles.mobileTab} ${activeMobileTab === "elements" ? styles.active : ""}`}
          onClick={() => setActiveMobileTab("elements")}
        >
          <span className={styles.mobileTabIcon}>
            <Plus size={20} />
          </span>
          <span className={styles.mobileTabLabel}>Elements</span>
        </button>
        <button
          className={`${styles.mobileTab} ${activeMobileTab === "size" ? styles.active : ""}`}
          onClick={() => setActiveMobileTab("size")}
        >
          <span className={styles.mobileTabIcon}>
            <Box size={20} />
          </span>
          <span className={styles.mobileTabLabel}>Size</span>
        </button>
        <button
          className={`${styles.mobileTab} ${activeMobileTab === "layers" ? styles.active : ""}`}
          onClick={() => setActiveMobileTab("layers")}
        >
          <span className={styles.mobileTabIcon}>
            <Layers size={20} />
          </span>
          <span className={styles.mobileTabLabel}>Layers</span>
        </button>
      </div>

      {/* Properties Drawer for Desktop (Shows when layer selected) */}
      {rightPropsLayerId && (
        <aside className={styles.rightPropsPanel} onClick={(e) => e.stopPropagation()}>
          <div className={styles.rightPropsHeader}>
            <h3>Layer Properties</h3>
            <button className={styles.rightPropsClose} onClick={() => setRightPropsLayerId(null)}>
              Close
            </button>
          </div>
          <div className={styles.rightPropsContent}>
            <PropertiesPanel />
          </div>
        </aside>
      )}

      {/* Mobile 3D Modal */}
      {isMobile3DOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.viewSwitcher} style={{ position: 'absolute', top: '20px', zIndex: 2020 }}>
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
          <button className={styles.closeModalBtn} onClick={() => setIsMobile3DOpen(false)}>
            <X size={24} />
          </button>
          <div className={styles.modalContent}>
            <ThreeCanvas />
          </div>
        </div>
      )}

      {/* Modals */}
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
