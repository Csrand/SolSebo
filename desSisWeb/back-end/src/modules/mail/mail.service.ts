import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transport: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transport = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const verificationLink = `${frontendUrl}/verify-email/${token}`;

    await this.transport.sendMail({
      from: this.configService.get<string>('SMTP_FROM'),
      to: email,
      subject: 'Verificação de E-mail - SolSebo',
      html: `
        <h1>Bem-vindo ao SolSebo!</h1>
        <p>Por favor, verifique seu e-mail clicando no link abaixo:</p>
        <a href="${verificationLink}">Verificar E-mail</a>
        <p>Ou copie e cole este link no seu navegador: ${verificationLink}</p>
        <p>Este link expira em 24 horas.</p>
      `,
    });
  }

  async sendRecoveryEmail(email: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const recoveryLink = `${frontendUrl}/reset-password/${token}`;

    await this.transport.sendMail({
      from: this.configService.get<string>('SMTP_FROM'),
      to: email,
      subject: 'Recuperação de Senha - SolSebo',
      html: `
        <h1>Recuperação de Senha</h1>
        <p>Você solicitou a recuperação de senha. Clique no link abaixo para redefinir:</p>
        <a href="${recoveryLink}">Redefinir Senha</a>
        <p>Ou copie e cole este link no seu navegador: ${recoveryLink}</p>
        <p>Este link expira em 1 hora.</p>
        <p>Se você não solicitou esta recuperação, ignore este e-mail.</p>
      `,
    });
  }
}
