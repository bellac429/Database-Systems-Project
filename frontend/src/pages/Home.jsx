import './Home.css'
import JobEntry from '../components/JobEntry'

function Home() {
        return(
                <div className="home-container">
                        {/* <h1>Homepage</h1> */}
                        <JobEntry/>
                </div>
        )
}

export default Home