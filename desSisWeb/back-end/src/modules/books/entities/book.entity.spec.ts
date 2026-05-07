import { Books } from './book.entity';

describe('Books Entity', () => {
  it('should create a book with required fields', () => {
    const book = new Books({
      title: 'Clean Code',
      author: 'Robert Martin',
      isbn: '9780132350884',
    });

    expect(book.title).toBe('Clean Code');
    expect(book.author).toBe('Robert Martin');
    expect(book.isbn).toBe('9780132350884');
  });

  it('should have optional fields', () => {
    const book = new Books();
    expect(book.publisher).toBeUndefined();
    expect(book.cover_url).toBeUndefined();
    expect(book.description).toBeUndefined();
  });

  it('should extend BaseEntity', () => {
    const book = new Books();
    expect(book.id).toBeUndefined();
    expect(book.createdAt).toBeUndefined();
    expect(book.updatedAt).toBeUndefined();
  });
});
