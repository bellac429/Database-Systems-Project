	-- ============================================================
	-- SCHEMA SETUP
	-- ============================================================
	DROP SCHEMA IF EXISTS JobApplications;
	CREATE SCHEMA JobApplications;
	USE JobApplications;

	-- ============================================================
	-- USERS (base table)
	-- ============================================================
	CREATE TABLE Users (
		userID      INT             NOT NULL AUTO_INCREMENT,
		address     VARCHAR(255),
		email       VARCHAR(255)    NOT NULL UNIQUE,
		phone       VARCHAR(20),
        password    VARCHAR(255)    NOT NULL,
		PRIMARY KEY (userID)
	);

	-- ============================================================
	-- STUDENT (subclass of Users)
	-- ============================================================
	CREATE TABLE Student (
		userID      INT             NOT NULL,
		firstName   VARCHAR(100)    NOT NULL,
		lastName    VARCHAR(100)    NOT NULL,
		year        INT,
		dob         DATE,
		gpa         DECIMAL(3,2),
		major       VARCHAR(100),
		PRIMARY KEY (userID),
		FOREIGN KEY (userID) REFERENCES Users(userID)
			ON DELETE CASCADE
			ON UPDATE CASCADE
	);

	-- ============================================================
	-- COMPANY (subclass of Users)
	-- ============================================================
	CREATE TABLE Company (
		userID      INT             NOT NULL,
		companyName VARCHAR(255)    NOT NULL UNIQUE,
		PRIMARY KEY (userID),
		FOREIGN KEY (userID) REFERENCES Users(userID)
			ON DELETE CASCADE
			ON UPDATE CASCADE
	);

	-- ============================================================
	-- RESUME (ONLY STUDENTS CAN HAVE RESUMES)
	-- ============================================================
	CREATE TABLE Resume (
		resumeID        INT             NOT NULL AUTO_INCREMENT,
		userID          INT             NOT NULL,
		fileName        VARCHAR(255)    NOT NULL,
		dateUploaded    DATE            NOT NULL,
		PRIMARY KEY (resumeID),
		FOREIGN KEY (userID) REFERENCES Student(userID)
			ON DELETE CASCADE
			ON UPDATE CASCADE
	);

	-- ============================================================
	-- LISTING
	-- ============================================================
	CREATE TABLE Listing (
		listingID       INT             NOT NULL AUTO_INCREMENT,
		userID			INT 			NOT NULL,
		postDate        DATETIME        NOT NULL,
		dateDue         DATETIME        NOT NULL,
		description     VARCHAR(1000),
		externalLink    VARCHAR(100),
		PRIMARY KEY (listingID),
		CHECK (postDate <= dateDue),
        FOREIGN KEY (userID) REFERENCES Users(userID)
			ON DELETE CASCADE
            ON UPDATE CASCADE
	);

	-- ============================================================
	-- LISTING QUESTIONS
	-- ============================================================
	CREATE TABLE Listing_Questions (
		questionID      INT NOT NULL AUTO_INCREMENT,
		listingID       INT NOT NULL,
		questionText    TEXT NOT NULL,
		PRIMARY KEY (questionID),
		FOREIGN KEY (listingID) REFERENCES Listing(listingID)
			ON DELETE CASCADE
			ON UPDATE CASCADE
	);

	-- ============================================================
	-- APPLICATION (ONLY STUDENTS APPLY)
	-- ============================================================
	CREATE TABLE Application (
		applicationID   INT NOT NULL AUTO_INCREMENT,
		userID          INT NOT NULL,
		listingID       INT NOT NULL,
		resumeID        INT NOT NULL,
		status          VARCHAR(50) NOT NULL
							CHECK (status IN ('draft', 'submitted', 'responded')),
		createTime      DATETIME NOT NULL,
		submitTime      DATETIME,
		PRIMARY KEY (applicationID),
		FOREIGN KEY (userID) REFERENCES Student(userID)
			ON DELETE CASCADE
			ON UPDATE CASCADE,
		FOREIGN KEY (listingID) REFERENCES Listing(listingID)
			ON DELETE CASCADE
			ON UPDATE CASCADE,
		FOREIGN KEY (resumeID) REFERENCES Resume(resumeID)
			ON DELETE RESTRICT
			ON UPDATE CASCADE,
		CHECK (submitTime IS NULL OR submitTime >= createTime)
	);

	-- ============================================================
	-- APPLICATION ANSWERS
	-- ============================================================
	CREATE TABLE Application_Answers (
		answerID        INT NOT NULL AUTO_INCREMENT,
		applicationID   INT NOT NULL,
		questionID      INT NOT NULL,
		answerText      TEXT,
		PRIMARY KEY (answerID),
		FOREIGN KEY (applicationID) REFERENCES Application(applicationID)
			ON DELETE CASCADE
			ON UPDATE CASCADE,
		FOREIGN KEY (questionID) REFERENCES Listing_Questions(questionID)
			ON DELETE CASCADE
			ON UPDATE CASCADE
	);

	-- ============================================================
	-- STUDENT SKILLS
	-- ============================================================
	CREATE TABLE Student_Skills (
		userID  INT NOT NULL,
		skill   VARCHAR(100) NOT NULL,
		PRIMARY KEY (userID, skill),
		FOREIGN KEY (userID) REFERENCES Student(userID)
			ON DELETE CASCADE
			ON UPDATE CASCADE
	);

	-- ============================================================
	-- SEED DATA
	-- ============================================================

	-- USERS
	INSERT INTO Users (address, email, phone, password) VALUES
