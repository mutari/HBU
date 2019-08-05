CREATE TABLE profile (
    UserID int,
    Username varchar(255),
    Password varchar(255),
    Name varchar(255),
    Usericon varchar(255),
    Email varchar(255)
);

/*
    insert a new profile into the databas
*/
INSERT INTO profile (UserId, Name, Username, Password, Email) VALUES (?, ?, ?, ?, ?)

SELECT * FROM profile WHERE Username = ?


CREATE TABLE following (
    MainUser int,
    FolowingUser int
);

CREATE TABLE post (
    PosterID int,
    Image varchar(255),
    Text varchar(255),
    Likes int
);