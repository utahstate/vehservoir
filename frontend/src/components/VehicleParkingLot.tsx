import React, { useEffect, useRef } from 'react';

const CanvasDimensions = {
  width: 1000,
  height: 700,
};
interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ParkingSpot {
  boundingBox: BoundingBox;
  occupied: boolean;
}

class ParkingSection {
  doubleSection: boolean;
  spots: number;
  boundingBox: BoundingBox;

  constructor(doubleSection: boolean, spots: number, boundingBox: BoundingBox) {
    this.doubleSection = doubleSection;
    this.spots = spots;
    this.boundingBox = boundingBox;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { x, y, width, height } = this.boundingBox;

    ctx.lineWidth = 2;
    ctx.strokeStyle = 'white';
    for (let xi = x; xi <= x + width; xi += width / this.spots) {
      line(ctx, xi, y, xi, y + height);
    }

    if (this.doubleSection) {
      line(ctx, x, y + height / 2, x + width, y + height / 2);
    }
  }
}

class Vehicle {
  boundingBox: BoundingBox;
  color: string;
  velocity: {
    dx: number;
    dy: number;
  };
  rotation: number;
  parkingSpot: ParkingSpot | null;

  draw(ctx: CanvasRenderingContext2D) {
    const { x, y, width, height } = this.boundingBox;
    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate(this.rotation);
    ctx.translate(-(x + width / 2), -(y + height / 2));
    ctx.fillStyle = this.color;
    ctx.fillRect(x, y, width, height);
    ctx.restore();
  }

  update(dt: number) {
    this.boundingBox.x += dt * this.velocity.dx;
    this.boundingBox.y += dt * this.velocity.dy;
    this.rotation += 0.01;
  }

  constructor(boundingBox: BoundingBox, color: string) {
    this.boundingBox = boundingBox;
    this.color = color;
    this.velocity = {
      dx: 0,
      dy: 0,
    };
    this.rotation = 0;
    this.parkingSpot = null;
  }
}

class ParkingLot {
  private parkingSections: ParkingSection[];
  private parkingSpots: ParkingSpot[] = [];
  private vehicles: Vehicle[] = [];

  draw(ctx: CanvasRenderingContext2D) {
    this.parkingSections.forEach((section) => section.draw(ctx));
    this.vehicles.forEach((vehicle) => vehicle.draw(ctx));
  }

  update(dt: number) {
    this.vehicles.forEach((vehicle) => {
      vehicle.update(dt);
    });
  }

  constructor(parkingSections: ParkingSection[], vehicles: Vehicle[]) {
    this.parkingSections = parkingSections;
    this.vehicles = vehicles;

    this.parkingSections.map((section) => {
      for (let i = 0; i < section.spots; i++) {
        const { x, y, width, height } = section.boundingBox;
        const sectionWidth = width / section.spots;
        const sectionHeight = height / (section.doubleSection ? 2 : 1);
        const boundingBox = {
          x: x + i * sectionWidth,
          y: y,
          width: sectionWidth,
          height: sectionHeight,
        };
        this.parkingSpots.push({
          boundingBox,
          occupied: false,
        });
      }
    });
  }
}

const line = (
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) => {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
};

const constructOptimalParkingSections = (
  boundingBox: BoundingBox,
  minParkingSpotWidth: number,
  parkingSpotHeight: number,
): ParkingSection[] => {
  const { x, y, width, height } = boundingBox;
  const parkingSections: ParkingSection[] = [];

  const maxParkingRows = Math.floor(height / parkingSpotHeight); // The perfect grid without dividers between parking sections
  const spots = Math.floor(width / minParkingSpotWidth);

  const numDividers = Math.ceil(maxParkingRows / 3); // The minimum number of gaps between sections

  let singleSections = (maxParkingRows - 1) % 3;

  let sY = y;
  if (singleSections) {
    parkingSections.push(
      new ParkingSection(false, spots, {
        x,
        y: sY,
        width,
        height: parkingSpotHeight,
      }),
    );
    singleSections--;
    sY += parkingSpotHeight;
  }
  for (
    let i = 0;
    i < Math.floor((maxParkingRows - numDividers - singleSections) / 2);
    i++
  ) {
    sY += parkingSpotHeight; // Add a gap
    parkingSections.push(
      new ParkingSection(true, spots, {
        x,
        y: sY,
        width,
        height: 2 * parkingSpotHeight,
      }),
    );
    sY += 2 * parkingSpotHeight;
  }
  if (singleSections) {
    parkingSections.push(
      new ParkingSection(false, spots, {
        x,
        y: sY + parkingSpotHeight,
        width,
        height: parkingSpotHeight,
      }),
    );
  }

  return parkingSections;
};

const vehicles: Vehicle[] = [
  new Vehicle(
    {
      x: 0,
      y: 0,
      width: 50,
      height: 90,
    },
    'red',
  ),
];

const parkingLot = new ParkingLot(
  constructOptimalParkingSections(
    {
      x: 100,
      y: 0,
      width: CanvasDimensions.width - 200,
      height: CanvasDimensions.height,
    },
    100,
    100,
  ),
  vehicles,
);

export const VehicleParkingLot = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    let lastUpdate = Date.now();

    const draw = (ctx: CanvasRenderingContext2D) => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      parkingLot.draw(ctx);
    };

    const update = (dt: number) => {
      parkingLot.update(dt);
    };

    let animationFrameId: number;
    const loop = () => {
      const now = Date.now();
      const delta = now - lastUpdate;

      update(delta);

      if (ctx) {
        draw(ctx);
      }

      lastUpdate = now;
      animationFrameId = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      className="container"
      style={{
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <canvas
        ref={canvasRef}
        width={CanvasDimensions.width}
        height={CanvasDimensions.height}
        style={{ border: '1px solid black' }}
      />

      <div className="progress-bar">
        <div className="progress-bar-filled" style={{ width: '40%' }}></div>
      </div>
    </div>
  );
};