('123 Elm St, Iowa City, IA',       'alice@email.com',   '319-555-0101', 'alice123'),
('456 Oak Ave, Iowa City, IA',      'bob@email.com',     '319-555-0102', 'bob123'),
('789 Pine Rd, Coralville, IA',     'carol@email.com',   '319-555-0103', 'carol123'),
('321 Maple Ln, North Liberty, IA', 'david@email.com',   '319-555-0104', 'david123'),
('654 Cedar Blvd, Iowa City, IA',   'emily@email.com',   '319-555-0105', 'emily123'),
('100 Corporate Dr, Chicago, IL',   'recruit@techcorp.com', '312-555-0201', 'techcorp123'),
('200 Business Park, Austin, TX',   'hr@innovate.com',      '512-555-0202', 'innovate123'),
('300 Startup Way, SF, CA',         'jobs@nextstep.com',    '415-555-0203', 'nextstep123'),
('400 Enterprise Blvd, Seattle, WA','careers@cloud.com',    '206-555-0204', 'cloud123'),
('500 Commerce St, NY, NY',         'talent@apex.com',      '212-555-0205', 'apex123');

	-- STUDENTS
	INSERT INTO Student VALUES
	(1,'Alice','Johnson',3,'2002-04-15',3.85,'CS'),
	(2,'Bob','Martinez',4,'2001-09-22',3.42,'EE'),
	(3,'Carol','Lee',2,'2003-01-30',3.91,'DS'),
	(4,'David','Kim',4,'2001-06-11',3.10,'IS'),
	(5,'Emily','Chen',1,'2004-03-05',3.75,'CS');

	-- COMPANIES
	INSERT INTO Company VALUES
	(6,'TechCorp'),
	(7,'Innovate Inc'),
	(8,'NextStep'),
	(9,'CloudWorks'),
	(10,'Apex Solutions');

	-- RESUMES
	INSERT INTO Resume (userID,fileName,dateUploaded) VALUES
	(1,'alice.pdf','2025-01-01'),
	(2,'bob.pdf','2025-01-01'),
	(3,'carol.pdf','2025-01-01'),
	(4,'david.pdf','2025-01-01'),
	(5,'emily.pdf','2025-01-01');

	-- LISTINGS
	INSERT INTO Listing (userID, postDate,dateDue,description,externalLink) VALUES
	(6, '2025-01-01','2025-03-01','SWE Intern','link1'),
	(6, '2025-01-02','2025-03-02','Data Analyst','link2'),
	(7, '2025-01-03','2025-03-03','Full Stack','link3'),
	(8, '2025-01-04','2025-03-04','Cloud Intern','link4'),
	(9, '2025-01-05','2025-03-05','Business Analyst','link5');
    
	-- QUESTIONS
	INSERT INTO Listing_Questions (listingID,questionText) VALUES
	(1,'Q1'),(2,'Q2'),(3,'Q3'),(4,'Q4'),(5,'Q5');

	-- APPLICATIONS
	INSERT INTO Application (userID,listingID,resumeID,status,createTime,submitTime) VALUES
	(1,1,1,'submitted','2025-01-01','2025-01-02'),
	(2,2,2,'submitted','2025-01-01','2025-01-02'),
	(3,3,3,'draft','2025-01-01',NULL),
	(4,4,4,'submitted','2025-01-01','2025-01-02'),
	(5,5,5,'responded','2025-01-01','2025-01-02');

	-- ANSWERS
	INSERT INTO Application_Answers (applicationID,questionID,answerText) VALUES
	(1,1,'A1'),(2,2,'A2'),(3,3,'A3'),(4,4,'A4'),(5,5,'A5');

	-- SKILLS
	INSERT INTO Student_Skills VALUES
	(1,'Python'),(2,'Java'),(3,'ML'),(4,'SQL'),(5,'JS');

	-- =================================================
	-- VIEWS
	-- =================================================

	-- View only submitted applications
	CREATE VIEW view_submitted AS
