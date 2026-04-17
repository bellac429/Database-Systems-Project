CREATE SCHEMA JobApplications;
USE JobApplications;

-- USER (base account table)
CREATE TABLE User (
    userID      INT             NOT NULL AUTO_INCREMENT,
    address     VARCHAR(255),
    email       VARCHAR(255)    NOT NULL UNIQUE,
    phone       VARCHAR(20),
    PRIMARY KEY (userID)
);

-- STUDENT (extends User)
CREATE TABLE Student (
    userID      INT             NOT NULL,
    firstName   VARCHAR(100)    NOT NULL,
    lastName    VARCHAR(100)    NOT NULL,
    year        INT,
    dob         DATE,
    gpa         DECIMAL(3, 2),
    major       VARCHAR(100),
    PRIMARY KEY (userID),
    FOREIGN KEY (userID) REFERENCES User(userID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- COMPANY (extends User)
CREATE TABLE Company (
    userID      INT             NOT NULL,
    companyName VARCHAR(255)    NOT NULL,
    PRIMARY KEY (userID),
    FOREIGN KEY (userID) REFERENCES User(userID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- RESUME
CREATE TABLE Resume (
    resumeID        INT             NOT NULL AUTO_INCREMENT,
    userID          INT             NOT NULL,
    fileName        VARCHAR(255)    NOT NULL,
    dateUploaded    DATE            NOT NULL,
    PRIMARY KEY (resumeID),
    FOREIGN KEY (userID) REFERENCES User(userID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- LISTING
CREATE TABLE Listing (
    listingID       INT             NOT NULL AUTO_INCREMENT,
    postDate        DATETIME        NOT NULL,
    dateDue         DATETIME        NOT NULL,
    description     VARCHAR(1000),
    externalLink    VARCHAR(100),
    PRIMARY KEY (listingID)
);

-- COMPANY_LISTINGS (associates a Company with a Listing)
CREATE TABLE Company_Listings (
    userID      INT     NOT NULL,
    listingID   INT     NOT NULL,
    PRIMARY KEY (userID, listingID),
    FOREIGN KEY (userID)    REFERENCES Company(userID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (listingID) REFERENCES Listing(listingID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- LISTING_QUESTIONS
CREATE TABLE Listing_Questions (
    questionID      INT     NOT NULL AUTO_INCREMENT,
    listingID       INT     NOT NULL,
    questionText    TEXT    NOT NULL,
    PRIMARY KEY (questionID),
    FOREIGN KEY (listingID) REFERENCES Listing(listingID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- APPLICATION
CREATE TABLE Application (
    applicationID   INT             NOT NULL AUTO_INCREMENT,
    userID          INT             NOT NULL,
    listingID       INT             NOT NULL,
    resumeID        INT             NOT NULL,
    status          VARCHAR(50)     NOT NULL
                        CHECK (status IN ('draft', 'submitted', 'responded')),
    createTime      DATETIME        NOT NULL,
    submitTime      DATETIME,
    PRIMARY KEY (applicationID),
    FOREIGN KEY (userID)    REFERENCES User(userID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (listingID) REFERENCES Listing(listingID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (resumeID)  REFERENCES Resume(resumeID)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- APPLICATION_ANSWERS
CREATE TABLE Application_Answers (
    answerID        INT     NOT NULL AUTO_INCREMENT,
    applicationID   INT     NOT NULL,
    questionID      INT     NOT NULL,
    answerText      TEXT,
    PRIMARY KEY (answerID),
    FOREIGN KEY (applicationID) REFERENCES Application(applicationID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (questionID)    REFERENCES Listing_Questions(questionID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- STUDENT_SKILLS
CREATE TABLE Student_Skills (
    userID  INT             NOT NULL,
    skill   VARCHAR(100)    NOT NULL,
    PRIMARY KEY (userID, skill),
    FOREIGN KEY (userID) REFERENCES Student(userID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


-- AUTHORIZATION (GRANT statements by role)

-- NOTE: Execute the CREATE USER / role setup for environment
-- before running these GRANTs.


-- ---- STUDENT role ----
GRANT SELECT, UPDATE ON User TO 'role_student';

-- Student: SELECT all rows (needed for profile reads); UPDATE own row
GRANT SELECT, UPDATE ON Student TO 'role_student';

-- Company: SELECT only (view company info)
GRANT SELECT ON Company TO 'role_student';

-- Resume: SELECT, INSERT, UPDATE, DELETE own rows
GRANT SELECT, INSERT, UPDATE, DELETE ON Resume TO 'role_student';

-- Application: SELECT, INSERT, DELETE own; UPDATE limited to draft stage
GRANT SELECT, INSERT, UPDATE, DELETE ON Application TO 'role_student';

-- Listing: SELECT only
GRANT SELECT ON Listing TO 'role_student';

-- Student_Skills: full control over own rows
GRANT SELECT, INSERT, UPDATE, DELETE ON Student_Skills TO 'role_student';

-- Application_Answers: full control before submission
GRANT SELECT, INSERT, UPDATE, DELETE ON Application_Answers TO 'role_student';

-- Listing_Questions: SELECT only
GRANT SELECT ON Listing_Questions TO 'role_student';

-- Company_Listings: SELECT only
GRANT SELECT ON Company_Listings TO 'role_student';

-- ---- COMPANY role ----
-- User: SELECT own row; UPDATE own row
GRANT SELECT, UPDATE ON User TO 'role_company';

-- Student: SELECT (view candidate profiles)
GRANT SELECT ON Student TO 'role_company';

-- Company: SELECT own; UPDATE own
GRANT SELECT, UPDATE ON Company TO 'role_company';

-- Resume: SELECT (read-only when reviewing applications)
GRANT SELECT ON Resume TO 'role_company';

-- Application: SELECT (applications to own listings); UPDATE (status changes)
GRANT SELECT, UPDATE ON Application TO 'role_company';

-- Listing: SELECT, INSERT, UPDATE, DELETE own listings
GRANT SELECT, INSERT, UPDATE, DELETE ON Listing TO 'role_company';

-- Student_Skills: SELECT (view candidate skills)
GRANT SELECT ON Student_Skills TO 'role_company';

-- Application_Answers: SELECT (for applications to own listings)
GRANT SELECT ON Application_Answers TO 'role_company';

-- Listing_Questions: SELECT, INSERT, UPDATE, DELETE own listing questions
GRANT SELECT, INSERT, UPDATE, DELETE ON Listing_Questions TO 'role_company';

-- Company_Listings: SELECT, INSERT, UPDATE, DELETE own rows
GRANT SELECT, INSERT, UPDATE, DELETE ON Company_Listings TO 'role_company';

-- ---- ADMIN role ----
GRANT SELECT, INSERT, UPDATE, DELETE ON User                 TO 'role_admin';
GRANT SELECT, INSERT, UPDATE, DELETE ON Student              TO 'role_admin';
GRANT SELECT, INSERT, UPDATE, DELETE ON Company              TO 'role_admin';
GRANT SELECT, INSERT, UPDATE, DELETE ON Resume               TO 'role_admin';
GRANT SELECT, INSERT, UPDATE, DELETE ON Application          TO 'role_admin';
GRANT SELECT, INSERT, UPDATE, DELETE ON Listing              TO 'role_admin';
GRANT SELECT, INSERT, UPDATE, DELETE ON Student_Skills       TO 'role_admin';
GRANT SELECT, INSERT, UPDATE, DELETE ON Application_Answers  TO 'role_admin';
GRANT SELECT, INSERT, UPDATE, DELETE ON Listing_Questions    TO 'role_admin';
GRANT SELECT, INSERT, UPDATE, DELETE ON Company_Listings     TO 'role_admin';


-- ============================================================
-- SEED DATA
-- ============================================================
 
-- User rows
INSERT INTO User (address, email, phone) VALUES
-- students
('123 Elm St, Iowa City, IA',       'alice.johnson@email.com',   '319-555-0101'),
('456 Oak Ave, Iowa City, IA',      'bob.martinez@email.com',    '319-555-0102'),
('789 Pine Rd, Coralville, IA',     'carol.lee@email.com',       '319-555-0103'),
('321 Maple Ln, North Liberty, IA', 'david.kim@email.com',       '319-555-0104'),
('654 Cedar Blvd, Iowa City, IA',   'emily.chen@email.com',      '319-555-0105'),
-- companies
('100 Corporate Dr, Chicago, IL',   'recruit@techcorp.com',      '312-555-0201'),
('200 Business Park, Austin, TX',   'hr@innovateinc.com',        '512-555-0202'),
('300 Startup Way, San Francisco, CA', 'jobs@nextstep.io',       '415-555-0203'),
('400 Enterprise Blvd, Seattle, WA', 'careers@cloudworks.com',   '206-555-0204'),
('500 Commerce St, New York, NY',   'talent@apexsolutions.com',  '212-555-0205');
 
-- ------------------------------------------------------------
-- Student
-- ------------------------------------------------------------
INSERT INTO Student (userID, firstName, lastName, year, dob, gpa, major) VALUES
(1, 'Alice',  'Johnson', 3, '2002-04-15', 3.85, 'Computer Science'),
(2, 'Bob',    'Martinez',4, '2001-09-22', 3.42, 'Electrical Engineering'),
(3, 'Carol',  'Lee',     2, '2003-01-30', 3.91, 'Data Science'),
(4, 'David',  'Kim',     4, '2001-06-11', 3.10, 'Information Systems'),
(5, 'Emily',  'Chen',    1, '2004-03-05', 3.75, 'Computer Science');
 
-- Company
INSERT INTO Company (userID, companyName) VALUES
(6,  'TechCorp'),
(7,  'Innovate Inc.'),
(8,  'NextStep'),
(9,  'CloudWorks'),
(10, 'Apex Solutions');
 
-- Resume
INSERT INTO Resume (userID, fileName, dateUploaded) VALUES
(1, 'alice_johnson_resume_v1.pdf',  '2024-12-01'),
(1, 'alice_johnson_resume_v2.pdf',  '2025-01-10'),
(2, 'bob_martinez_resume.pdf',      '2024-11-20'),
(3, 'carol_lee_resume.pdf',         '2025-02-05'),
(4, 'david_kim_resume_2025.pdf',    '2025-01-15'),
(5, 'emily_chen_resume.pdf',        '2025-03-01');
 
-- Listing
INSERT INTO Listing (postDate, dateDue, description, externalLink) VALUES
('2025-01-05 08:00:00', '2025-03-01 23:59:59',
 'Software Engineering Intern – Build scalable backend services using Python and AWS.',
 'https://techcorp.com/careers/swe-intern'),
('2025-01-10 09:00:00', '2025-03-15 23:59:59',
 'Data Analyst Intern – Analyze product metrics and build dashboards in Tableau.',
 'https://innovateinc.com/jobs/data-analyst'),
('2025-02-01 10:00:00', '2025-04-01 23:59:59',
 'Full Stack Developer – React + Node.js for a fast-growing SaaS startup.',
 'https://nextstep.io/jobs/fullstack'),
('2025-02-10 08:30:00', '2025-04-15 23:59:59',
 'Cloud Infrastructure Intern – Terraform, Kubernetes, and GCP experience preferred.',
 'https://cloudworks.com/careers/cloud-intern'),
('2025-02-20 09:00:00', '2025-04-30 23:59:59',
 'Business Analyst – Requirements gathering, SQL reporting, and stakeholder communication.',
 'https://apexsolutions.com/jobs/ba');
 
-- Company_Listings
INSERT INTO Company_Listings (userID, listingID) VALUES
(6,  1),
(7,  2),
(8,  3),
(9,  4),
(10, 5);
 
-- Listing_Questions (at least 1 per listing, 5+ rows total)
INSERT INTO Listing_Questions (listingID, questionText) VALUES
(1, 'Example question 1.'),
(1, 'E2'),
(2, 'E3?'),
(3, 'E4.'),
(3, 'E5?'),
(4, 'E5.'),
(5, 'E6.');
 
-- Application
INSERT INTO Application (userID, listingID, resumeID, status, createTime, submitTime) VALUES
(1, 1, 1, 'submitted', '2025-01-20 10:00:00', '2025-01-21 14:30:00'),
(1, 3, 2, 'responded', '2025-02-05 09:15:00', '2025-02-06 11:00:00'),
(2, 2, 3, 'submitted', '2025-01-25 13:00:00', '2025-01-26 09:45:00'),
(3, 1, 4, 'draft',     '2025-02-10 16:00:00', NULL),
(4, 4, 5, 'submitted', '2025-02-20 08:30:00', '2025-02-21 10:00:00'),
(5, 5, 6, 'responded', '2025-03-01 11:00:00', '2025-03-02 14:00:00');
 
-- Application_Answers
INSERT INTO Application_Answers (applicationID, questionID, answerText) VALUES
-- App 1 (Alice -> TechCorp listing 1)
(1, 1, 'Example answer.'),
(1, 2, 'Example answer 2.'),
-- App 2 (Alice -> NextStep listing 3)
(2, 4, 'Example answer 3'),
(2, 5, 'Example answer 4.'),
-- App 3 (Bob -> Innovate Inc. listing 2)
(3, 3, 'Example answer 5.'),
-- App 5 (David -> CloudWorks listing 4)
(5, 6, 'Example answer 6.'),
-- App 6 (Emily -> Apex listing 5)
(6, 7, 'Example answer 7.');
 
-- Student_Skills
INSERT INTO Student_Skills (userID, skill) VALUES
(1, 'Python'),
(1, 'React'),
(1, 'SQL'),
(2, 'Java'),
(2, 'MATLAB'),
(2, 'Circuit Design'),
(3, 'Machine Learning'),
(3, 'Python'),
(3, 'Java'),
(4, 'SQL'),
(4, 'Excel'),
(5, 'JavaScript'),
(5, 'Node.js'),
(5, 'Git');
 
