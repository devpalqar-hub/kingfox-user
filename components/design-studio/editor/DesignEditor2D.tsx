import { useDesignStore } from '@/stores/design-studio/useDesignStore';
import { Rnd } from 'react-rnd';
import { Layer, TextLayer, ImageLayer, LineLayer } from '@/types/design-studio';
import { RotateCw } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import styles from './DesignEditor2D.module.css';

export default function DesignEditor2D() {
  const { project, activeView, selectedLayerId, selectLayer, updateLayer } = useDesignStore();
  const layers = project.designs[activeView] || [];
  
  // The print area bounds
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragStop = (id: string, d: any) => {
    updateLayer(id, { x: d.x, y: d.y });
  };

  const handleResizeStop = (id: string, ref: any, position: any) => {
    updateLayer(id, {
      width: parseInt(ref.style.width, 10),
      height: parseInt(ref.style.height, 10),
      x: position.x,
      y: position.y,
    });
  };

  return (
    <div 
      className={styles.editorContainer} 
      onClick={() => selectLayer(null)}
    >
      <div 
        className={styles.printArea} 
        ref={containerRef}
        style={{ backgroundColor: project.apparelConfig.colorHex }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.printAreaGrid} />
        
        {layers.map((layer) => {
          if (!layer.isVisible) return null;

          const isSelected = selectedLayerId === layer.id;

          return (
            <Rnd
              key={layer.id}
              size={{ width: layer.width, height: layer.height }}
              position={{ x: layer.x, y: layer.y }}
              onDragStop={(e, d) => handleDragStop(layer.id, d)}
              onResizeStop={(e, dir, ref, delta, pos) => handleResizeStop(layer.id, ref, pos)}
              disableDragging={layer.isLocked}
              enableResizing={!layer.isLocked}
              bounds="parent"
              className={`${styles.layerNode} ${isSelected ? styles.selected : ''}`}
              style={{
                zIndex: layer.zIndex,
                transform: `rotate(${layer.rotation}deg)`, // Apply rotation
                opacity: layer.opacity,
              }}
              onMouseDown={() => selectLayer(layer.id)}
            >
              {layer.type === 'text' && (
                <div 
                  className={styles.textLayer}
                  style={{
                    color: (layer as TextLayer).colorHex,
                    fontFamily: (layer as TextLayer).fontFamily,
                    fontSize: `${(layer as TextLayer).fontSize}px`,
                    fontWeight: (layer as TextLayer).fontWeight,
                    letterSpacing: `${(layer as TextLayer).letterSpacing}px`,
                    textAlign: (layer as TextLayer).textAlign,
                  }}
                >
                  {(layer as TextLayer).text}
                </div>
              )}
              {layer.type === 'image' && (
                <img 
                  src={(layer as ImageLayer).asset.originalUrl} 
                  alt={layer.name}
                  className={styles.imageLayer}
                />
              )}
              {layer.type === 'line' && (
                <div 
                  className={styles.lineLayer}
                  style={{
                    backgroundColor: (layer as LineLayer).colorHex,
                    height: `${(layer as LineLayer).thickness}px`,
                    width: '100%',
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}
                />
              )}
            </Rnd>
          );
        })}
      </div>
    </div>
  );
}
