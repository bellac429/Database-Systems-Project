import './ApplicationEntry.css'
import { Link } from 'react-router-dom'

function ApplicationEntry({companyName, description, dueDate, status, listingID}) {
        return(
                <Link className='application-entry-container' to={`/apply/${listingID}`}>
                        <div className='application-entry-company'>
                                <div className='application-entry-company-icon'></div>
                                <div className='application-entry-company-name'>
                                        <h1>{companyName}</h1>
                                </div>
                        </div>
                        <div className='application-entry-info-container'>
                                <h1 className='application-entry-title'>Description:</h1>
                                <p>{description}</p>
                                <p>due by: {dueDate}</p>
                        </div>
                        <div className='application-entry-status'>
                                <h3>status: {status}</h3>
                                <span className='application-entry-cta'>
                                        {status === "draft" ? "Continue" : "Open"}
                                </span>
                        </div>
                </Link>
        )
}

export default ApplicationEntry
