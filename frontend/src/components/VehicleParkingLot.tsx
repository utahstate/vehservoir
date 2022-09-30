import React from 'react';
import Canvas from './common/Canvas';

const CanvasDimensions = {
  width: 2000,
  height: 1000,
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
  sections: number;
  boundingBox: BoundingBox;

  constructor(
    doubleSection: boolean,
    sections: number,
    boundingBox: BoundingBox,
  ) {
    this.doubleSection = doubleSection;
    this.sections = sections;
    this.boundingBox = boundingBox;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { x, y, width, height } = this.boundingBox;

    for (let xi = x; xi <= x + width; xi += width / this.sections) {
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
      for (let i = 0; i < section.sections; i++) {
        const { x, y, width, height } = section.boundingBox;
        const sectionWidth = width / section.sections;
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

export const VehicleParkingLot = () => {
  const parkingSections: ParkingSection[] = [
    new ParkingSection(false, 9, {
      x: 150,
      y: 0,
      width: 900,
      height: 100,
    }),
    new ParkingSection(true, 9, {
      x: 150,
      y: 200,
      width: 900,
      height: 200,
    }),
    new ParkingSection(false, 9, {
      x: 150,
      y: 500,
      width: 900,
      height: 100,
    }),
  ];

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

  const parkingLot = new ParkingLot(parkingSections, vehicles);

  const initialize = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    setLastUpdate(new Date());
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    parkingLot.draw(ctx);
  };

  const update = (dt: number) => {
    parkingLot.update(dt);
  };

  const loop = (ctx: CanvasRenderingContext2D) => {
    const now = new Date();
    const delta = now.getTime() - lastUpdate.getTime();

    update(delta);
    draw(ctx);

    setLastUpdate(now);
  };

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
      <Canvas
        style={{ border: '1px solid black ', background: 'white' }}
        loop={loop}
        initialize={initialize}
        width={CanvasDimensions.width}
        height={CanvasDimensions.height}
      />
      <div className="progress-bar">
        <div className="progress-bar-filled" style={{ width: '40%' }}></div>
      </div>
    </div>
  );
};
