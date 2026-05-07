import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
  }),
}));

describe('MailService', () => {
  let service: MailService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                SMTP_HOST: 'smtp.gmail.com',
                SMTP_PORT: 587,
                SMTP_USER: 'test@gmail.com',
                SMTP_PASS: 'password',
                SMTP_FROM: 'noreply@solsebo.com',
                FRONTEND_URL: 'http://localhost:5173',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendVerificationEmail', () => {
    it('should call sendMail with verification link', async () => {
      const sendMailMock = (nodemailer.createTransport() as any).sendMail;
      const email = 'test@test.com';
      const token = 'verification-token-123';

      await service.sendVerificationEmail(email, token);

      expect(nodemailer.createTransport).toHaveBeenCalled();
      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          to: email,
          subject: expect.stringContaining('Verificação'),
          html: expect.stringContaining(token),
        }),
      );
    });
  });

  describe('sendRecoveryEmail', () => {
    it('should call sendMail with recovery link', async () => {
      const sendMailMock = (nodemailer.createTransport() as any).sendMail;
      const email = 'test@test.com';
      const token = 'recovery-token-456';

      await service.sendRecoveryEmail(email, token);

      expect(nodemailer.createTransport).toHaveBeenCalled();
      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          to: email,
          subject: expect.stringContaining('Recuperação'),
          html: expect.stringContaining(token),
        }),
      );
    });
  });
});
