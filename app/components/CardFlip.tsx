// app/components/CardFlip.tsx
import { useState } from "react";
import { clsx } from "clsx";

export function CardFlip({
  front,
  back,
  color = "#fef3c7",
  foregroundColor = "#78350f",
}: {
  front: string;
  back: string;
  color?: string;
  foregroundColor?: string;
}) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="card3d w-full">
      <div
        className={clsx("card-inner w-full rounded-2xl shadow p-6 min-h-[220px] cursor-pointer", flipped && "flipped")}
        onClick={() => setFlipped((v) => !v)}
        style={{ background: color, color: foregroundColor }}
      >
        <div className="card-face">
          <div className="text-lg whitespace-pre-wrap">{front}</div>
        </div>
        <div className="card-face card-back absolute inset-0 p-6 rounded-2xl">
          <div className="text-lg font-medium whitespace-pre-wrap">{back}</div>
        </div>
      </div>
    </div>
  );
}
