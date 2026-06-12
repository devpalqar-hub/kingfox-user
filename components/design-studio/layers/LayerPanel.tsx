import { useDesignStore } from "@/stores/design-studio/useDesignStore";
import {
  Type,
  Image as ImageIcon,
  Minus,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  Sliders,
} from "lucide-react";
import styles from "./LayerPanel.module.css";
import { useState } from "react";

export default function LayerPanel({
  onOpenProperties,
}: {
  onOpenProperties?: (id: string) => void;
}) {
  const {
    project,
    activeView,
    selectedLayerId,
    selectLayer,
    removeLayer,
    duplicateLayer,
    reorderLayer,
    toggleLayerVisibility,
    toggleLayerLock,
    renameLayer,
  } = useDesignStore();

  const layers = project.designs[activeView] || [];

  // Sort descending by zIndex for display so top layer is at top of list
  const sortedLayers = [...layers].sort((a, b) => b.zIndex - a.zIndex);

  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);

  return (
    <div className={styles.layerPanel}>
      <div className={styles.header}>
        <h3 className={styles.title}>Layers</h3>
      </div>

      <div className={styles.layerList}>
        {sortedLayers.length === 0 && (
          <div className={styles.emptyState}>No layers added.</div>
        )}

        {sortedLayers.map((layer) => {
          const isSelected = selectedLayerId === layer.id;

          return (
            <div
              key={layer.id}
              className={`${styles.layerRow} ${isSelected ? styles.selected : ""}`}
              onClick={() => selectLayer(layer.id)}
            >
              <div className={styles.layerIcon}>
                {layer.type === "text" && <Type size={16} />}
                {layer.type === "image" && <ImageIcon size={16} />}
                {layer.type === "line" && <Minus size={16} />}
              </div>

              <div
                className={styles.layerName}
                onDoubleClick={() => setEditingLayerId(layer.id)}
              >
                {editingLayerId === layer.id ? (
                  <input
                    autoFocus
                    className={styles.nameInput}
                    defaultValue={layer.name}
                    onBlur={(e) => {
                      renameLayer(
                        layer.id,
                        (e.target as HTMLInputElement).value || layer.type,
                      );
                      setEditingLayerId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        renameLayer(
                          layer.id,
                          (e.currentTarget as HTMLInputElement).value ||
                            layer.type,
                        );
                        setEditingLayerId(null);
                      }
                    }}
                  />
                ) : (
                  <span>{layer.name}</span>
                )}
              </div>

              <div className={styles.actions}>
                <button
                  className={styles.actionBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLayerVisibility(layer.id);
                  }}
                  title={layer.isVisible ? "Hide" : "Show"}
                >
                  {layer.isVisible ? (
                    <Eye size={14} />
                  ) : (
                    <EyeOff size={14} style={{ color: "#888" }} />
                  )}
                </button>

                <button
                  className={styles.actionBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLayerLock(layer.id);
                  }}
                  title={layer.isLocked ? "Unlock" : "Lock"}
                >
                  {layer.isLocked ? (
                    <Lock size={14} style={{ color: "#888" }} />
                  ) : (
                    <Unlock size={14} />
                  )}
                </button>

                <div className={styles.divider} />

                <div className={styles.orderActions}>
                  <button
                    className={styles.actionBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      reorderLayer(layer.id, "up");
                    }}
                    disabled={layer.zIndex === layers.length}
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    className={styles.actionBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      reorderLayer(layer.id, "down");
                    }}
                    disabled={layer.zIndex === 1}
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>

                <div className={styles.divider} />
                <button
                  className={styles.actionBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateLayer(layer.id);
                  }}
                  title="Duplicate"
                >
                  <Copy size={14} />
                </button>

                <button
                  className={styles.actionBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenProperties) onOpenProperties(layer.id);
                  }}
                  title="Properties"
                >
                  <Sliders size={14} />
                </button>

                <button
                  className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeLayer(layer.id);
                  }}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
