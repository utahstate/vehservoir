import React, { useEffect, useRef } from 'react';
import { createVoidZero } from 'typescript';

interface Dimension {
  width: number;
  height: number;
}
interface Position {
  x: number;
  y: number;
}

interface Velocity {
  dx: number;
  dy: number;
}

class Entity {
  position: Position;
  dimension: Dimension;
  velocity: Velocity;
  theta: number;
  dTheta: number;

  update(dt: number) {
    this.position.x += this.velocity.dx * dt;
    this.position.y += this.velocity.dy * dt;
    this.theta += this.dTheta * dt;
  }

  initDraw(
    ctx: CanvasRenderingContext2D,
    afterRotation: (ctx: CanvasRenderingContext2D, position: Position) => void,
  ) {
    ctx.save();
    const [x, y] = [
      this.position.x - this.dimension.width / 2,
      this.position.y - this.dimension.height / 2,
    ];

    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.theta);
    ctx.translate(-this.position.x, this.position.y);
    afterRotation(ctx, { x, y });
    ctx.restore();
  }

  constructor(
    position: Position,
    dimension: Dimension,
    velocity: Velocity,
    theta: number,
    dTheta: number,
  ) {
    this.position = position;
    this.dimension = dimension;
    this.velocity = velocity;
    this.theta = theta;
    this.dTheta = dTheta;
  }
}

class ParkingSpot {
  position: Position;
  dimensions: Dimension;
  occupied: boolean;

  constructor(position: Position, dimensions: Dimension, occupied: boolean) {
    this.position = position;
    this.dimensions = dimensions;
    this.occupied = occupied;
  }
}

class ParkingSection {
  doubleSection: boolean;
  spots: number;
  position: Position;
  dimensions: Dimension;

  constructor(
    doubleSection: boolean,
    spots: number,
    position: Position,
    dimensions: Dimension,
  ) {
    this.doubleSection = doubleSection;
    this.spots = spots;
    this.position = position;
    this.dimensions = dimensions;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { x, y } = this.position;
    const { width, height } = this.dimensions;

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

class Vehicle extends Entity {
  color: string;
  parkingSpot: ParkingSpot | null;
  path: Position[] = [];

  update(dt: number) {
    if (this.path.length) {
      const { x, y } = this.path[0];
      const dx = x - this.position.x;
      const dy = y - this.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 1) {
        this.path.shift();
      } else {
        this.velocity.dx = dx / dist;
        this.velocity.dy = dy / dist;
      }
    }
    super.update(dt);
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { width, height } = this.dimension;
    this.initDraw(ctx, (ctx, position: Position) => {
      ctx.fillStyle = this.color;
      ctx.fillRect(position.x, position.y, width, height);
    });
  }

  constructor(position: Position, dimension: Dimension, color: string) {
    super(position, dimension, { dx: 0, dy: 0 }, 0, 0);
    this.dTheta = 0.001;
    this.color = color;
    this.parkingSpot = null;
  }
}

class ParkingLot extends Entity {
  parkingSections: ParkingSection[];
  parkingSpots: ParkingSpot[] = [];
  vehicles: Vehicle[] = [];
  gaps: Position[] = [];

  draw(ctx: CanvasRenderingContext2D) {
    this.parkingSections.forEach((section) => section.draw(ctx));
    this.vehicles.forEach((vehicle) => vehicle.draw(ctx));
  }

  update(dt: number) {
    this.vehicles.forEach((vehicle) => {
      vehicle.update(dt);
    });
  }

  gapPoints() {
    const yRanges = this.parkingSections
      .sort((a, b) => a.position.y - b.position.y)
      .map((section) => ({
        start: section.position.y,
        end: section.dimensions.height + section.position.y,
      }));

    const gaps = [];
    let startY = this.position.y;
    const endY = startY + this.dimension.height;
    for (const yRange of yRanges) {
      if (yRange.start > startY) {
        gaps.push({ start: startY, end: yRange.start });
      }
      startY = yRange.end;
    }
    if (startY < endY) {
      gaps.push({ start: startY, end: endY });
    }
    return gaps
      .map(({ start, end }) => {
        const y = (start + end) / 2;
        return [
          { x: this.position.x, y },
          { x: this.position.x + this.dimension.width, y },
        ];
      })
      .flat();
  }

