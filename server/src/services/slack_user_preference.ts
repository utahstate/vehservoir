import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SlackUserVehicleTypePreference } from 'src/entities/slack_user_vehicle_type_preference';
import { Repository } from 'typeorm';

@Injectable()
export class SlackUserPreferenceService {
  constructor(
    @InjectRepository(SlackUserVehicleTypePreference)
    private userPreferenceRepo: Repository<SlackUserVehicleTypePreference>,
  ) {}

  async findOneBy(
    where: Record<string, any>,
    relations: Record<string, boolean>,
  ): Promise<SlackUserVehicleTypePreference> {
    return this.userPreferenceRepo.findOne({
      where,
      relations,
    });
  }

  async save(
    slackUserPreference: SlackUserVehicleTypePreference,
  ): Promise<SlackUserVehicleTypePreference> {
    return this.userPreferenceRepo.save(slackUserPreference);
  }
}
