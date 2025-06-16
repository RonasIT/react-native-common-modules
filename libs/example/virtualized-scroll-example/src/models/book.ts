export class Book {
  public isbn: string;
  public title: string;
  public pageCount: number;
  public shortDescription: string;
  public authors: Array<string>;

  constructor(model: Partial<Book> = {}) {
    Object.assign(this, model);
  }
}
