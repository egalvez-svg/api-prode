import { Module } from '@nestjs/common';
import { InviteCodesService } from './invite-codes.service';
import { InviteCodesController } from './invite-codes.controller';
import { InviteCodesRepository } from './invite-codes.repository';

@Module({
  controllers: [InviteCodesController],
  providers: [InviteCodesService, InviteCodesRepository],
  exports: [InviteCodesService],
})
export class InviteCodesModule {}
