import './JobEntry.css'
import { Link } from 'react-router-dom'
import { formatFriendlyDateTime } from '../utils/formatDates'

function JobEntry({listingID, companyName, postDate, description, externalLink, dateDue}) {
        const postedLabel = formatFriendlyDateTime(postDate)
        const dueLabel = formatFriendlyDateTime(dateDue)

        return(
                <Link className='jobentry-container' to={`/apply/${listingID}`}>
                        <div className='jobentry-company'>
                                <div className='jobentry-company-icon'></div>
                                <div className='jobentry-company-name'>
                                        <h1>{companyName}</h1>
                                </div>
                        </div>
                        <p className='jobentry-posttime'>Posted {postedLabel}</p>
                        <div className='jobentry-info-container'>
                                <h1 className='jobentry-title'>Description:</h1>
                                <p>{description}</p>
                                <h1 className='jobentry-title'>Apply Externally:</h1>
                                <p>{externalLink}</p>
                        </div>
                        <div className='jobentry-apply'>
                                <h3>Apply by {dueLabel}</h3>
                                <span className='jobentry-apply-cta'>Apply</span>
                        </div>
                </Link>
        )
}

export default JobEntry
