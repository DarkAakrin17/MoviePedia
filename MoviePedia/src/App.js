import React from 'react';
import './App.css';
import Row from './Row';
import requests from './requests';
import Nav from './Nav';
import Banner from './Banner';
import SignUp from './components/signup_component';

import {
  BrowserRouter as Router,
  Routes,
  Switch,
  Route,
  Link
} from 'react-router-dom';
import RecommendationsPage from './RecommendationsPage';
import Tvshow from './Series';

function App() {
  return (
    <Router>
      <div className="App">
        <Nav />
        <Banner />
        <Switch>
          <Route exact path="/">
            {/* Render other components or rows */}
         
          </Route>
          <Route path="/recommendations">
            {/* Render the RecommendationsPage component */}
            <RecommendationsPage />
          </Route>
          <Route path="/tv">
            <Tvshow />
          </Route>
          <Route path="/signup">
            <SignUp />
          </Route>
        </Switch> 
            <Row title="NETFLIX ORIGINALS" fetchUrl={requests.fetchNetflixOriginals} isLargeRow={true} />
            <Row title="Trending Now" fetchUrl={requests.fetchTrending} />
            <Row title="Top Rated" fetchUrl={requests.fetchTopRated} />
            <Row title="Action Movies" fetchUrl={requests.fetchActionMovies} />
            <Row title="Comedy Movies" fetchUrl={requests.fetchComedyMovies} />
            <Row title="Romance Movies" fetchUrl={requests.fetchRomanceMovies} />
            <Row title="Horror Movies" fetchUrl={requests.fetchHorrorMovies} />
            <Row title="Documentaries" fetchUrl={requests.fetchDocumentaries} />
      </div>
    </Router>
  );
}

export default App;