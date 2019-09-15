/*
    /usr/local/mysql/bin/mysql -uroot -p
    phi001_tee_880
*/

/*
    to uppadte and add an profile image
    UPDATE profile SET Usericon = (?) WHERE UserID = (?);
*/

/*drop everything and reset*/
DROP TABLE profile;
DROP TABLE following;
DROP TABLE post;

CREATE TABLE profile (
    UserID int,
    Username varchar(255),
    Password varchar(255),
    Name varchar(255),
    Usericon varchar(255),
    UsericonData varchar(255),
    Email varchar(255),
    DateCreated datetime
);

/*
    insert a new profile into the databas
*/
/*INSERT INTO profile (UserId, Name, Username, Password, Email) VALUES (?, ?, ?, ?, ?);*/

/*insert a test porfile*/
INSERT INTO profile (UserId, Name, Username, Password, Email, DateCreated) VALUES (1, 'Philip', 'Mutari', '123', 'pjohansson76@yahoo.com', NOW());
INSERT INTO profile (UserId, Name, Username, Password, Email, DateCreated) VALUES (2, 'PhilipBeta', 'Philip76', '123', 'ejohansson76@yahoo.com', NOW());

/*SELECT * FROM profile WHERE Username = ?;*/

/*
    MainUser the person how is folowing somone
    FolowingUser the person the MainUser is folowing
*/
CREATE TABLE following (
    MainUser int,
    FolowingUser int
);

INSERT INTO following (MainUser, FolowingUser) VALUES (1, 2);




CREATE TABLE post (
    PosterID int,
    Image varchar(255),
    ImageData varchar(255),
    Text varchar(255),
    Likes int,
    DatePosted datetime
);

/*test insert*/
INSERT INTO post (PosterID, Image, Text, Likes, DatePosted) VALUES (1, '', 'This is my test image posted by mutari', 10, NOW());

/*insert into post*/
/*INSERT INTO post (PosterID, Image, Text, Likes, DatePosted) VALUES (?, ?, ?, ?, ?);*/
