import React from 'react';
import useCanvas from '../../hooks/UseCanvas';

interface CanvasProps {
  width: number;
  height: number;
  style: React.CSSProperties;
  initialize: (ctx: CanvasRenderingContext2D) => void;
  loop: (ctx: CanvasRenderingContext2D) => void;
}

const Canvas = (props: CanvasProps) => {
  const { initialize, loop, style, width, height } = props;
  const canvasRef = useCanvas({ loop, initialize });

  return <canvas width={width} height={height} ref={canvasRef} style={style} />;
};

export default Canvas;
