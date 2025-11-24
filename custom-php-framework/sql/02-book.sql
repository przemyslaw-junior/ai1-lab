CREATE TABLE  IF NOT EXISTS book(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    year INTEGER NOT NULL
);

INSERT INTO book(title, author, year)
VALUES ('Wiedźmin', 'Andrzej Sapkowski', 1994),
       ('Solaris', 'Stanisław Lem', 1961),
       ('The Hobbit or There and Back Again', 'J.R.R. Tolkien', 1937);
