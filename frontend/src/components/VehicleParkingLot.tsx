import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useReservationSocket } from '../hooks/UseReservationSocket';

// RIP to anyone who has to deal with this

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
    this.theta = 0;
    if (this.velocity.dx || this.velocity.dy) {
      this.theta +=
        Math.atan2(this.velocity.dy, this.velocity.dx) + Math.PI / 2;
    }
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
    ctx.translate(-this.position.x, -this.position.y);
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
  id: number;
  color: string;
  parkingSpot: ParkingSpot | null;
  path: Position[] = [];
  onReachDestination: (() => void) | null = null;

  static PARKING_SPEED = 6;
  static THRESHOLD = 35;

  update(dt: number) {
    super.update(dt);
    if (this.path.length) {
      if (
        Math.sqrt(
          Math.pow(this.path[0].x - this.position.x, 2) +
            Math.pow(this.path[0].y - this.position.y, 2),
        ) <= Vehicle.THRESHOLD
      ) {
        const oldPath = this.path[0];
        this.path.shift();
        this.position = oldPath;
        if (!this.path.length) {
          this.velocity.dx = 0;
          this.velocity.dy = 0;
          if (this.onReachDestination) {
            this.onReachDestination();
            this.onReachDestination = null;
          }
        } else {
          const { x, y } = this.path[0];
          const dx = x - this.position.x;
          const dy = y - this.position.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          this.velocity.dx =
            (x - this.position.x) / (dist * Vehicle.PARKING_SPEED);
          this.velocity.dy =
            (y - this.position.y) / (dist * Vehicle.PARKING_SPEED);
        }
      }
    } else if (this.parkingSpot) {
      this.position = {
        x: this.parkingSpot.position.x + this.parkingSpot.dimensions.width / 2,
        y: this.parkingSpot.position.y + this.parkingSpot.dimensions.height / 2,
      };
    }
  }

  setPath(path: Position[], onReachDestination: () => void) {
    this.path = path;
    this.onReachDestination = onReachDestination;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { width, height } = this.dimension;
    this.initDraw(ctx, (ctx, position: Position) => {
      ctx.fillStyle = this.color;
      ctx.fillRect(position.x, position.y, width, height);
    });
  }

  constructor(
    position: Position,
    dimension: Dimension,
    color: string,
    id: number,
  ) {
    super(position, dimension, { dx: 0, dy: 0 }, 0, 0);
    this.id = id;
    this.color = color;
    this.parkingSpot = null;
  }
}

class ParkingLot extends Entity {
  parkingSections: ParkingSection[];
  parkingSpots: ParkingSpot[] = [];
  vehicles: Vehicle[] = [];

  draw(ctx: CanvasRenderingContext2D) {
    this.parkingSections.forEach((section) => section.draw(ctx));
    this.vehicles.forEach((vehicle) => vehicle.draw(ctx));
  }

  update(dt: number) {
    this.vehicles.forEach((vehicle) => {
      vehicle.update(dt);
    });
  }

  findVehicle(id: number): Vehicle | undefined {
    return this.vehicles.find((vehicle) => vehicle.id === id);
  }

  randomUnassignedParkingSpot(): ParkingSpot {
    const unassignedSpots = this.parkingSpots.filter(
      (parkingSpot) => !parkingSpot.occupied,
    );

    if (!unassignedSpots.length) {
      throw new Error('No unoccupied parking spots');
    }

    return unassignedSpots[Math.floor(Math.random() * unassignedSpots.length)];
  }

  gaps() {
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
    return gaps;
  }

  gapPoints() {
    return this.gaps()
      .map(({ start, end }) => {
        const y = (start + end) / 2;
        return [
          { x: this.position.x, y },
          { x: this.position.x + this.dimension.width, y },
        ];
      })
      .flat();
  }

