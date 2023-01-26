CREATE TABLE users (
    email VARCHAR(30) PRIMARY KEY,
    firstName VARCHAR(30),
    surName VARCHAR(30),
    gender VARCHAR(10),
    city VARCHAR(30),
    country VARCHAR(30)
);

CREATE TABLE messages (
    email VARCHAR(30),
    messageNo INTEGER,
    fromEmail VARCHAR(30),
    content VARCHAR(300),

    CONSTRAINT PRIMARY KEY (email, messageNo),
    CONSTRAINT FOREIGN KEY (email) REFERENCES users(email)
);

CREATE TABLE loggedInUsers (
    token VARCHAR(36),
    email VARCHAR(30) PRIMARY KEY,

    CONSTRAINT FOREIGN KEY (email) REFERENCES users(email)
);

CREATE TABLE shadow (
    email VARCHAR(30) PRIMARY KEY,
    pass VARCHAR(30),

    CONSTRAINT FOREIGN KEY (email) REFERENCES users(email)
)

INSERT INTO user VALUES
('test@test.test', 'test', 'test', 'Male', 'test', 'test',),
('johan@me.se', 'Johan', 'Klasén', 'Male', 'Linköping', 'Sweden'),
('wilvo@me.se', 'Wilhelm', 'von Kantzow', 'Male', 'Linköping', 'Sweden'),
('bo@bob.com', 'Bo', 'Bosson', 'Other', 'Byboda', 'Svärje');

INSERT INTO shadow VALUES
('test@test.test', 'test'),
('johan@me.se', 'pass123'),
('wilvo@me.se', 'asd123'),
('bo@bob.com', 'volvo240');

INSERT INTO messages VALUES
('johan@me.se', 0, 'johan@me.se', 'First!'),
('test@test.test', 0, 'test@test.test', 'test')
('wilvo@me.se', 0, 'johan@me.se', 'Tja fan!'),
('johan@me.se', 1, 'wilvo@me.se', 'Hej kompis!');