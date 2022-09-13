export interface VehicleCreationDto {
  name: string,
  type: {
    name: string,
    new: boolean,
  },
};