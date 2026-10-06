import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import "./styles.css";

/** Galeria em tela cheia — setas, miniaturas e teclado (← → Esc). */
export default function Lightbox({ images, index, title, onIndex, onClose }) {
  const closeRef = useRef(null);
  const thumbsRef = useRef(null);
  const n = images.length;

  const step = useCallback((d) => onIndex((index + d + n) % n), [index, n, onIndex]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, step]);

  // Trava o scroll da página e devolve o foco ao fechar
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const previouslyFocused = document.activeElement;
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  // Mantém a miniatura ativa visível
  useEffect(() => {
    thumbsRef.current?.children[index]?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [index]);

  // Pré-carrega as vizinhas
  useEffect(() => {
    [index - 1, index + 1].forEach((i) => {
      const src = images[(i + n) % n];
      if (src) new Image().src = src;
    });
  }, [images, index, n]);

  // Swipe no celular
  const touchX = useRef(null);
  const onTouchStart = (e) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
    touchX.current = null;
  };

  return createPortal(
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={`Fotos — ${title}`}>
      <div className="lightbox-top">
        <span className="text-ellipsis">
          {index + 1} / {n} · {title}
        </span>
        <button ref={closeRef} type="button" className="lightbox-btn" onClick={onClose} aria-label="Fechar">
          <X size={20} />
        </button>
      </div>

      <div className="lightbox-stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <img key={images[index]} src={images[index]} alt={`Foto ${index + 1} de ${n}`} />
        {n > 1 && (
          <>
            <button type="button" className="lightbox-btn lightbox-prev" onClick={() => step(-1)} aria-label="Foto anterior">
              <ChevronLeft size={22} />
            </button>
            <button type="button" className="lightbox-btn lightbox-next" onClick={() => step(1)} aria-label="Próxima foto">
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      {n > 1 && (
        <div className="lightbox-thumbs" ref={thumbsRef}>
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              className={`lightbox-thumb${i === index ? " is-on" : ""}`}
              onClick={() => onIndex(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === index}
            >
              <img src={src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body,
  );
}
