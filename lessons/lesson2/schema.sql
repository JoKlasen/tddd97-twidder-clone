-- quick way of creating a database file given a sql script: sqlite3 database.db < schema.sql
CREATE TABLE contacts(
    name VARCHAR(120),
    number VARCHAR(20),
    PRIMARY KEY(number)
);