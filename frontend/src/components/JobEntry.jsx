import './JobEntry.css'

function JobEntry({companyName, postDate, description, externalLink, dateDue}) {
        return(
                <div className='jobentry-container'>
                        <div className='jobentry-company'>
                                <div className='jobentry-company-icon'></div>
                                <div className='jobentry-company-name'>
                                        <h1>{companyName}</h1>
                                </div>
                        </div>
                        <h1 className='jobentry-posttime'>posted on {postDate}</h1>
                        <div className='jobentry-info-container'>
                                <h1 className='jobentry-title'>Description:</h1>
                                <p>{description}</p>
                                <h1 className='jobentry-title'>Apply Externally:</h1>
                                <p>{externalLink}</p>
                        </div>
                        <div className='jobentry-apply'>
                                <h3>Apply by: {dateDue}</h3>
                                <button>Apply</button>
                        </div>
                </div>
        )
}

export default JobEntry
