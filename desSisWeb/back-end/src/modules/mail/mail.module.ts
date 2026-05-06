import { Module, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail.service';

const MailProvider: Provider = {
  provide: MailService,
  useClass: MailService,
};

@Module({
  imports: [ConfigModule],
  providers: [MailProvider],
  exports: [MailProvider],
})
export class MailModule {}
