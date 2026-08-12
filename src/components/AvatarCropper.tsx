"use client";

import { useEffect, useRef, useState } from "react";

/** Lado da imagem final enviada (quadrada). */
const OUTPUT = 512;
/** Lado da área de recorte na tela. */
const VIEW = 280;

type Props = {
  file: File;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
  saving?: boolean;
};

/**
 * Deixa o aluno enquadrar a própria foto antes de enviar: arrasta para
 * posicionar e usa o controle de zoom para aproximar. O resultado é sempre um
 * quadrado de 512px, que é como a foto aparece na plataforma — assim ninguém
 * fica com a cabeça cortada por causa de um recorte automático.
 */
export function AvatarCropper({ file, onCancel, onConfirm, saving = false }: Props) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  // Carrega o arquivo escolhido, já centralizando a foto no quadrado.
  useEffect(() => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const cover = Math.max(VIEW / image.naturalWidth, VIEW / image.naturalHeight);
      setImg(image);
      setPos({
        x: (VIEW - image.naturalWidth * cover) / 2,
        y: (VIEW - image.naturalHeight * cover) / 2,
      });
    };
    image.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Escala mínima para a foto cobrir todo o quadrado (nunca sobra borda vazia).
  const base = img ? Math.max(VIEW / img.naturalWidth, VIEW / img.naturalHeight) : 1;
  const scale = base * zoom;
  const drawW = img ? img.naturalWidth * scale : 0;
  const drawH = img ? img.naturalHeight * scale : 0;

  /** Impede arrastar a foto para além da borda, o que deixaria um vazio. */
  function clamp(next: { x: number; y: number }) {
    return {
      x: Math.min(0, Math.max(VIEW - drawW, next.x)),
      y: Math.min(0, Math.max(VIEW - drawH, next.y)),
    };
  }

  // Ao mudar o zoom a posição guardada pode ficar fora do limite; corrigimos na
  // hora de desenhar, em vez de reescrever o estado (evita renderização extra).
  const shown = img ? clamp(pos) : pos;

  function onPointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, ox: shown.x, oy: shown.y };
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = dragRef.current;
    if (!d) return;
    setPos(clamp({ x: d.ox + (e.clientX - d.x), y: d.oy + (e.clientY - d.y) }));
  }

  function onPointerUp() {
    dragRef.current = null;
  }

  function handleConfirm() {
    if (!img) return;
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT;
    canvas.height = OUTPUT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Repete na tela final o mesmo enquadramento que a pessoa viu.
    const f = OUTPUT / VIEW;
    ctx.drawImage(img, shown.x * f, shown.y * f, drawW * f, drawH * f);
    canvas.toBlob((blob) => blob && onConfirm(blob), "image/jpeg", 0.9);
  }

  return (
    <div className="cropper-backdrop" role="dialog" aria-modal="true" aria-label="Ajustar foto">
      <div className="cropper-box card">
        <h3 style={{ fontSize: 17, margin: "0 0 4px" }}>Ajuste sua foto</h3>
        <p className="muted" style={{ fontSize: 13, margin: "0 0 14px" }}>
          Arraste para posicionar e use o controle abaixo para aproximar.
        </p>

        <div
          className="cropper-view"
          style={{ width: VIEW, height: VIEW, touchAction: "none" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {img && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img.src}
              alt="Prévia da foto"
              draggable={false}
              style={{
                position: "absolute",
                left: shown.x,
                top: shown.y,
                width: drawW,
                height: drawH,
                maxWidth: "none",
              }}
            />
          )}
          <div className="cropper-mask" />
        </div>

        <label className="muted" style={{ fontSize: 12.5, display: "block", margin: "14px 0 4px" }}>
          Aproximar
        </label>
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          style={{ width: "100%" }}
          aria-label="Aproximar a foto"
        />

        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button className="btn ghost" style={{ flex: 1 }} onClick={onCancel} disabled={saving}>
            Cancelar
          </button>
          <button
            className="btn primary"
            style={{ flex: 1, opacity: saving || !img ? 0.6 : 1 }}
            onClick={handleConfirm}
            disabled={saving || !img}
          >
            {saving ? "Enviando…" : "Usar esta foto"}
          </button>
        </div>
      </div>
    </div>
  );
}
