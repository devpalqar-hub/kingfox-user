import { useDesignStore } from "@/stores/design-studio/useDesignStore";
import { Rnd } from "react-rnd";
import { Layer, TextLayer, ImageLayer, LineLayer } from "@/types/design-studio";
import { RotateCw } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import styles from "./DesignEditor2D.module.css";

export default function DesignEditor2D() {
  const { project, activeView, selectedLayerId, selectLayer, updateLayer } =
    useDesignStore();
  const layers = project.designs[activeView] || [];

  const [svgContent, setSvgContent] = useState<string | null>(null);

  useEffect(() => {
    const fetchSvg = async () => {
      try {
        let base = `/templates/${project.apparelConfig.categoryId}`;
        const normalized = (project.apparelConfig.categoryId || '').toString().toLowerCase();
        if (normalized.includes('hoodie')) {
          base = `/templates/hoodie`;
        }

        const candidate =
          activeView === "back" ? `${base}-back.svg` : `${base}-front.svg`;

        // Try category-specific template first
        let res = await fetch(candidate);
        if (!res.ok) {
          // Fallback to the legacy Tshirt templates
          const fallback =
            activeView === "back"
              ? "/templates/Tshirt-back.svg"
              : "/templates/Tshirt-front.svg";
          res = await fetch(fallback);
        }

        const text = await res.text();

        // Inject colorHex into the first path (main body)
        let replaced = text.replace(
          /fill="none"/g,
          `fill="${project.apparelConfig.colorHex}"`,
        );

        // Add viewBox if missing to ensure uniform scaling
        if (!replaced.includes("viewBox")) {
          const widthMatch = replaced.match(/width="([\d.]+)"/);
          const heightMatch = replaced.match(/height="([\d.]+)"/);
          if (widthMatch && heightMatch) {
            replaced = replaced.replace(
              "<svg ",
              `<svg viewBox="0 0 ${widthMatch[1]} ${heightMatch[1]}" preserveAspectRatio="xMidYMid meet" `
            );
          }
        }

        // Ensure SVG scales to fit container and is centered
        replaced = replaced.replace(
          "<svg ",
          '<svg preserveAspectRatio="xMidYMid meet" style="width: 100%; height: 100%; display: block; margin: auto;" ',
        );

        setSvgContent(replaced);
      } catch (err) {
        console.error("Error fetching SVG template", err);
      }
    };
    fetchSvg();
  }, [activeView, project.apparelConfig.colorHex, project.apparelConfig.categoryId]);

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
    <div className={styles.editorContainer} onClick={() => selectLayer(null)}>
      <div className={styles.printAreaWrapper}>
        <div
          className={styles.printArea}
          ref={containerRef}
          style={{ backgroundColor: "transparent" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* T-Shirt overlay fetched and colored dynamically */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              background: "transparent",
              zIndex: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            dangerouslySetInnerHTML={{ __html: svgContent || "" }}
          />

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
                onResizeStop={(e, dir, ref, delta, pos) =>
                  handleResizeStop(layer.id, ref, pos)
                }
                disableDragging={layer.isLocked}
                enableResizing={!layer.isLocked}
                bounds="parent"
                className={`${styles.layerNode} ${isSelected ? styles.selected : ""}`}
                style={{
                  zIndex: layer.zIndex,
                }}
                onMouseDown={() => selectLayer(layer.id)}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    transform: `rotate(${layer.rotation}deg)`,
                    opacity: layer.opacity,
                    transformOrigin: "center center",
                    pointerEvents: "auto",
                  }}
                >
                  {layer.type === "text" && (
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
                  {layer.type === "image" && (
                    <img
                      src={(layer as ImageLayer).asset.originalUrl}
                      alt={layer.name}
                      className={styles.imageLayer}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        display: "block",
                      }}
                    />
                  )}
                  {layer.type === "line" && (
                    <div
                      className={styles.lineLayer}
                      style={{
                        backgroundColor: (layer as LineLayer).colorHex,
                        height: `${(layer as LineLayer).thickness}px`,
                        width: "100%",
                        position: "absolute",
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                    />
                  )}
                </div>
              </Rnd>
            );
          })}
        </div>
      </div>
    </div>
  );
}
