import "./CreateListing.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateListing() {
  const [user, setUser] = useState(null);
  const [dateDue, setDateDue] = useState("");
  const [description, setDescription] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const [questions, setQuestions] = useState([""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(storedUser);
  }, []);

  function updateQuestion(idx, value) {
    setQuestions((prev) => prev.map((question, i) => (i === idx ? value : question)));
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, ""]);
  }

  function removeQuestion(idx) {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!user || user.role !== "company") {
      setError("Only company users can create listings.");
      return;
    }
    if (!dateDue) {
      setError("Please provide an application due date.");
      return;
    }
    if (description.length > 1000) {
      setError("Description must be 1000 characters or fewer.");
      return;
    }
    if (externalLink.length > 100) {
      setError("External link must be 100 characters or fewer.");
      return;
    }

    const cleanQuestions = questions.map((q) => q.trim()).filter((q) => q.length > 0);

    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:5001/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyEmail: user.email,
          dateDue,
          description: description.trim() || null,
          externalLink: externalLink.trim() || null,
          questions: cleanQuestions,
        }),
      });

      const data = await res.json();
      if (!data.ok) {
        setError(data.error || "Failed to create listing.");
        return;
      }

      setSuccess("Listing created successfully.");
      setDateDue("");
      setDescription("");
      setExternalLink("");
      setQuestions([""]);

      navigate("/listings");
    } catch (_err) {
      setError("Something went wrong while creating the listing.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) {
    return (
      <div className="create-listing-container">
        <div className="create-listing-card">
          <h1>Create Listing</h1>
          <p>Please log in as a company account to create a listing.</p>
        </div>
      </div>
    );
  }

  if (user.role !== "company") {
    return (
      <div className="create-listing-container">
        <div className="create-listing-card">
          <h1>Create Listing</h1>
          <p>Only company users can create listings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-listing-container">
      <form className="create-listing-card" onSubmit={handleSubmit}>
        <h1>Create Listing</h1>

        <label htmlFor="dateDue">Application Due Date</label>
        <input
          id="dateDue"
          type="datetime-local"
          value={dateDue}
          onChange={(e) => setDateDue(e.target.value)}
          required
        />

        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          placeholder="Describe the role"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
        />
        <p className="char-count">{description.length}/1000</p>

        <label htmlFor="externalLink">External Link</label>
        <input
          id="externalLink"
          type="text"
          placeholder="https://..."
          value={externalLink}
          onChange={(e) => setExternalLink(e.target.value)}
          maxLength={100}
        />
        <p className="char-count">{externalLink.length}/100</p>

        <div className="questions-section">
          <h3>Screening Questions (Optional)</h3>
          {questions.map((question, idx) => (
            <div className="question-row" key={`question-${idx}`}>
              <input
                type="text"
                placeholder={`Question ${idx + 1}`}
                value={question}
                onChange={(e) => updateQuestion(idx, e.target.value)}
              />
              {questions.length > 1 && (
                <button type="button" onClick={() => removeQuestion(idx)}>
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addQuestion}>
            Add Question
          </button>
        </div>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create Listing"}
        </button>
      </form>
    </div>
  );
}

export default CreateListing;