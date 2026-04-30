-- View only submitted applications
CREATE VIEW view_submitted AS
SELECT *
FROM Application
WHERE status = 'submitted';

SELECT * FROM view_submitted;
SELECT * FROM Application;

-- View only listings posted within the last 24h
CREATE VIEW recent_listings AS
SELECT * FROM listing
WHERE DATE(PostDate) = CURDATE();

SELECT * FROM recent_listings;

-- Query for listings with a due date in the future
SELECT * FROM listing 
WHERE DATE(dateDue) > current_date() OR DATE(dateDue) = current_date();
SELECT * FROM listing;