  parkVehicle(vehicle: Vehicle, parkingSpot: ParkingSpot): Promise<void> {
    parkingSpot.occupied = true;
    vehicle.parkingSpot = parkingSpot;

    const yLevelEntrance = this.gapPoints()
      .map((x) => x.y)
      .reduce(
        (acc, y) => {
          const dist = Math.abs(y - parkingSpot.position.y);
          if (dist < acc.dist) {
            return { y, dist };
          }
          if (dist === acc.dist) {
            return { y: Math.max(y, acc.y), dist };
          }
          return acc;
        },
        { y: 0, dist: Infinity },
      ).y;
    return new Promise((resolve) => {
      vehicle.setPath(
        [
          vehicle.position,
          {
            x: vehicle.position.x,
            y: yLevelEntrance,
          },
          {
            x:
              parkingSpot.position.x +
              parkingSpot.dimensions.width / 2 +
              ((vehicle.position.x < parkingSpot.position.x ? -1 : 1) *
                vehicle.dimension.width) /
                3,
            y: yLevelEntrance,
          },
          {
            x: parkingSpot.position.x + parkingSpot.dimensions.width / 2,
            y: parkingSpot.position.y + parkingSpot.dimensions.height / 2,
          },
        ],
        resolve,
      );
    });
  }

