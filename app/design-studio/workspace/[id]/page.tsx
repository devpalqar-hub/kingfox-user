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
  Sliders,
  X,
  Wrench,
  ShoppingCart,
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
  const [activeMobileTab, setActiveMobileTab] = useState<
    "tools" | "layers" | "properties" | null
  >(null);
  const [isMobile3DOpen, setIsMobile3DOpen] = useState(false);
  const [rightPropsLayerId, setRightPropsLayerId] = useState<string | null>(
    null,
  );

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
      colorHex: "#ffffff",
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
      colorHex: "#ffffff",
      x: 150,
      y: 250,
      width: 200,
      height: 20, // Rnd container height, visually driven by thickness
      rotation: 0,
      zIndex: currentLayers.length + 1,
      isLocked: false,
      isVisible: true,
      opacity: 1,
    };
    addLayer(newLineLayer);
  };

  return (
    <div className={styles.workspaceContainer}>
      {/* Left Sidebar - Tools */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Tools</h2>
          <Settings2 size={20} />
        </div>
        <div className={styles.toolsPanel}>
          <div className={styles.toolSection}>
            <h3 className={styles.toolSectionTitle}>Apparel Color</h3>
            <p className={styles.toolDesc}>
              Quickly pick a base color for the garment. Click a swatch to apply
              immediately.
            </p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {[
                "#000000",
                "#FFFFFF",
                "#FF0000",
                "#00FF00",
                "#0000FF",
                "#FFFF00",
                "#EF4444",
                "#3B82F6",
                "#10B981",
              ].map((hex) => (
                <div
                  key={hex}
                  onClick={() => changeApparelColor(hex, hex)}
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    backgroundColor: hex,
                    cursor: "pointer",
                    border:
                      project.apparelConfig.colorHex === hex
                        ? "2px solid #fff"
                        : "1px solid #333",
                  }}
                />
              ))}
            </div>
          </div>
          <div className={styles.toolSection}>
            <h3 className={styles.toolSectionTitle}>Add Elements</h3>
            <p className={styles.toolDesc}>
              Add artwork, text, or simple shapes. Use the image upload to add
              decals.
            </p>
            <label className={styles.toolButton}>
              <ImageIcon size={18} /> Upload Image (Decal)
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
            <button className={styles.toolButton} onClick={handleAddText}>
              <Type size={18} /> Add Text
            </button>
            <button className={styles.toolButton} onClick={handleAddLine}>
              <Minus size={18} /> Add Line
            </button>
          </div>

          <div className={styles.toolSection} style={{ marginTop: "auto" }}>
            <p className={styles.toolDesc}>
              Reset the canvas to start over. This will remove all layers for
              the current view.
            </p>
            <button
              className={styles.toolButton}
              onClick={() => setIsClearModalOpen(true)}
              style={{
                color: "#ef4444",
                borderColor: "#331111",
                backgroundColor: "#1a0505",
              }}
            >
              <Trash2 size={18} /> Clear Design
            </button>
          </div>
        </div>
        {/* Layers & Properties moved here for single-side settings */}
        <div className={styles.sidePanels}>
          <LayerPanel
            onOpenProperties={(id: string) => {
              selectLayer(id);
              setRightPropsLayerId(id);
            }}
          />

          <button
            className={styles.checkoutBtn}
            onClick={() => {
              calculatePricing();
              setIsModalOpen(true);
            }}
            style={{ marginTop: "12px" }}
          >
            Get Estimated Cost
          </button>
        </div>
      </aside>

      {/* Main Canvas Area */}
      <main className={styles.canvasArea} onClick={() => selectLayer(null)}>
        <div
          className={styles.viewSwitcher}
          onClick={(e) => e.stopPropagation()}
        >
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

        <div
          className={styles.canvasWrapper}
          style={{ backgroundColor: "#e2e2e2", border: "none" }}
        >
          <ThreeCanvas />
        </div>
      </main>

      {/* Right properties drawer - opens when layer 'Properties' button clicked */}
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

      {/* 2D Interactive Editor */}
      <DesignEditor2D />

      {/* Move Layers/Properties into left sidebar for clearer layout */}
      <div style={{ display: "none" }} />

      {/* --- Mobile Responsiveness UI --- */}

      {/* Mobile 3D Button */}
      <button
        className={styles.mobileView3DBtn}
        onClick={() => setIsMobile3DOpen(true)}
      >
        <Box size={18} /> View 3D
      </button>

      {/* Mobile 3D Modal */}
      {isMobile3DOpen && (
        <div className={styles.modalOverlay}>
          <div
            className={styles.viewSwitcher}
            onClick={(e) => e.stopPropagation()}
            style={{ zIndex: 2020, top: "40px" }}
          >
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
          <button
            className={styles.closeModalBtn}
            onClick={() => setIsMobile3DOpen(false)}
          >
            <X size={24} />
          </button>
          <div className={styles.modalContent}>
            <ThreeCanvas />
          </div>
        </div>
      )}

      {/* Mobile Menu Toggle Button */}
      <button
        className={styles.mobileMenuBtn}
        onClick={() => setActiveMobileTab(activeMobileTab ? null : "tools")}
      >
        <Settings2 size={24} />
      </button>

      {/* Mobile Sidebar Overlay */}
      {activeMobileTab && (
        <div
          className={styles.mobileDrawerOverlay}
          onClick={() => setActiveMobileTab(null)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`${styles.mobileSidebar} ${activeMobileTab ? styles.open : ""}`}
      >
        <button
          className={styles.mobileSidebarClose}
          onClick={() => setActiveMobileTab(null)}
        >
          <X size={24} />
        </button>

        <div className={styles.mobileSidebarTabs}>
          <button
            className={`${styles.mobileSidebarTabBtn} ${activeMobileTab === "tools" ? styles.active : ""}`}
            onClick={() => setActiveMobileTab("tools")}
          >
            Tools
          </button>
          <button
            className={`${styles.mobileSidebarTabBtn} ${activeMobileTab === "layers" ? styles.active : ""}`}
            onClick={() => setActiveMobileTab("layers")}
          >
            Layers
          </button>
          <button
            className={`${styles.mobileSidebarTabBtn} ${activeMobileTab === "properties" ? styles.active : ""}`}
            onClick={() => setActiveMobileTab("properties")}
          >
            Props
          </button>
        </div>

        {activeMobileTab === "tools" && (
          <div className={styles.toolsPanel} style={{ padding: 0 }}>
            <div className={styles.toolSection}>
              <h3 className={styles.toolSectionTitle}>Apparel Color</h3>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {[
                  "#000000",
                  "#FFFFFF",
                  "#FF0000",
                  "#00FF00",
                  "#0000FF",
                  "#FFFF00",
                  "#EF4444",
                  "#3B82F6",
                  "#10B981",
                ].map((hex) => (
                  <div
                    key={hex}
                    onClick={() => changeApparelColor(hex, hex)}
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      backgroundColor: hex,
                      cursor: "pointer",
                      border:
                        project.apparelConfig.colorHex === hex
                          ? "2px solid #fff"
                          : "1px solid #333",
                    }}
                  />
                ))}
              </div>
            </div>
            <div className={styles.toolSection}>
              <h3 className={styles.toolSectionTitle}>Add Elements</h3>
              <label className={styles.toolButton}>
                <ImageIcon size={18} /> Upload Image (Decal)
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
              <button className={styles.toolButton} onClick={handleAddText}>
                <Type size={18} /> Add Text
              </button>
              <button className={styles.toolButton} onClick={handleAddLine}>
                <Minus size={18} /> Add Line
              </button>
            </div>
          </div>
        )}
        {activeMobileTab === "layers" && (
          <LayerPanel
            onOpenProperties={(id: string) => {
              selectLayer(id);
              setActiveMobileTab("properties");
            }}
          />
        )}
        {activeMobileTab === "properties" && <PropertiesPanel />}

        {/* <button
          className={styles.checkoutBtn}
          onClick={() => {
            calculatePricing();
            setIsModalOpen(true);
            setActiveMobileTab(null);
          }}
          style={{ marginTop: "auto" }}
        >
          Checkout
        </button> */}
      </div>

      {isModalOpen && (
        <CostEstimateModal
          onClose={() => setIsModalOpen(false)}
          onProceed={() => {
            // Integration with checkout (Sprint 4)
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
