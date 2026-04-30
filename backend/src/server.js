import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";

dotenv.config();
const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

function toApiError(res, err) {
  return res.status(500).json({ ok: false, error: err.message });
}

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, message: "Backend + DB connected" });
  } catch (err) {
    toApiError(res, err);
  }
});

app.get("/api/listings", async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT l.listingID, l.postDate, l.dateDue, l.description, l.externalLink, c.companyName
      FROM Listing l
      LEFT JOIN Company_Listings cl ON cl.listingID = l.listingID
      LEFT JOIN Company c ON c.userID = cl.userID
      ORDER BY l.postDate DESC
    `);
    res.json({ ok: true, data: rows });
  } catch (err) {
    toApiError(res, err);
  }
});

app.get("/api/listings/:listingId", async (req, res) => {
  const listingId = Number(req.params.listingId);
  if (!Number.isInteger(listingId)) {
    return res.status(400).json({ ok: false, error: "Invalid listingId" });
  }

  try {
    const [listings] = await pool.query(
      `
      SELECT l.listingID, l.postDate, l.dateDue, l.description, l.externalLink, c.companyName, c.userID AS companyUserID
      FROM Listing l
      LEFT JOIN Company_Listings cl ON cl.listingID = l.listingID
      LEFT JOIN Company c ON c.userID = cl.userID
      WHERE l.listingID = ?
      `,
      [listingId]
    );

    if (listings.length === 0) {
      return res.status(404).json({ ok: false, error: "Listing not found" });
    }

    const [questions] = await pool.query(
      `
      SELECT questionID, listingID, questionText
      FROM Listing_Questions
      WHERE listingID = ?
      ORDER BY questionID ASC
      `,
      [listingId]
    );

    return res.json({ ok: true, data: { ...listings[0], questions } });
  } catch (err) {
    return toApiError(res, err);
  }
});

app.get("/api/students/:userId/profile", async (req, res) => {
  const userId = Number(req.params.userId);
  if (!Number.isInteger(userId)) {
    return res.status(400).json({ ok: false, error: "Invalid userId" });
  }

  try {
    const [rows] = await pool.query(
      `
      SELECT u.userID, u.address, u.email, u.phone, s.firstName, s.lastName, s.year, s.dob, s.gpa, s.major
      FROM Users u
      INNER JOIN Student s ON s.userID = u.userID
      WHERE u.userID = ?
      `,
      [userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ ok: false, error: "Student not found" });
    }
    return res.json({ ok: true, data: rows[0] });
  } catch (err) {
    return toApiError(res, err);
  }
});

app.get("/api/students/:userId/resume", async (req, res) => {
  const userId = Number(req.params.userId);
  if (!Number.isInteger(userId)) {
    return res.status(400).json({ ok: false, error: "Invalid userId" });
  }

  try {
    const [rows] = await pool.query(
      `
      SELECT resumeID, userID, fileName, dateUploaded
      FROM Resume
      WHERE userID = ?
      ORDER BY dateUploaded DESC, resumeID DESC
      LIMIT 1
      `,
      [userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ ok: false, error: "Resume not found" });
    }
    return res.json({ ok: true, data: rows[0] });
  } catch (err) {
    return toApiError(res, err);
  }
});

app.get("/api/students/:userId/applications", async (req, res) => {
  const userId = Number(req.params.userId);
  if (!Number.isInteger(userId)) {
    return res.status(400).json({ ok: false, error: "Invalid userId" });
  }

  try {
    const [rows] = await pool.query(
      `
      SELECT a.applicationID, a.userID, a.listingID, a.resumeID, a.status, a.createTime, a.submitTime,
             l.description AS listingDescription, l.dateDue, c.companyName
      FROM Application a
      INNER JOIN Listing l ON l.listingID = a.listingID
      LEFT JOIN Company_Listings cl ON cl.listingID = l.listingID
      LEFT JOIN Company c ON c.userID = cl.userID
      WHERE a.userID = ?
      ORDER BY a.createTime DESC
      `,
      [userId]
    );
    return res.json({ ok: true, data: rows });
  } catch (err) {
    return toApiError(res, err);
  }
});

app.get("/api/companies/:userId/listings", async (req, res) => {
  const userId = Number(req.params.userId);
  if (!Number.isInteger(userId)) {
    return res.status(400).json({ ok: false, error: "Invalid userId" });
  }

  try {
    const [rows] = await pool.query(
      `
      SELECT l.listingID, l.postDate, l.dateDue, l.description, l.externalLink
      FROM Company_Listings cl
      INNER JOIN Listing l ON l.listingID = cl.listingID
      WHERE cl.userID = ?
      ORDER BY l.postDate DESC
      `,
      [userId]
    );
    return res.json({ ok: true, data: rows });
  } catch (err) {
    return toApiError(res, err);
  }
});

app.get("/api/companies/:userId/applications", async (req, res) => {
  const userId = Number(req.params.userId);
  if (!Number.isInteger(userId)) {
    return res.status(400).json({ ok: false, error: "Invalid userId" });
  }

  try {
    const [rows] = await pool.query(
      `
      SELECT a.applicationID, a.status, a.createTime, a.submitTime, a.userID AS studentUserID,
             l.listingID, l.description AS listingDescription
      FROM Company_Listings cl
      INNER JOIN Listing l ON l.listingID = cl.listingID
      INNER JOIN Application a ON a.listingID = l.listingID
      WHERE cl.userID = ?
      ORDER BY a.createTime DESC
      `,
      [userId]
    );
    return res.json({ ok: true, data: rows });
  } catch (err) {
    return toApiError(res, err);
  }
});

app.post("/api/listings", async (req, res) => {
  const { companyUserId, dateDue, description, externalLink, questions = [] } = req.body;
  if (!companyUserId || !dateDue) {
    return res.status(400).json({ ok: false, error: "companyUserId and dateDue are required" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [listingResult] = await conn.query(
      `
      INSERT INTO Listing (postDate, dateDue, description, externalLink)
      VALUES (NOW(), ?, ?, ?)
      `,
      [dateDue, description ?? null, externalLink ?? null]
    );
    const listingId = listingResult.insertId;

    await conn.query(
      `
      INSERT INTO Company_Listings (userID, listingID)
      VALUES (?, ?)
      `,
      [companyUserId, listingId]
    );

    for (const questionText of questions) {
      if (typeof questionText === "string" && questionText.trim().length > 0) {
        await conn.query(
          `
          INSERT INTO Listing_Questions (listingID, questionText)
          VALUES (?, ?)
          `,
          [listingId, questionText.trim()]
        );
      }
    }

    await conn.commit();
    return res.status(201).json({ ok: true, data: { listingId } });
  } catch (err) {
    await conn.rollback();
    return toApiError(res, err);
  } finally {
    conn.release();
  }
});

app.post("/api/applications", async (req, res) => {
  const { userId, listingId, resumeId, status = "draft", submitTime = null, answers = [] } = req.body;
  if (!userId || !listingId || !resumeId) {
    return res.status(400).json({ ok: false, error: "userId, listingId, and resumeId are required" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `
      INSERT INTO Application (userID, listingID, resumeID, status, createTime, submitTime)
      VALUES (?, ?, ?, ?, NOW(), ?)
      `,
      [userId, listingId, resumeId, status, submitTime]
    );
    const applicationId = result.insertId;

    for (const answer of answers) {
      if (!answer?.questionId) continue;
      await conn.query(
        `
        INSERT INTO Application_Answers (applicationID, questionID, answerText)
        VALUES (?, ?, ?)
        `,
        [applicationId, answer.questionId, answer.answerText ?? null]
      );
    }

    await conn.commit();
    return res.status(201).json({ ok: true, data: { applicationId } });
  } catch (err) {
    await conn.rollback();
    return toApiError(res, err);
  } finally {
    conn.release();
  }
});

app.patch("/api/applications/:applicationId/status", async (req, res) => {
  const applicationId = Number(req.params.applicationId);
  const { status } = req.body;
  const allowedStatuses = new Set(["draft", "submitted", "responded"]);

  if (!Number.isInteger(applicationId)) {
    return res.status(400).json({ ok: false, error: "Invalid applicationId" });
  }
  if (!allowedStatuses.has(status)) {
    return res.status(400).json({ ok: false, error: "Invalid status" });
  }

  try {
    const submitTimeClause = status === "submitted" ? ", submitTime = NOW()" : "";
    const [result] = await pool.query(
      `
      UPDATE Application
      SET status = ? ${submitTimeClause}
      WHERE applicationID = ?
      `,
      [status, applicationId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "Application not found" });
    }

    return res.json({ ok: true, message: "Application status updated" });
  } catch (err) {
    return toApiError(res, err);
  }
});

const port = process.env.PORT || 5001;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));