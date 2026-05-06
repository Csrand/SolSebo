import { User } from './user.entity';

describe('User Entity', () => {
  describe('verifyEmail', () => {
    it('should set status_validacao to true and clear verification tokens', () => {
      // RED: this test will fail initially because verifyEmail method doesn't exist yet
      const user = new User({
        username: 'testuser',
        email: 'test@test.com',
        senha_hash: 'hash',
        status_validacao: false,
        verification_token: 'somehash',
        verification_token_expires: new Date(),
      });

      user.verifyEmail();

      expect(user.status_validacao).toBe(true);
      expect(user.verification_token).toBeNull();
      expect(user.verification_token_expires).toBeNull();
    });
  });

  describe('setRecoveryToken', () => {
    it('should set recovery token and expiration', () => {
      // RED: this test will fail initially
      const user = new User();
      const token = 'recoveryhash';
      const expires = new Date(Date.now() + 3600000); // 1 hour

      user.setRecoveryToken(token, expires);

      expect(user.recovery_token).toBe(token);
      expect(user.token_expires).toEqual(expires);
    });
  });

  describe('resetPassword', () => {
    it('should update password hash and clear recovery token', () => {
      // RED: this test will fail initially
      const user = new User({
        recovery_token: 'oldhash',
        token_expires: new Date(),
      });

      user.resetPassword('newhash');

      expect(user.senha_hash).toBe('newhash');
      expect(user.recovery_token).toBeNull();
      expect(user.token_expires).toBeNull();
    });
  });

  describe('new fields', () => {
    it('should have verification_token field', () => {
      const user = new User();
      expect(user.verification_token).toBeUndefined();
    });

    it('should have verification_token_expires field', () => {
      const user = new User();
      expect(user.verification_token_expires).toBeUndefined();
    });
  });
});
