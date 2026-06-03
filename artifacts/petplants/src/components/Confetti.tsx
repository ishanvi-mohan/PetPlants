import React, { useEffect, useState } from "react";

export default function Confetti() {
  const [pieces, setPieces] = useState<any[]>([]);

  useEffect(() => {
    const colors = ['#00ff87', '#ffd166', '#ff6b9d', '#6bcbff', '#ffcc00'];
    const newPieces = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      tx: `${(Math.random() - 0.5) * 400}px`,
      ty: `${(Math.random() - 0.5) * 400}px`,
      rot: `${Math.random() * 360}deg`,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: `${Math.random() * 0.2}s`,
      size: `${Math.random() * 8 + 4}px`
    }));
    
    setPieces(newPieces);
    
    return () => setPieces([]);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
      {pieces.map(p => (
        <div
          key={p.id}
          className="absolute"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animation: `confetti-scatter 1.5s cubic-bezier(0.25, 1, 0.5, 1) ${p.delay} forwards`,
            ['--tx' as string]: p.tx,
            ['--ty' as string]: p.ty,
            ['--rot' as string]: p.rot,
          }}
        />
      ))}
    </div>
  );
}