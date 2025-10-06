import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Banner.css';
import Rating from 'react-rating';

const base_url = 'https://image.tmdb.org/t/p/original/';

function Banner() {
  const [media, setMedia] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const movieRequest = axios.get(
          'https://api.themoviedb.org/3/discover/movie?api_key=4c2f451435eedf81d10e2859f42149d7&with_networks=213'
        );
        const tvRequest = axios.get(
          'https://api.themoviedb.org/3/discover/tv?api_key=4c2f451435eedf81d10e2859f42149d7&with_networks=213'
        );

        const [movieResponse, tvResponse] = await Promise.all([movieRequest, tvRequest]);

        const movieResults = movieResponse.data.results;
        const tvResults = tvResponse.data.results;

        const allResults = [...movieResults, ...tvResults];
        setMedia(allResults);
      } catch (error) {
        console.log('Error fetching movie and TV show data:', error);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex === media.length - 1 ? 0 : prevIndex + 1));
    }, 8000); // Change interval duration here

    return () => clearInterval(interval);
  }, [media]);

  const currentMedia = media[currentIndex];

  function truncate(str, n) {
    return str?.length > n ? str.substr(0, n - 1) + '...' : str;
  }

  return (
    <header
      className="banner"
      style={{
        backgroundSize: 'cover',
        backgroundImage: `url(${base_url}${currentMedia?.backdrop_path})`,
        backgroundPosition: 'top',
      }}
    >
      <div className="banner__contents">
        <h1 className="banner__title">
          {currentMedia?.title || currentMedia?.name || currentMedia?.original_name}
        </h1>
        <Rating
          initialRating={currentMedia?.vote_average / 2}
          emptySymbol={<span className="rating-icon">&#9734;</span>}
          fullSymbol={<span className="rating-icon">&#9733;</span>}
          readonly
          className="star-rating"
          style={{ color: 'yellow', fontSize: '24px' }}
        />
        <h1 className="banner__description">{truncate(currentMedia?.overview, 150)}</h1>
      </div>
      <div className="banner__fadebottom" />
    </header>
  );
}

export default Banner;
