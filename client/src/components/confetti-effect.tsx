import { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  velocityX: number;
  velocityY: number;
  rotation: number;
  rotationSpeed: number;
  shape: 'circle' | 'square' | 'triangle';
}

interface ConfettiEffectProps {
  isActive: boolean;
  onComplete?: () => void;
  duration?: number;
}

export function ConfettiEffect({ isActive, onComplete, duration = 3000 }: ConfettiEffectProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const colors = [
    '#22c55e', // Green
    '#3b82f6', // Blue  
    '#a855f7', // Purple
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#06b6d4', // Cyan
    '#ec4899', // Pink
    '#84cc16', // Lime
  ];

  const shapes: ('circle' | 'square' | 'triangle')[] = ['circle', 'square', 'triangle'];

  const createConfettiPiece = (id: number): ConfettiPiece => {
    return {
      id,
      x: Math.random() * window.innerWidth,
      y: -10,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      velocityX: (Math.random() - 0.5) * 6,
      velocityY: Math.random() * 3 + 2,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    };
  };

  useEffect(() => {
    if (!isActive) {
      setIsAnimating(false);
      setConfetti([]);
      return;
    }

    setIsAnimating(true);

    // Create initial burst of confetti
    const initialConfetti: ConfettiPiece[] = [];
    for (let i = 0; i < 100; i++) {
      initialConfetti.push(createConfettiPiece(i));
    }
    setConfetti(initialConfetti);

    // Animation loop
    const animationLoop = () => {
      setConfetti(prev => 
        prev
          .map(piece => ({
            ...piece,
            x: piece.x + piece.velocityX,
            y: piece.y + piece.velocityY,
            rotation: piece.rotation + piece.rotationSpeed,
            velocityY: piece.velocityY + 0.1, // Gravity
          }))
          .filter(piece => piece.y < window.innerHeight + 50) // Remove pieces that fall off screen
      );
    };

    const animationId = setInterval(animationLoop, 16); // ~60fps

    // Stop animation after duration
    const timeoutId = setTimeout(() => {
      setIsAnimating(false);
      clearInterval(animationId);
      setTimeout(() => {
        setConfetti([]);
        onComplete?.();
      }, 1000); // Allow pieces to fall off screen
    }, duration);

    return () => {
      clearInterval(animationId);
      clearTimeout(timeoutId);
    };
  }, [isActive, duration, onComplete]);

  if (!isAnimating && confetti.length === 0) {
    return null;
  }

  const renderShape = (piece: ConfettiPiece) => {
    const style = {
      position: 'absolute' as const,
      left: piece.x,
      top: piece.y,
      width: piece.size,
      height: piece.size,
      backgroundColor: piece.color,
      transform: `rotate(${piece.rotation}deg)`,
      pointerEvents: 'none' as const,
    };

    switch (piece.shape) {
      case 'circle':
        return (
          <div
            key={piece.id}
            style={{
              ...style,
              borderRadius: '50%',
            }}
          />
        );
      case 'square':
        return (
          <div
            key={piece.id}
            style={style}
          />
        );
      case 'triangle':
        return (
          <div
            key={piece.id}
            style={{
              ...style,
              width: 0,
              height: 0,
              backgroundColor: 'transparent',
              borderLeft: `${piece.size / 2}px solid transparent`,
              borderRight: `${piece.size / 2}px solid transparent`,
              borderBottom: `${piece.size}px solid ${piece.color}`,
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ overflow: 'hidden' }}
    >
      {confetti.map(renderShape)}
    </div>
  );
}

// Hook for easy confetti triggering
export function useConfetti() {
  const [isActive, setIsActive] = useState(false);

  const triggerConfetti = () => {
    setIsActive(true);
  };

  const stopConfetti = () => {
    setIsActive(false);
  };

  return {
    isActive,
    triggerConfetti,
    stopConfetti,
    ConfettiComponent: ({ onComplete }: { onComplete?: () => void }) => (
      <ConfettiEffect 
        isActive={isActive} 
        onComplete={() => {
          setIsActive(false);
          onComplete?.();
        }}
      />
    ),
  };
}