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
JOIN Student s ON a.userID = s.userID
JOIN Listing l ON a.listingID = l.listingID
JOIN Company_Listings cl ON l.listingID = cl.listingID
JOIN Company c ON cl.userID = c.userID
WHERE a.status = 'submitted';

SELECT * FROM view_submitted;

-- View only listings posted within the last 24h
CREATE VIEW recent_listings AS
SELECT * FROM listing
WHERE DATE(PostDate) = CURDATE();

SELECT * FROM recent_listings;

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
JOIN Company_Listings cl ON c.userID = cl.userID
JOIN Listing l ON cl.listingID = l.listingID
LEFT JOIN Application a ON l.listingID = a.listingID
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
