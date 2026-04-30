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