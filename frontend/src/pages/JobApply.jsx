import { useEffect, useState } from 'react'
import './JobApply.css'
import { useParams } from 'react-router-dom'

function JobApply() {
  const { id: listingId } = useParams()

  const [jobListing, setJobListing] = useState(null)
  const [user, setUser] = useState(null)

  const [resume, setResume] = useState(null)
  const [resumeId, setResumeId] = useState(null)

  const [answers, setAnswers] = useState({})
  const [applicationId, setApplicationId] = useState(null)

  // --------------------
  // get user
  // --------------------
  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem("user")))
  }, [])

  // --------------------
  // get listing
  // --------------------
  useEffect(() => {
    if (!listingId) return

    async function fetchListing() {
      try {
        const res = await fetch(`http://localhost:5001/api/listings/${listingId}`)
        const data = await res.json()

        if (!data.ok) throw new Error(data.error)

        setJobListing(data.data)
      } catch (err) {
        console.error("Failed to fetch listing:", err)
      }
    }

    fetchListing()
  }, [listingId])

  // --------------------
  // get resume
  // --------------------
  useEffect(() => {
    if (!user) return

    fetch(`http://localhost:5001/api/students/${user.userID}/resume`)
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          setResume(data.data)
          setResumeId(data.data.resumeID)
        }
      })
      .catch(console.error)
  }, [user])

  // --------------------
  // load draft
  // --------------------
  useEffect(() => {
    if (!user || !listingId) return

    async function loadDraft() {
      try {
        const res = await fetch(
          `http://localhost:5001/api/applications/draft?userId=${user.userID}&listingId=${listingId}`
        )

        const data = await res.json()

        if (!data.ok || !data.data) return

        const { application, answers: savedAnswers } = data.data

        // IMPORTANT: store applicationId
        setApplicationId(application.applicationID)

        if (application.resumeID) {
          setResumeId(application.resumeID)
        }

        const restored = {}
        for (const a of savedAnswers) {
          restored[a.questionID] = a.answerText
        }

        setAnswers(restored)
      } catch (err) {
        console.error("Failed to load draft:", err)
      }
    }

    loadDraft()
  }, [user, listingId])

  // --------------------
  // save or submit
  // --------------------
  async function handleSave(status) {
    if (!user) return

    const payload = {
      userId: user.userID,
      listingId,
      resumeId,
      status,
      answers: Object.entries(answers).map(([questionId, answerText]) => ({
        questionId,
        answerText
      }))
    }

    try {
      // --------------------
      // CREATE (POST)
      // --------------------
      if (!applicationId) {
        const res = await fetch("http://localhost:5001/api/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })

        const data = await res.json()

        if (!data.ok) {
          alert(data.error)
          return
        }

        setApplicationId(data.data.applicationId)
      }

      // --------------------
      // UPDATE (PATCH)
      // --------------------
      else {
        const res = await fetch(
          `http://localhost:5001/api/applications/${applicationId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          }
        )

        const data = await res.json()

        if (!data.ok) {
          alert(data.error)
          return
        }
      }

      alert(status === "draft" ? "Draft saved!" : "Application submitted!")

    } catch (err) {
      console.error(err)
    }
  }

  if (!jobListing) return <p>Loading...</p>

  return (
    <div className="job-apply-container">
      <h1>{jobListing.description}</h1>

      <h3>Resume</h3>
      {resume ? (
        <p>Using: {resume.fileName}</p>
      ) : (
        <p>No resume found</p>
      )}

      <h3>Additional Questions</h3>

      {jobListing.questions.map((q) => (
        <div key={q.questionID}>
          <p>{q.questionText}</p>

          <input
            type="text"
            value={answers[q.questionID] || ""}
            onChange={(e) =>
              setAnswers(prev => ({
                ...prev,
                [q.questionID]: e.target.value
              }))
            }
          />
        </div>
      ))}

      <button onClick={() => handleSave("draft")}>
        Save
      </button>

      <button onClick={() => handleSave("submitted")}>
        Submit Application
      </button>
    </div>
  )
}

export default JobApply
