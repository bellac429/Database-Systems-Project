import './JobApply.css'
import { useParams } from 'react-router-dom'

function JobApply() {
        const id = useParams().id

        return(
                <div className="job-apply-container">
                        <h1>apply to job</h1>
                </div>
        )
}

export default JobApply