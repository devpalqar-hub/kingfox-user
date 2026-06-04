"use client";

import { useEffect, useState } from 'react';
import { Type, Image as ImageIcon, Download, Settings2, Palette, Minus, Trash2 } from 'lucide-react';
import { useDesignStore } from '@/stores/design-studio/useDesignStore';
import { Layer, TextLayer, ImageLayer } from '@/types/design-studio';
import ThreeCanvas from '@/components/design-studio/canvas/ThreeCanvas';
import DesignEditor2D from '@/components/design-studio/editor/DesignEditor2D';
import LayerPanel from '@/components/design-studio/layers/LayerPanel';
import PropertiesPanel from '@/components/design-studio/properties/PropertiesPanel';
import CostEstimateModal from '@/components/design-studio/modals/CostEstimateModal';
import ClearConfirmModal from '@/components/design-studio/modals/ClearConfirmModal';
import styles from './page.module.css';

export default function Workspace({ params }: { params: { id: string } }) {
  const { 
    project, activeView, selectedLayerId, 
    switchView, addLayer, updateLayer, selectLayer, calculatePricing,
    changeApparelColor, removeLayer
  } = useDesignStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const currentLayers = project.designs[activeView] || [];

  const handleAddText = () => {
    const newTextLayer: TextLayer = {
      id: `text_${Date.now()}`,
      type: 'text',
      name: 'Text Layer',
      text: 'KINGFOX',
      fontFamily: 'Inter',
      fontSize: 100,
      fontWeight: 700,
      letterSpacing: 0,
      colorHex: '#ffffff',
      textAlign: 'center',
      x: 0,
      y: 0,
      width: 300,
      height: 100,
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
          type: 'image',
          name: file.name || 'Image Layer',
          asset: {
            assetId: 'local',
            originalUrl: dataUrl,
            thumbnailUrl: dataUrl,
            mimeType: file.type,
          },
          x: 0,
          y: 0,
          width: 300,
          height: 300,
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
    const newLineLayer: import('@/types/design-studio').LineLayer = {
      id: `line_${Date.now()}`,
      type: 'line',
      name: 'Line Layer',
      thickness: 5,
      colorHex: '#ffffff',
      x: 0,
      y: 0,
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
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#EF4444', '#3B82F6', '#10B981'].map((hex) => (
                <div 
                  key={hex}
                  onClick={() => changeApparelColor(hex, hex)}
                  style={{ 
                    width: '30px', height: '30px', borderRadius: '50%', 
                    backgroundColor: hex, cursor: 'pointer',
                    border: project.apparelConfig.colorHex === hex ? '2px solid #fff' : '1px solid #333'
                  }}
                />
              ))}
            </div>
          </div>
          <div className={styles.toolSection}>
            <h3 className={styles.toolSectionTitle}>Add Elements</h3>
            <label className={styles.toolButton}>
              <ImageIcon size={18} /> Upload Image (Decal)
              <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
            </label>
            <button className={styles.toolButton} onClick={handleAddText}>
              <Type size={18} /> Add Text
            </button>
            <button className={styles.toolButton} onClick={handleAddLine}>
              <Minus size={18} /> Add Line
            </button>
          </div>
          
          <div className={styles.toolSection} style={{ marginTop: 'auto' }}>
            <button 
              className={styles.toolButton} 
              onClick={() => setIsClearModalOpen(true)}
              style={{ color: '#ef4444', borderColor: '#331111', backgroundColor: '#1a0505' }}
            >
              <Trash2 size={18} /> Clear Design
            </button>
          </div>
        </div>
      </aside>

      {/* Main Canvas Area */}
      <main className={styles.canvasArea} onClick={() => selectLayer(null)}>
        <div className={styles.viewSwitcher} onClick={(e) => e.stopPropagation()}>
          <button 
            className={`${styles.viewBtn} ${activeView === 'front' ? styles.active : ''}`}
            onClick={() => switchView('front')}
          >
            Front
          </button>
          <button 
            className={`${styles.viewBtn} ${activeView === 'back' ? styles.active : ''}`}
            onClick={() => switchView('back')}
          >
            Back
          </button>
        </div>

        <div className={styles.canvasWrapper} style={{ backgroundColor: '#e2e2e2', border: 'none' }}>
          <ThreeCanvas />
        </div>
      </main>

      {/* 2D Interactive Editor */}
      <DesignEditor2D />

      {/* Right Sidebar - Properties & Checkout */}
      <aside className={styles.rightSidebar}>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <LayerPanel />
          <PropertiesPanel />
        </div>

        <button 
          className={styles.checkoutBtn} 
          onClick={() => {
            calculatePricing();
            setIsModalOpen(true);
          }}
          style={{ marginTop: '20px' }}
        >
          Get Estimated Cost
        </button>
      </aside>

      {isModalOpen && (
        <CostEstimateModal 
          onClose={() => setIsModalOpen(false)} 
          onProceed={() => {
            // Integration with checkout (Sprint 4)
            alert('Proceeding to checkout...');
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