SELECT 
    a.applicationID,
    s.firstName,
    s.lastName,
    c.companyName,
    l.description,
    a.submitTime
FROM Application a
JOIN Student s 
    ON a.userID = s.userID
JOIN Listing l 
    ON a.listingID = l.listingID
JOIN Company c 
    ON l.userID = c.userID
WHERE a.status = 'submitted';

	SELECT * FROM view_submitted;

	-- View only listings posted within the last 24h
	CREATE VIEW recent_listings AS
	SELECT * FROM listing
	WHERE DATE(PostDate) = CURDATE();

	SELECT * FROM recent_listings;


	-- =================================================
	-- QUERIES
	-- =================================================

	-- Query for seing student, status and listing they've applied to
	SELECT 
		s.firstName,
		s.lastName,
		a.status,
		l.description AS listingDescription
	FROM Application a
	JOIN Student s ON a.userID = s.userID
	JOIN Listing l ON a.listingID = l.listingID;

-- # of applications per company
SELECT 
    c.companyName,
    COUNT(a.applicationID) AS totalApplications
FROM Company c
JOIN Listing l 
    ON c.userID = l.userID
LEFT JOIN Application a 
    ON l.listingID = a.listingID
GROUP BY c.companyName;

	-- Students with above avg GPA
	SELECT 
		firstName,
		lastName,
		gpa,
		major
	FROM Student
	WHERE gpa > (
		SELECT AVG(gpa)
		FROM Student
	);

	-- Applications submitted before deadline 
	SELECT 
		s.firstName,
		s.lastName,
		l.description,
		a.submitTime,
		l.dateDue
	FROM Application a
	JOIN Student s ON a.userID = s.userID
	JOIN Listing l ON a.listingID = l.listingID
	WHERE a.submitTime < (
		SELECT dateDue
		FROM Listing
		WHERE Listing.listingID = a.listingID
	);

	-- Submitted applications by most recent 
	SELECT *
	FROM view_submitted
	ORDER BY submitTime DESC;
SELECT * FROM application;
SELECT CountApplicationsByStatus(1,'submitted') AS submittedApplications;

	-- Use function
	SELECT CountApplicationsByStatus(1, 'submitted') AS submittedApplications;

	-- USE Procedure
	CALL GetStudentApplications(1);

	-- =================================================
	-- TRIGGERS
	-- =================================================

	-- Set submit time for newly submitted applications to the current time
	DELIMITER //
	CREATE TRIGGER set_submit_time
	BEFORE UPDATE ON Application
	FOR EACH ROW
	BEGIN
		IF NEW.status = 'submitted' AND OLD.status <> 'submitted' THEN
			SET NEW.submitTime = NOW();
		END IF;
	END//

	-- Stop resume deletion if used in an application
	CREATE TRIGGER prevent_resume_delete
	BEFORE DELETE ON Resume
	FOR EACH ROW
	BEGIN
		IF EXISTS (
			SELECT 1 FROM Application
			WHERE resumeID = OLD.resumeID
		) THEN
			SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'Cannot delete resume used in an application';
		END IF;
	END//

	-- Create default empty answer for all aplication answers
	CREATE TRIGGER create_default_answers
	AFTER INSERT ON Application
	FOR EACH ROW
	BEGIN
		INSERT INTO Application_Answers (applicationID, questionID)
		SELECT NEW.applicationID, q.questionID
		FROM Listing_Questions q
		WHERE q.listingID = NEW.listingID;
	END//


	-- ======================================
	-- PROCEDURE & TASK
	-- ======================================

	-- Get all applications for a student
	CREATE PROCEDURE GetStudentApplications(IN p_userID INT)
	BEGIN
		SELECT 
			a.applicationID,
			s.firstName,
			s.lastName,
			l.description AS listingDescription,
			a.status,
			a.createTime,
			a.submitTime
		FROM Application a
		JOIN Student s ON a.userID = s.userID
		JOIN Listing l ON a.listingID = l.listingID
		WHERE a.userID = p_userID;
	END//

	-- Count applications by status
	CREATE FUNCTION CountApplicationsByStatus(
    p_account_id INT,
    p_status VARCHAR(50)
)
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE total INT;

    SELECT COUNT(*)
    INTO total
    FROM Application
    WHERE userID = p_account_id
      AND status = p_status;

    RETURN total;
END //

	DELIMITER ;
