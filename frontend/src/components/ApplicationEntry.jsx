import './ApplicationEntry.css'

function ApplicationEntry({companyName, description, dueDate, status}) {
        return(
                <div className='application-entry-container'>
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
                                {status === "draft" && <button>edit</button>}
                        </div>
                </div>
        )
}

export default ApplicationEntry
