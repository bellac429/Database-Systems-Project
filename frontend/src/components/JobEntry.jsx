import './JobEntry.css'

function JobEntry() {
        return(
                <div className='jobentry-container'>
                        <div className='jobentry-company'>
                                <div className='jobentry-company-icon'></div>
                                <div className='jobentry-company-name'>
                                        <h1>Company name</h1>
                                </div>
                        </div>
                        <h1 className='jobentry-title'>Job Name</h1>
                        <div className='jobentry-info-container'>
                                <h1 className='jobentry-title'>Description:</h1>
                                <p>Seeking a motivated Entry-Level Software Engineer to support the design, development, testing, and maintenance of software applications under senior guidance. Write clean, efficient, and well-documented code Assist in developing new features Debug and resolve issues in existing systems Collaborate with cross-functional teams. Learn and apply new technologies and best practices.</p>
                        </div>
                        <div className='jobentry-apply'>
                                <h3>Apply by: timestamp</h3>
                                <button>Apply</button>
                        </div>
                </div>
        )
}

export default JobEntry
