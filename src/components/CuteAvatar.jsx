import { useEffect, useRef, useState } from "react";

/** Avatar redondito con upload a localStorage (sin íconos encima).
 *  - Click: cambiar imagen
 *  - Clic derecho: quitar imagen
 */
export default function CuteAvatar({ userKey = "default", size = 40, className = "" }) {
  const storageKey = `avatar:${userKey}`;
  const [src, setSrc] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setSrc(localStorage.getItem(storageKey));
  }, [storageKey]);

  const openPicker = () => inputRef.current?.click();

  const onPick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const fr = new FileReader();
    fr.onload = () => {
      const dataUrl = fr.result;
      localStorage.setItem(storageKey, dataUrl);
      setSrc(dataUrl);
    };
    fr.readAsDataURL(f);
  };

  const clear = (e) => {
    e.preventDefault(); // evita el menú del navegador
    localStorage.removeItem(storageKey);
    setSrc(null);
  };

  const px = `${size}px`;

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden ring-1 ring-white/40 shadow-md cursor-pointer ${className}`}
      style={{ width: px, height: px }}
      onClick={openPicker}
      onContextMenu={clear}
      title="Click para cambiar, clic derecho para quitar"
    >
      {src ? (
        <img src={src} alt="avatar" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-white/70" />
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
    </div>
  );
}
