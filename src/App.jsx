import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import "./App.css"

const App = () => {
  const [loading, setLoading] = useState(false);
  const [jobIds, setJobIds] = useState([]);
  const [jobData, setJobData] = useState([]);
  const [visibleJobs, setVisibleJobs] = useState(6);

  //console.log("jobData.by", jobData[0].by)

  useEffect(() => {
    setLoading(true)
    axios.get('https://hacker-news.firebaseio.com/v0/jobstories.json').then(response => {
      setLoading(false)
      setJobIds(response.data)
    })
      .catch((error) => {
        console.error('Error fetching data:', error);
      })

  }, [])

  useEffect(() => {
    setLoading(true)
    const jobPromises = jobIds.slice(visibleJobs - 6, visibleJobs).map(id => axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`))
    Promise.all(jobPromises)

      .then(jobResponses => {
        const jobData = jobResponses.map(response => response.data)
        setJobData(jobData)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching job data:', error);
        setLoading(false)
      });
  }, [jobIds, visibleJobs])

  const loadMore = () => {
    setVisibleJobs(prevVisibleJobs => (prevVisibleJobs + 6))
  }

  const formattedTimeStamp = (unixTimestamp) => {
    const date = new Date(unixTimestamp * 1000); // Convert seconds to milliseconds
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return date.toLocaleDateString('en-US', options);
  }

  return (
    <>
      <div className="parent-wrapper">
        <div className="container">
          <h1>Hacker News Jobs Board</h1>
          <div className="job-container">
            <div className="job-box">
              <ul>
                {
                  loading && <h2>Loading...</h2>
                }
                {
                  jobData.map((jobDetail, index) => (
                    <li className='job-desc-wrapper' key={jobDetail.id}>
                      <h2><Link to={jobDetail.url}>{jobDetail.title}</Link></h2>
                      <p>By {jobDetail.by} &nbsp; <span>{formattedTimeStamp(jobDetail.time)}</span></p>
                    </li>

                  ))
                }
              </ul>

              {
                (!loading) && visibleJobs < jobIds.length && (
                  <div className="btn-wrapper">
                    <button className="load-btn" onClick={loadMore}>Load More Jobs</button>
                  </div>
                )
              }

              {
                loading && (
                  <div className="btn-wrapper">
                    <button className="load-btn">Loading...</button>
                  </div>
                )
              }
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
