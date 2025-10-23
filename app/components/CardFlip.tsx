// app/components/CardFlip.tsx
import { useState } from "react";
import { clsx } from "clsx";

export function CardFlip({
  front,
  back,
  color = "#fef3c7",
  foregroundColor = "#78350f",
  flipped: controlledFlipped,
  onFlip,
}: {
  front: string;
  back: string;
  color?: string;
  foregroundColor?: string;
  flipped?: boolean;
  onFlip?: () => void;
}) {
  const [uncontrolledFlipped, setUncontrolledFlipped] = useState(false);

  // Use controlled flipped if provided, otherwise use internal state
  const isFlipped =
    controlledFlipped !== undefined ? controlledFlipped : uncontrolledFlipped;

  const handleClick = () => {
    if (onFlip) {
      onFlip();
    } else {
      setUncontrolledFlipped((v) => !v);
    }
  };

  return (
    <div className="card3d w-full">
      <div
        className={clsx(
          "card-inner w-full rounded-2xl shadow p-6 min-h-[220px] cursor-pointer",
          isFlipped && "flipped"
        )}
        onClick={handleClick}
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
