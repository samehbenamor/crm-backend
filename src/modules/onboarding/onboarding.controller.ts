import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { SubmitOnboardingDto } from './dto/submit-onboarding.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { GetUser } from '../../common/decorators/user.decorator';
import { User } from '../../common/interfaces/user.interface';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  // onboarding.controller.ts (no changes needed)
@Post()
@UseGuards(SupabaseAuthGuard)
submitOnboarding(
  @Body() dto: SubmitOnboardingDto,
  @GetUser() user: User
) {
  return this.onboardingService.submitOnboarding(user.id, dto);
}

  @Get()
  @UseGuards(SupabaseAuthGuard)
  getOnboarding(@GetUser() user: User) {
    return this.onboardingService.getOnboarding(user.id);
  }
}