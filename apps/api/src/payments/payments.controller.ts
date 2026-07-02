import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Post,
  type RawBodyRequest,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtPayload, UserRole } from '@food-delivery/types';

type AuthRequest = ExpressRequest & { user: JwtPayload };

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('intent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  createIntent(
    @Request() req: AuthRequest,
    @Body() dto: CreatePaymentIntentDto,
  ) {
    return this.paymentsService.createPaymentIntent(dto.orderId, req.user.sub);
  }

  @Post('webhook')
  @HttpCode(200) // Stripe expects 200 — any other status triggers a retry
  handleWebhook(
    @Request() req: RawBodyRequest<ExpressRequest>,
    @Headers('stripe-signature') signature: string,
  ) {
    // req.rawBody is the raw Buffer — required for webhook signature verification
    // this only works because we enabled rawBody: true in main.ts
    return this.paymentsService.handleWebhook(req.rawBody!, signature);
  }
}