  createPathToParkingSpot(
    position: Position,
    parkingSpot: ParkingSpot,
  ): [Position, Position][] {
    console.log(this.gapPoints());

    return [
      [
        {
          x: position.x,
          y: position.y,
        },
        {
          x: parkingSpot.position.x,
          y: parkingSpot.position.y,
        },
      ],
    ];
  }

  static generateOptimalParkingSections(
    { x, y }: Position,
    { height, width }: Dimension,
    { height: parkingSpotHeight, width: parkingSpotWidth }: Dimension,
  ): ParkingSection[] {
    const parkingSections: ParkingSection[] = [];

    const maxParkingRows = Math.floor(height / parkingSpotHeight);
    const spots = Math.floor(width / parkingSpotWidth);

    const numDividers = Math.ceil(maxParkingRows / 3); // The minimum number of gaps between sections
    const dividerHeight =
      (height - maxParkingRows * parkingSpotHeight) / numDividers +
      parkingSpotHeight;

    const buildSections = (
      y: number,
      singleSections: number,
      doubleSections: number,
      placeSingle = true,
    ): void => {
      if (doubleSections === 0 && singleSections === 0) {
        return;
      }
      if (singleSections && placeSingle) {
        parkingSections.push(
          new ParkingSection(
            false,
            spots,
            { x, y },
            { width, height: parkingSpotHeight },
          ),
        );
        buildSections(
          y + parkingSpotHeight + dividerHeight,
          singleSections - 1,
          doubleSections,
          false,
        );
      } else if (doubleSections) {
        parkingSections.push(
          new ParkingSection(
            true,
            spots,
            { x, y },
            { width, height: parkingSpotHeight * 2 },
          ),
        );
        buildSections(
          y + parkingSpotHeight * 2 + dividerHeight,
          singleSections,
          doubleSections - 1,
          doubleSections - 1 === 0,
        );
      }
    };

    const singleSections = (maxParkingRows - 1) % 3;
    buildSections(
      y + (!singleSections ? dividerHeight : 0),
      singleSections,
      Math.floor((maxParkingRows - numDividers - singleSections) / 2),
    );
    return parkingSections;
  }

  constructor(
    dimension: Dimension,
    parkingSpotDimension: Dimension,
    position: Position,
    vehicles: Vehicle[],
  ) {
    super(position, dimension, { dx: 0, dy: 0 }, 0, 0);

    this.vehicles = vehicles;

    this.parkingSections = ParkingLot.generateOptimalParkingSections(
      position,
      dimension,
      parkingSpotDimension,
    );

    for (const section of this.parkingSections) {
      for (let i = 0; i < section.spots; i++) {
        const { x, y } = section.position;
        const { width, height } = section.dimensions;
        const sectionWidth = width / section.spots;
        const sectionHeight = height / (section.doubleSection ? 2 : 1);
        this.parkingSpots.push(
          new ParkingSpot(
            {
              x: x + i * sectionWidth,
              y,
            },
            {
              width: sectionWidth,
              height: sectionHeight,
            },
            false,
          ),
        );
      }
    }
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

const vehicles: Vehicle[] = [
  new Vehicle({ x: 0, y: 0 }, { width: 50, height: 50 }, 'red'),
];

const CanvasDimensions = {
  width: 1000,
  height: 600,
};

const parkingLot = new ParkingLot(
  {
    width: CanvasDimensions.width - 200,
    height: CanvasDimensions.height,
  },
  {
    width: 80,
    height: 100,
  },
  {
    x: 100,
    y: 0,
  },
  vehicles,
);

console.log(
  parkingLot.createPathToParkingSpot(
    { x: 0, y: 0 },
    parkingLot.parkingSpots[0],
  ),
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
