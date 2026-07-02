import { useDesignStore } from '@/stores/design-studio/useDesignStore';
import { TextLayer, ImageLayer, LineLayer } from '@/types/design-studio';
import styles from './PropertiesPanel.module.css';

export default function PropertiesPanel() {
  const { project, activeView, selectedLayerId, updateLayer } = useDesignStore();

  const layers = project.designs[activeView] || [];
  const layer = layers.find(l => l.id === selectedLayerId);

  if (!layer) {
    return (
      <div className={styles.emptyState}>
        Select an element to edit its properties
      </div>
    );
  }

  const handleChange = (updates: any) => {
    updateLayer(layer.id, updates);
  };

  return (
    <div className={styles.propertiesPanel}>
      <div className={styles.header}>
        <h3 className={styles.title}>Properties</h3>
      </div>

      <div className={styles.content}>
        {/* TEXT SPECIFIC CONTROLS */}
        {layer.type === 'text' && (
          <>
            <div className={styles.controlGroup}>
              <label>Text Content</label>
              <textarea
                className={styles.input}
                value={(layer as TextLayer).text}
                onChange={(e) => handleChange({ text: e.target.value })}
              />
            </div>

            <div className={styles.row}>
              <div className={styles.controlGroup}>
                <label>Font Family</label>
                <select
                  className={styles.select}
                  value={(layer as TextLayer).fontFamily}
                  onChange={(e) => handleChange({ fontFamily: e.target.value })}
                >
                  <option value="Inter">Inter</option>
                  <option value="Arial">Arial</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Impact">Impact</option>
                </select>
              </div>
              <div className={styles.controlGroup}>
                <label>Weight</label>
                <select
                  className={styles.select}
                  value={(layer as TextLayer).fontWeight}
                  onChange={(e) => handleChange({ fontWeight: parseInt(e.target.value) })}
                >
                  <option value="300">Light</option>
                  <option value="400">Regular</option>
                  <option value="500">Medium</option>
                  <option value="700">Bold</option>
                  <option value="900">Black</option>
                </select>
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.controlGroup}>
                <label>Color</label>
                <div className={styles.colorPickerWrapper}>
                  <input
                    type="color"
                    className={styles.colorInput}
                    value={(layer as TextLayer).colorHex}
                    onChange={(e) => handleChange({ colorHex: e.target.value })}
                  />
                  <span className={styles.colorHex}>{(layer as TextLayer).colorHex}</span>
                </div>
              </div>
              <div className={styles.controlGroup}>
                <label>Align</label>
                <select
                  className={styles.select}
                  value={(layer as TextLayer).textAlign}
                  onChange={(e) => handleChange({ textAlign: e.target.value })}
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>

            <div className={styles.controlGroup}>
              <label>Letter Spacing: {(layer as TextLayer).letterSpacing}px</label>
              <input
                type="range" min="-5" max="20" step="1"
                value={(layer as TextLayer).letterSpacing}
                onChange={(e) => handleChange({ letterSpacing: parseInt(e.target.value) })}
              />
            </div>

            <div className={styles.controlGroup}>
              <label>Font Size: {(layer as TextLayer).fontSize}px</label>
              <input
                type="range" min="12" max="200" step="1"
                value={(layer as TextLayer).fontSize}
                onChange={(e) => handleChange({ fontSize: parseInt(e.target.value) })}
              />
            </div>
          </>
        )}

        {/* IMAGE SPECIFIC CONTROLS */}
        {layer.type === 'image' && (
          <div className={styles.controlGroup}>
            <label>Image Source</label>
            <div className={styles.imagePreviewWrapper}>
              <img src={(layer as ImageLayer).asset.thumbnailUrl} className={styles.imagePreview} alt="preview" />
              {/* Future: Replace image button here */}
            </div>
          </div>
        )}

        {/* LINE SPECIFIC CONTROLS */}
        {layer.type === 'line' && (
          <>
            <div className={styles.controlGroup}>
              <label>Color</label>
              <div className={styles.colorPickerWrapper}>
                <input
                  type="color"
                  className={styles.colorInput}
                  value={(layer as LineLayer).colorHex}
                  onChange={(e) => handleChange({ colorHex: e.target.value })}
                />
                <span className={styles.colorHex}>{(layer as LineLayer).colorHex}</span>
              </div>
            </div>
            <div className={styles.controlGroup}>
              <label>Thickness: {(layer as LineLayer).thickness}px</label>
              <input
                type="range" min="1" max="50" step="1"
                value={(layer as LineLayer).thickness}
                onChange={(e) => handleChange({ thickness: parseInt(e.target.value) })}
              />
            </div>
          </>
        )}

        <hr className={styles.separator} />

        {/* COMMON CONTROLS */}
        <div className={styles.controlGroup}>
          <label>Opacity: {Math.round(layer.opacity * 100)}%</label>
          <input
            type="range" min="0" max="1" step="0.05"
            value={layer.opacity}
            onChange={(e) => handleChange({ opacity: parseFloat(e.target.value) })}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.controlGroup}>
            <label>Rotation: {Math.round(layer.rotation)}°</label>
            <input
              type="range" min="0" max="360" step="1"
              value={layer.rotation}
              onChange={(e) => handleChange({ rotation: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.controlGroup}>
            <label>Width</label>
            <input
              type="number" className={styles.input}
              value={layer.width}
              onChange={(e) => handleChange({ width: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className={styles.controlGroup}>
            <label>Height</label>
            <input
              type="number" className={styles.input}
              value={layer.height}
              onChange={(e) => handleChange({ height: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