  unParkVehicle(vehicle: Vehicle, exitPosition: Position): Promise<void> {
    if (!(vehicle.parkingSpot && vehicle.parkingSpot.occupied)) {
      throw new Error('Vehicle is not parked');
    }

    vehicle.parkingSpot.occupied = false;
    vehicle.parkingSpot = null;

    const exitPoint = this.gapPoints().reduce(
      (acc, point) => {
        const dist = Math.sqrt(
          Math.pow(point.x - exitPosition.x, 2) +
            Math.pow(point.y - vehicle.position.y, 2),
        );
        if (dist < acc.dist) {
          return { point, dist };
        }
        return acc;
      },
      { point: { x: 0, y: 0 }, dist: Infinity },
    ).point;
    return new Promise((resolve) => {
      vehicle.setPath(
        [
          vehicle.position,
          {
            x:
              vehicle.position.x +
              (exitPoint.x < vehicle.position.x ? 0.5 : -0.5) *
                vehicle.dimension.width,
            y: exitPoint.y,
          },
          {
            x: exitPosition.x,
            y: exitPoint.y,
          },
          exitPosition,
        ],
        resolve,
      );
    });
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
      } else if (singleSections) {
        buildSections(y, singleSections, doubleSections, true);
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
        for (
          let y = section.position.y;
          y <
          section.position.y +
            (section.doubleSection ? 2 : 1) * parkingSpotDimension.height;
          y += parkingSpotDimension.height
        ) {
          const { x } = section.position;
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
}

export interface Reservation {
  id: number;
  start: Date;
  end: Date;
  vehicle: {
    id: number;
    name: string;
  };
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

const CanvasDimensions: Dimension = {
  width: 1000,
  height: 700,
};

const VehicleDimensions: Dimension = {
  width: 50,
  height: 70,
};

export const VehicleParkingLot = () => {
  let isPaused = false;
  const [currentReservations, setCurrentReservations] = useState<Reservation[]>(
    [],
  );

  const saveCurrentReservation = (reservation: Reservation) => {
    setCurrentReservations((currentReservations: Reservation[]) => [
      ...(currentReservations.filter(
        (r: Reservation) => r.vehicle.id !== reservation.vehicle.id,
      ) ?? []),
      reservation,
    ]);
  };

  const removeCurrentReservation = (reservation: Reservation) => {
    setCurrentReservations((currentReservations: Reservation[]) =>
      currentReservations.filter(
        (r: Reservation) => r.vehicle.id !== reservation.vehicle.id,
      ),
    );
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const parkingLot = new ParkingLot(
    {
      width: CanvasDimensions.width - 200,
      height: CanvasDimensions.height,
    },
    {
      width: VehicleDimensions.width * 1.5,
      height: VehicleDimensions.height * (5 / 4),
    },
    {
      x: 100,
      y: 0,
    },
    [],
  );

  const randomExitPoint = (): Position => ({
    x:
      Math.random() * 2 > 1
        ? CanvasDimensions.width + VehicleDimensions.width
        : -VehicleDimensions.width,
    y: Math.random() * CanvasDimensions.height,
  });

  const { timeline } = useReservationSocket({
    onReservationStarted: (reservation: Reservation) => {
      saveCurrentReservation({
        ...reservation,
        start: new Date(reservation.start),
        end: new Date(reservation.end),
      });
      const referencedVehicle = parkingLot.findVehicle(reservation.vehicle.id);

      if (
        new Date(reservation.end).getTime() > Date.now() &&
        referencedVehicle?.parkingSpot
      ) {
        toast(`${reservation.vehicle.name} is being reserved`);
        parkingLot.unParkVehicle(referencedVehicle, randomExitPoint());
      }
    },
    onReservationEnded: (reservation: Reservation) => {
      const referencedVehicle = parkingLot.vehicles.find(
        (vehicle) => vehicle.id === reservation.vehicle.id,
      );

      if (referencedVehicle?.parkingSpot) {
        return;
      }
      toast(`${reservation.vehicle.name} is done being reserved`);
      removeCurrentReservation(reservation);

      if (referencedVehicle) {
        const onReachDestination = () => {
          parkingLot.parkVehicle(
            referencedVehicle,
            parkingLot.randomUnassignedParkingSpot(),
          );
        };
        if (referencedVehicle.path.length) {
          referencedVehicle.onReachDestination = onReachDestination;
        } else {
          onReachDestination();
        }
      }
    },
    onReservationSaved: (reservation: Reservation) => {
      setCurrentReservations((currentReservations) => {
        const referencedReservation = currentReservations.find(
          (r) => r.id === reservation.id,
        );
        if (
          referencedReservation &&
          referencedReservation.start.getTime() <
            new Date(reservation.start).getTime()
        ) {
          const vehicle = parkingLot.vehicles.find(
            (vehicle) => vehicle.id === referencedReservation.vehicle.id,
          );
          if (vehicle) {
            toast(
              `Reservation for vehicle ${reservation.vehicle} has been changed`,
            );
            parkingLot.parkVehicle(
              vehicle,
              parkingLot.randomUnassignedParkingSpot(),
            );
          }
          return currentReservations.filter((r) => r.id !== reservation.id);
        }
        return currentReservations;
      });
    },
  });

  useEffect(() => {
    fetch('/api/vehicles')
      .then((vehicleResponse) => vehicleResponse.json())
      .then((vehicles) => {
        const vehicleObjs = vehicles.map(
          (vehicle: { color: string; id: number }) =>
            new Vehicle(
              {
                x: 0,
                y: 0,
              },
              VehicleDimensions,
              vehicle.color,
              vehicle.id,
            ),
        );

        parkingLot.vehicles = vehicleObjs;
        Promise.all(
          parkingLot.vehicles.map((vehicle) => {
            const parkingSpot = parkingLot.randomUnassignedParkingSpot();
            vehicle.position = {
              ...randomExitPoint(),
              y: parkingSpot.position.y,
            };
            return parkingLot.parkVehicle(vehicle, parkingSpot);
          }),
        ).then(async () => {
          await fetch('/api/reservations/current')
            .then((resp) => resp.json())
            .then((reservations) =>
              reservations.forEach((reservation: Reservation) => {
                saveCurrentReservation({
                  ...reservation,
                  start: new Date(reservation.start),
                  end: new Date(reservation.end),
                });
                const referencedVehicle = parkingLot.findVehicle(
                  reservation.vehicle.id,
                );
                if (referencedVehicle) {
                  parkingLot.unParkVehicle(
                    referencedVehicle,
                    randomExitPoint(),
                  );
                }
              }),
            );
        });
      });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    let lastUpdate = Date.now();

    const draw = (ctx: CanvasRenderingContext2D) => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      ctx.fillStyle = '#495870';
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

      if (!isPaused) {
        update(delta);
      }

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

  useEffect(() => {
    window.onblur = () => (isPaused = true);
    window.onfocus = () => (isPaused = false);

    const updateReservationProgress = setInterval(() => {
      setCurrentReservations((reservations: Reservation[]) => [
        ...reservations,
      ]);
    }, 1000);

    return () => {
      clearInterval(updateReservationProgress);
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
      <div>
        {currentReservations.map((reservation: Reservation) => {
          return (
            <div key={reservation.id}>
              <div>{reservation.vehicle.name}</div>
              <div className="progress-bar">
                <div
                  className="progress-bar-filled"
                  style={{
                    width: `${Math.floor(
                      (100 * (Date.now() - reservation.start.getTime())) /
                        (reservation.end.getTime() -
                          reservation.start.getTime()),
                    )}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <canvas
        ref={canvasRef}
        width={CanvasDimensions.width}
        height={CanvasDimensions.height}
        style={{ border: '1px solid black' }}
      />

      <div style={{ height: '30%', overflow: 'scroll' }}>
        <div className="terminal-timeline">
          {timeline.map((event) => (
            <div className="terminal-card" key={Math.random() * 2000}>
              <header>{event.header}</header>
              <div>{event.message}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};