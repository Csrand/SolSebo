import { Clube } from './clube.entity';

describe('Clube Entity', () => {
  it('should create club with name and description', () => {
    const clube = new Clube({
      name: 'Clube Clean Code',
      description: 'Estudo sobre clean code',
      creatorId: 1,
    });

    expect(clube.name).toBe('Clube Clean Code');
    expect(clube.creatorId).toBe(1);
    expect(clube.isActive).toBe(true);
  });

  it('should add member', () => {
    const clube = new Clube();
    clube.addMember(1);
    expect(clube.members).toContain(1);
  });

  it('should not add duplicate member', () => {
    const clube = new Clube();
    clube.addMember(1);
    clube.addMember(1); // Should not duplicate
    expect(clube.members).toEqual([1]); // Only one entry
  });
});
