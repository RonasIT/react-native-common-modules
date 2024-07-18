import { Book } from '../models';
import { booksRawList } from './books-list';

export const booksMock = booksRawList.map((book) => new Book(book));
