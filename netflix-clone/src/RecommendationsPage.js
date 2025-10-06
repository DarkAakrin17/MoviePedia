import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import axios from 'axios';
import './Re_card.css';
import ReactPlayer from 'react-player/youtube';
import Rating from 'react-rating';
import movieTrailer from 'movie-trailer';
import RecommendedTVShows from './tvseries';

function RecommendationsPage() {
  const location = useLocation();
  const history = useHistory();
  const searchQuery = new URLSearchParams(location.search).get('search');
  const [userMovie, setUserMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [tvSeriesRecommendations, setTvSeriesRecommendations] = useState([]);
  const [streamingServices, setStreamingServices] = useState([]);
  const [trailerUrl, setTrailerUrl] = useState('');
  const playerRef = useRef(null);
  

  function truncate(str, n) {
    return str?.length > n ? str.substr(0, n - 1) + '...' : str;
  }

  useEffect(() => {
    async function fetchUserMovieData() {
      try {
        const movieData = await fetchMovieData(searchQuery);
        setUserMovie(movieData);
      } catch (error) {
        console.log('Error fetching movie data:', error);
      }
    }

    async function fetchRecommendationsData() {
      try {
        const recommendations = await fetchRecommendationsByTitleAndGenre(searchQuery);
        setRecommendations(recommendations);
      } catch (error) {
        console.log('Error fetching recommendations:', error);
      }
    }

    async function fetchTvSeriesRecommendationsData() {
      try {
        const tvSeriesRecommendations = await fetchTvSeriesRecommendationsByTitleAndGenre(searchQuery);
        setTvSeriesRecommendations(tvSeriesRecommendations);
      } catch (error) {
        console.log('Error fetching TV series recommendations:', error);
      }
    }

    async function fetchStreamingServicesData() {
      try {
        const services = await fetchStreamingServices();
        setStreamingServices(services);
      } catch (error) {
        console.log('Error fetching streaming services:', error);
      }
    }

    if (searchQuery) {
      fetchUserMovieData();
      fetchRecommendationsData();
      fetchTvSeriesRecommendationsData();
    }

    fetchStreamingServicesData();
  }, [searchQuery]);

  async function fetchMovieData(movieTitle) {
    // Replace '4c2f451435eedf81d10e2859f42149d7' with your actual TMDB API key
    const API_KEY = '4c2f451435eedf81d10e2859f42149d7';
    const searchEndpoint = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
      movieTitle
    )}`;

    try {
      const searchResponse = await axios.get(searchEndpoint);
      const searchResults = searchResponse.data.results;

      if (searchResults.length > 0) {
        return searchResults[0];
      } else {
        return null;
      }
    } catch (error) {
      console.log('Error fetching movie data:', error);
      throw new Error('Error fetching movie data');
    }
  }

  async function fetchRecommendationsByTitleAndGenre(movieTitle) {
    const API_KEY = '4c2f451435eedf81d10e2859f42149d7';
    const searchEndpoint = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
      movieTitle
    )}`;

    try {
      const searchResponse = await axios.get(searchEndpoint);
      const searchResults = searchResponse.data.results;

      if (searchResults.length > 0) {
        const movieId = searchResults[0].id; // Assuming the first search result is the desired movie

        // Fetch recommendations by genre
        const recommendationsEndpoint = `https://api.themoviedb.org/3/movie/${movieId}/recommendations?api_key=${API_KEY}`;
        const recommendationsResponse = await axios.get(recommendationsEndpoint);
        const recommendations = recommendationsResponse.data.results;

        // Fetch streaming services for each recommendation
        const recommendationsWithStreamingServices = await Promise.all(
          recommendations.map(async (recommendation) => {
            const streamingServices = await fetchStreamingServices(recommendation.id);
            return {
              ...recommendation,
              streamingServices,
            };
          })
        );

        return recommendationsWithStreamingServices;
      } else {
        return [];
      }
    } catch (error) {
      console.log('Error fetching recommendations:', error);
      throw new Error('Error fetching recommendations');
    }
  }

  async function fetchTvSeriesRecommendationsByTitleAndGenre(tvSeriesTitle) {
    const API_KEY = '4c2f451435eedf81d10e2859f42149d7';
    const searchEndpoint = `https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(
      tvSeriesTitle
    )}`;

    try {
      const searchResponse = await axios.get(searchEndpoint);
      const searchResults = searchResponse.data.results;

      if (searchResults.length > 0) {
        const tvSeriesId = searchResults[0].id; // Assuming the first search result is the desired TV series

        // Fetch recommendations by genre
        const recommendationsEndpoint = `https://api.themoviedb.org/3/tv/${tvSeriesId}/recommendations?api_key=${API_KEY}`;
        const recommendationsResponse = await axios.get(recommendationsEndpoint);
        const recommendations = recommendationsResponse.data.results;

        // Fetch streaming services for each recommendation
        const recommendationsWithStreamingServices = await Promise.all(
          recommendations.map(async (recommendation) => {
            const streamingServices = await fetchStreamingServices(recommendation.id);
            return {
              ...recommendation,
              streamingServices,
            };
          })
        );

        return recommendationsWithStreamingServices;
      } else {
        console.log('Error fetching TV series recommendations:');
        throw new Error('Error fetching TV series recommendations');
      }
    } catch (error) {
      console.log('Error fetching TV series recommendations:', error);
      throw new Error('Error fetching TV series recommendations');
    }
  }

  async function fetchStreamingServices(movieId) {
    // Replace 'your-api-key' with your actual TMDB API key
    const API_KEY = '4c2f451435eedf81d10e2859f42149d7';
    const streamingServicesEndpoint = `https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${API_KEY}`;

    try {
      const response = await axios.get(streamingServicesEndpoint);
      const streamingData = response.data;
      const streamingServices = streamingData.results.US?.flatrate || [];
      return streamingServices;
    } catch (error) {
      console.log('Error fetching streaming services:', error);
      throw new Error('Error fetching streaming services');
    }
  }
  const handleClick = (item) => {
    if (trailerUrl) {
      setTrailerUrl('');
    } else {
      movieTrailer(item?.title || '')
        .then((url) => {
          const urlParams = new URLSearchParams(new URL(url).search);
          setTrailerUrl(urlParams.get('v'));
          scrollToPlayer();
        })
        .catch((error) => console.log(error));
    }
  };

  const scrollToPlayer = () => {
    const cardElements = document.getElementsByClassName('myCard');
    if (cardElements.length > 0) {
      const lastCardElement = cardElements[cardElements.length - 1];
      lastCardElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSearchClick = () => {
    history.push(`/recommendations?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
     <div className='box'>
    <h1>Recommendations for: {searchQuery}</h1>
    <div className="card-container">
      {userMovie && (
        <div className="row">
          <div className="myCard" key={userMovie.id}>
            <div className="innerCard">
              <div className="frontSide">
                <img
                  className="poster"
                  src={`https://image.tmdb.org/t/p/w500${userMovie.poster_path}`}
                  alt={userMovie.title}
                />
              </div>
              <div className="backSide">
                <h3 className="title">{userMovie.title}</h3>
                <p>Release date: {userMovie.release_date}</p>
                <p>Age: {userMovie.content_ratings}</p>
                <Rating
                  initialRating={userMovie.vote_average / 2} // Convert vote_average to 5-star scale
                  emptySymbol={<span className="rating-icon">&#9734;</span>}
                  fullSymbol={<span className="rating-icon">&#9733;</span>}
                  readonly
                  className="star-rating" // Custom CSS class for the Rating component
                  style={{ color: 'yellow', fontSize: '24px' }} // Custom CSS styles for the Rating component
                /> <div className="streamingServices">
                Where to watch: <br></br>
                {userMovie.streamingServices &&
                      userMovie.streamingServices.map((service) => (
                        <img
                          className="streamingServiceLogo"
                          src={`https://image.tmdb.org/t/p/original${service.logo_path}`}
                          alt={service.provider_name}
                          key={service.provider_id}
                        />
                      ))}
            </div>
                <p>{truncate(userMovie.overview, 300)}</p>
              </div>
            </div>
          </div>
          {recommendations.length > 0 && (
            recommendations.map((item) => (
              <div className="myCard" key={item.id} onClick={() => handleClick(item)}>
                <div className="innerCard">
                  <div className="frontSide">
                    <img
                      className="poster"
                      src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                      alt={item.title}
                    />
                  </div>
                  <div className="backSide">
                    <h3 className="title">{item.title}</h3>
                    
                    <p>Release date: {item.release_date}</p>
                    <Rating
                      initialRating={item.vote_average / 2} // Convert vote_average to 5-star scale
                      emptySymbol={<span className="rating-icon">&#9734;</span>}
                      fullSymbol={<span className="rating-icon">&#9733;</span>}
                      readonly
                      className="star-rating" // Custom CSS class for the Rating component
                      style={{ color: 'yellow', fontSize: '24px' }} // Custom CSS styles for the Rating component
                    /><div className="streamingServices">
                      Where to watch: <br></br>
                    {item.streamingServices &&
                      item.streamingServices.map((service) => (
                        <img
                          className="streamingServiceLogo"
                          src={`https://image.tmdb.org/t/p/original${service.logo_path}`}
                          alt={service.provider_name}
                          key={service.provider_id}
                        />
                      ))}
                  </div>
                    <p>{truncate(item?.overview, 275)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
          {tvSeriesRecommendations.length > 0 && (
            tvSeriesRecommendations.map((item) => (
              <div className="myCard" key={item.id} onClick={() => handleClick(item)}>
                {searchQuery && <RecommendedTVShows title={searchQuery} />}
                <div className="innerCard">
                  <div className="frontSide">
                    
                    <img
                      className="poster"
                      src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                      alt={item.name}
                    />
                  </div>
                  <div className="backSide">
                    <h3 className="title">{item.name}</h3>
                    <div className="streamingServices">
                      {item.streamingServices &&
                        item.streamingServices.map((service) => (
                          <img
                            className="streamingServiceLogo"
                            src={`https://image.tmdb.org/t/p/original${service.logo_path}`}
                            alt={service.provider_name}
                            key={service.provider_id}
                          />
                        ))}
                    </div>
                    <p>First air date: {item.first_air_date}</p>
                    <Rating
                      initialRating={item.vote_average / 2} // Convert vote_average to 5-star scale
                      emptySymbol={<span className="rating-icon">&#9734;</span>}
                      fullSymbol={<span className="rating-icon">&#9733;</span>}
                      readonly
                      className="star-rating" // Custom CSS class for the Rating component
                      style={{ color: 'yellow', fontSize: '24px' }} // Custom CSS styles for the Rating component
                    />
                    <p>{truncate(item?.overview, 300)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
    <div ref={playerRef} className="player">
      {trailerUrl && <ReactPlayer url={`https://www.youtube.com/watch?v=${trailerUrl}`} width="100%" height="500px" playing />}
    </div>
  </div>
  );
}

export default RecommendationsPage;
