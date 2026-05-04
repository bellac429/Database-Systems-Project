import { useEffect, useState } from 'react'
import './JobApply.css'
import { Link, useParams, useSearchParams } from 'react-router-dom'

function JobApply() {
  const { id: listingId } = useParams()
  const [searchParams] = useSearchParams()
  const queryApplicationId = searchParams.get('applicationId')
  const queryReadonly = searchParams.get('readonly') === '1'

  const [jobListing, setJobListing] = useState(null)
  const [user, setUser] = useState(null)

  const [resume, setResume] = useState(null)
  const [resumeId, setResumeId] = useState(null)
  const [submittedResumeFileName, setSubmittedResumeFileName] = useState(null)

  const [answers, setAnswers] = useState({})
  const [applicationId, setApplicationId] = useState(null)
  const [viewOnly, setViewOnly] = useState(false)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem('user')))
  }, [])

  useEffect(() => {
    if (!listingId) return

    async function fetchListing() {
      try {
        const res = await fetch(`http://localhost:5001/api/listings/${listingId}`)
        const data = await res.json()

        if (!data.ok) throw new Error(data.error)

        setJobListing(data.data)
      } catch (err) {
        console.error('Failed to fetch listing:', err)
      }
    }

    fetchListing()
  }, [listingId])

  useEffect(() => {
    if (!user) return
    if (queryApplicationId && queryReadonly) return

    fetch(`http://localhost:5001/api/students/${user.userID}/resume`)
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          setResume(data.data)
          setResumeId(data.data.resumeID)
        }
      })
      .catch(console.error)
  }, [user, queryApplicationId, queryReadonly])

  useEffect(() => {
    if (!user || !listingId) return

    let cancelled = false

    async function initApplicationState() {
      setLoadError(null)

      if (queryApplicationId && queryReadonly) {
        try {
          const res = await fetch(
            `http://localhost:5001/api/applications/${queryApplicationId}?userId=${user.userID}`
          )
          const data = await res.json()
          if (cancelled) return
          if (!data.ok) {
            setLoadError(data.error || 'Could not load application.')
            return
          }
          const { application, answers: ansRows } = data.data
          if (application.listingID !== Number(listingId)) {
            setLoadError('This application does not match this listing.')
            return
          }
          setApplicationId(application.applicationID)
          setResumeId(application.resumeID)
          setSubmittedResumeFileName(application.resumeFileName || null)
          const restored = {}
          for (const a of ansRows) {
            restored[a.questionID] = a.answerText ?? ''
          }
          setAnswers(restored)
          const locked = application.status === 'submitted' || application.status === 'responded'
          setViewOnly(locked)
          return
        } catch (e) {
          if (!cancelled) setLoadError('Could not load application.')
          return
        }
      }

      try {
        const res = await fetch(
          `http://localhost:5001/api/applications/draft?userId=${user.userID}&listingId=${listingId}`
        )
        const data = await res.json()
        if (cancelled) return
        if (!data.ok || !data.data) return

        const { application, answers: savedAnswers } = data.data
        setApplicationId(application.applicationID)
        if (application.resumeID) {
          setResumeId(application.resumeID)
        }
        const restored = {}
        for (const a of savedAnswers) {
          restored[a.questionID] = a.answerText ?? ''
        }
        setAnswers(restored)
        setViewOnly(false)
      } catch (err) {
        console.error('Failed to load draft:', err)
      }
    }

    initApplicationState()
    return () => {
      cancelled = true
    }
  }, [user, listingId, queryApplicationId, queryReadonly])

  async function handleSave(status) {
    if (!user || viewOnly) return

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
      if (!applicationId) {
        const res = await fetch('http://localhost:5001/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        const data = await res.json()

        if (!data.ok) {
          alert(data.error)
          return
        }

        setApplicationId(data.data.applicationId)
      } else {
        const res = await fetch(
          `http://localhost:5001/api/applications/${applicationId}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }
        )

        const data = await res.json()

        if (!data.ok) {
          alert(data.error)
          return
        }
      }

      alert(status === 'draft' ? 'Draft saved!' : 'Application submitted!')
      window.location.href = `/applications/${user.userID}`
    } catch (err) {
      console.error(err)
    }
  }

  if (!jobListing) return <p className="loading-state">Loading application…</p>

  const resumeLabel = viewOnly
    ? submittedResumeFileName || resume?.fileName || 'No filename on record'
    : resume
      ? resume.fileName
      : 'No resume found'

  return (
    <div className="job-apply-container">
      <div className={`job-apply-card ${viewOnly ? 'job-apply-card--readonly' : ''}`}>
        <h1>{jobListing.description}</h1>

        {loadError && <p className="job-apply-error">{loadError}</p>}

        {viewOnly && (
          <div className="job-apply-readonly-banner" role="status">
            Submitted application — read only. Answers and resume reflect what you sent; you cannot edit or
            resubmit.
          </div>
        )}

        <h3>Resume</h3>
        <p>{viewOnly ? `Resume on file: ${resumeLabel}` : resume ? `Using: ${resumeLabel}` : resumeLabel}</p>

        <h3>Additional Questions</h3>

        {jobListing.questions.map(q => (
          <div key={q.questionID}>
            <p>{q.questionText}</p>

            <input
              type="text"
              readOnly={viewOnly}
              aria-readonly={viewOnly}
              value={answers[q.questionID] || ''}
              onChange={e =>
                setAnswers(prev => ({
                  ...prev,
                  [q.questionID]: e.target.value
                }))
              }
            />
          </div>
        ))}

        {!viewOnly && (
          <>
            <button type="button" onClick={() => handleSave('draft')}>
              Save
            </button>

            <button type="button" onClick={() => handleSave('submitted')}>
              Submit Application
            </button>
          </>
        )}

        {viewOnly && user && (
          <Link className="job-apply-back-link" to={`/applications/${user.userID}`}>
            Back to applications
          </Link>
        )}
      </div>
    </div>
  )
}

export default JobApply
