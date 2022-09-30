import { useRef, useEffect } from 'react';

interface UseCanvasProps {
  loop: (ctx: CanvasRenderingContext2D) => void;
  initialize: (ctx: CanvasRenderingContext2D) => void;
}

const useCanvas = ({ loop, initialize }: UseCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    if (context) {
      initialize(context);
      let animationFrameId: number;

      const doOnFrame = () => {
        loop(context);
        animationFrameId = window.requestAnimationFrame(doOnFrame);
      };
      doOnFrame();

      return () => {
        window.cancelAnimationFrame(animationFrameId);
      };
    }
  }, [loop]);

  return canvasRef;
};

export default useCanvas;
