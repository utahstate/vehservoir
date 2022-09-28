import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'src/entities/request';
import { Repository } from 'typeorm';

@Injectable()
export class SlackRequestService {
  constructor(
    @InjectRepository(Request) private slackRequestRepo: Repository<Request>,
  ) {}

  async save(request: Partial<Request>) {
    return this.slackRequestRepo.save(request);
  }
}
