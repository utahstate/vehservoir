import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { ToastContainerProps } from 'react-toastify/dist/types';
import { useReservationSocket } from '../hooks/UseReservationSocket';
import { VehicleData } from '../pages/admin/Vehicles';

/*
 _____
/     \
vvvvvvv  /|__/|
   I   /O,O   |
   I /_____   |      /|/|
  J|/^ ^ ^ \  |    /00  |    _//|
   |^ ^ ^ ^ |W|   |/^^\ |   /oo |
   \m___m__|_|    \m_m_|   \mm_|
*/

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
    for (let xi = x; xi <= x + width; xi += Math.floor(width / this.spots)) {
      line(ctx, xi, y, xi, y + height);
    }

    if (this.doubleSection) {
      line(ctx, x, y + height / 2, x + width, y + height / 2);
    }
  }
}

class Vehicle extends Entity {
  id: number;
  name: string;
  color: string;
  parkingSpot: ParkingSpot | null;
  path: Position[] = [];
  onReachDestination: (() => void) | null = null;

  static SPEED = 0.25;
  static THRESHOLD = 35;
  static FONT_FACE = 'var(--font-stack)';

  update(dt: number) {
    super.update(dt);
    if (this.path.length) {
      if (
        Math.sqrt(
          Math.pow(this.path[0].x - this.position.x, 2) +
            Math.pow(this.path[0].y - this.position.y, 2),
        ) <= Vehicle.THRESHOLD // Snaps to destination when we get close
      ) {
        const oldPath = this.path[0];
        this.path.shift();
        this.position = oldPath; // Further exploration to previous position just in case we've overshot
        if (!this.path.length) {
          // We've reached the destination - stop moving
          this.velocity.dx = 0;
          this.velocity.dy = 0;
          if (this.onReachDestination) {
            this.onReachDestination(); // Resolve the promise
            this.onReachDestination = null;
          }
        } else {
          const { x, y } = this.path[0];
          const dx = x - this.position.x;
          const dy = y - this.position.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          this.velocity.dx = (x - this.position.x) / (dist / Vehicle.SPEED);
          this.velocity.dy = (y - this.position.y) / (dist / Vehicle.SPEED);
        }
      }
    } else if (this.parkingSpot) {
      // Snap to the middle of the parking spot
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
      ctx.fillStyle = getBrightness(this.color) > 127 ? 'black' : 'white';

      const lines = this.name.split(' ');

      ctx.font = `1px ${Vehicle.FONT_FACE}`;
      const fontSize =
        (this.dimension.width - 10) /
        lines.reduce(
          (acc, line) => Math.max(ctx.measureText(line).width, acc),
          -Infinity,
        );
      ctx.font = `${fontSize}px ${Vehicle.FONT_FACE}`;

      ctx.textAlign = 'center';

      ctx.fillStyle = getBrightness(this.color) > 127 ? 'black' : 'white';
      lines.forEach((line, i) => {
        const [x, y] = [
          position.x + this.dimension.width / 2,
          position.y +
            this.dimension.height / 2 +
            (i - (lines.length - 1) / 2) * fontSize,
        ];

        ctx.fillText(line, x, y);
      });
    });
  }

  constructor(
    position: Position,
    dimension: Dimension,
    color: string,
    id: number,
    name: string,
  ) {
    super(position, dimension, { dx: 0, dy: 0 }, 0, 0);
    this.id = id;
    this.color = color;
    this.parkingSpot = null;
    this.name = name;
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
    // Finds the y-level gaps in the parking spot between parking sections
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
    // Calculates the midpoint of each gap
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

    // Find the y level to the closest gap to the parking spot - this will be the
    // entrance for the vehicle to park
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
      // Create a path to follow
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
                3, // Add a cute "turn" before getting into the parking spot
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

    // Find the midpoint of the y-level gap closest to the parking lot - this will
    // be the exit point
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
                vehicle.dimension.width, // Add a cute "backing out" animation
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
    // Creates the optimal parking lot layout to maximize parking spaces.
    const parkingSections: ParkingSection[] = [];

    const maxParkingRows = Math.floor(height / parkingSpotHeight);
    const spots = Math.floor(width / parkingSpotWidth);

    const numDividers = Math.ceil(maxParkingRows / 3);
    const dividerHeight =
      (height - maxParkingRows * parkingSpotHeight) / numDividers +
      parkingSpotHeight;

    const buildSections = (
      y: number,
      singleSections: number,
      doubleSections: number,
      placeSingle = true,
    ): void => {
      // Here be magic.
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

    // Calculate individual parking spot dimensions and positions, construct a ParkingSpot,
    // add to the parkingSpots array
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

const toastParams: ToastContainerProps = {
  theme: 'colored',
  position: 'bottom-right',
};

const CanvasDimensions: Dimension = {
  width: 1300,
  height: 1000,
};

const VehicleDimensions: Dimension = {
  width: 120,
  height: 160,
};

const getBrightness = (hexColor: string) => {
  const hexValue = parseInt(hexColor.split('#')[1], 16);
  const [r, g, b] = [
    (hexValue >>> 16) & parseInt('FF', 16),
    (hexValue >>> 8) & parseInt('FF', 16),
    hexValue & parseInt('FF', 16),
  ];
  return Math.round((r * 299 + g * 587 + b * 114) / 1000);
};

export const VehicleParkingLot = () => {
  let isPaused = false;
  const [currentReservations, setCurrentReservations] = useState<Reservation[]>(
    [],
  );
  // Map from color hex to type name
  const [colorLegend, setColorLegend] = useState<Record<string, string>>({});
  const messagesRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const saveCurrentReservation = (reservation: Reservation) => {
    // Overwrites the previous reservation with the same vehicle id
    setCurrentReservations((currentReservations: Reservation[]) => [
      ...(currentReservations.filter(
        (r: Reservation) => r.vehicle.id !== reservation.vehicle.id,
      ) ?? []),
      reservation,
    ]);
  };

  const removeCurrentReservation = (reservation: Reservation) => {
    // Removes the current reservation with the same vehicle id
    setCurrentReservations((currentReservations: Reservation[]) =>
      currentReservations.filter(
        (r: Reservation) => r.vehicle.id !== reservation.vehicle.id,
      ),
    );
  };

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
        // Ensure we are not unparking a vehicle if the reservation is already over
        toast.info(
          `${reservation.vehicle.name} has a current reservation`,
          toastParams,
        );
        parkingLot.unParkVehicle(referencedVehicle, randomExitPoint());
      }
    },
    onReservationEnded: (reservation: Reservation) => {
      const referencedVehicle = parkingLot.vehicles.find(
        (vehicle) => vehicle.id === reservation.vehicle.id,
      );

      if (referencedVehicle?.parkingSpot) {
        // No need to re-park a vehicle if it's already parked
        return;
      }
      toast.info(
        `${reservation.vehicle.name} is no longer reserved`,
        toastParams,
      );
      removeCurrentReservation(reservation);

      if (referencedVehicle) {
        const onReachDestination = () => {
          parkingLot.parkVehicle(
            referencedVehicle,
            parkingLot.randomUnassignedParkingSpot(),
          );
        };
        if (referencedVehicle.path.length) {
          // We will wait until the current path is done being traveled by the vehicle before
          // directing it back to the new parking spot
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
          // We will only remove the reservation if the new start time for it is in the future -
          // the server will send us a reservationStarted when it is started again
          const vehicle = parkingLot.vehicles.find(
            (vehicle) => vehicle.id === referencedReservation.vehicle.id,
          );
          if (vehicle && !vehicle.parkingSpot) {
            toast.info(
              `Reservation for vehicle ${reservation.vehicle.name} has been changed`,
              toastParams,
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
        parkingLot.vehicles = vehicles.map((vehicle: VehicleData) => {
          setColorLegend((colorLegend) => {
            colorLegend[vehicle.type.color] = vehicle.type.name;
            return { ...colorLegend };
          });
          return new Vehicle(
            {
              x: 0,
              y: 0,
            },
            VehicleDimensions,
            vehicle.type.color,
            vehicle.id || 0,
            vehicle.name,
          );
        });

        // Wait until all vehicles are done parking before we do any reservation stuffs
        Promise.all(
          parkingLot.vehicles.map((vehicle) => {
            const parkingSpot = parkingLot.randomUnassignedParkingSpot();
            vehicle.position = {
              ...randomExitPoint(),
              y: parkingSpot.position.y,
            };
            return parkingLot.parkVehicle(vehicle, parkingSpot);
          }),
        ).then(() => {
          fetch('/api/reservations/current')
            .then((resp) => resp.json())
            .then((reservations) =>
              reservations.forEach((reservation: Reservation) => {
                toast.info(
                  `${reservation.vehicle.name} has a current reservation`,
                  toastParams,
                );
                saveCurrentReservation({
                  ...reservation,
                  // We will get a string from the backend for the start and end dates -
                  // cast them to Date's
                  start: new Date(reservation.start),
                  end: new Date(reservation.end),
                });
                const referencedVehicle = parkingLot.findVehicle(
                  reservation.vehicle.id,
                );
                if (referencedVehicle) {
                  // Send them to the ranch!
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
      // "game" loop
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
      // No need to render the canvas after the component unmounts
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useEffect(() => {
    // Pause the visualization when we change tabs to remove "jerk" effects (it would still be
    // updating in the background)

    window.onblur = () => (isPaused = true);
    window.onfocus = () => (isPaused = false);

    // Update the reservation progress bars every second by forcing a useState change
    const updateReservationProgress = setInterval(() => {
      setCurrentReservations((reservations: Reservation[]) => [
        ...reservations,
      ]);
    }, 1000);

    return () => {
      // Cleanup the interval after the component unmounts
      clearInterval(updateReservationProgress);
    };
  }, []);

  useEffect(() => {
    // Scroll to the bottom of messages when it changes
    if (messagesRef.current) {
      messagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [timeline]);

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
      <>
        {currentReservations.map((reservation: Reservation) => {
          return (
            <div key={reservation.id}>
              {reservation.vehicle.name}&apos;s reservation will end in
              <span style={{ color: 'green' }}>
                {' ' +
                  new Date(reservation.end.getTime() - Date.now())
                    .toISOString()
                    .substring(11, 19)}
              </span>
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
      </>

      <canvas
        ref={canvasRef}
        width={CanvasDimensions.width}
        height={CanvasDimensions.height}
        style={{ border: '1px solid black' }}
      />

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {Object.keys(colorLegend).map((key) => {
          const value = colorLegend[key];
          return (
            <div
              key={key}
              style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}
            >
              <div
                style={{ width: '1rem', height: '1rem', background: key }}
              ></div>
              <span>{value}</span>
            </div>
          );
        })}
      </div>

      {timeline.length ? (
        <div style={{ height: '20vh', overflow: 'scroll' }}>
          <div className="terminal-timeline">
            {timeline.map((event) => (
              <div className="terminal-card" key={event.eventId}>
                <header>{event.header}</header>
                <div>{event.message}</div>
              </div>
            ))}
          </div>
          <div style={{ float: 'left', clear: 'both' }} ref={messagesRef}></div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};
