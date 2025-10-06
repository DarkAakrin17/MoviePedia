import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Rating from 'react-rating';
import './Re_card.css';

function Tvshow() {
  const location = useLocation();
  const searchQuery = new URLSearchParams(location.search).get('search');
  const [tvSeriesRecommendations, setTVSeriesRecommendations] = useState([]);

  useEffect(() => {
    async function fetchTVSeriesRecommendations() {
      try {
        const API_KEY = '4c2f451435eedf81d10e2859f42149d7'; // Replace with your actual API key
        const searchEndpoint = `https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(
          searchQuery
        )}`;

        const searchResponse = await axios.get(searchEndpoint);
        const searchResults = searchResponse.data.results;

        if (searchResults.length > 0) {
          const tvSeriesId = searchResults[0].id; // Assuming the first search result is the desired TV series

          // Fetch recommendations for the TV series
          const recommendationsEndpoint = `https://api.themoviedb.org/3/tv/${tvSeriesId}/recommendations?api_key=${API_KEY}`;
          const recommendationsResponse = await axios.get(recommendationsEndpoint);
          const recommendedTVShows = recommendationsResponse.data.results;

          setTVSeriesRecommendations(recommendedTVShows);
        } else {
          setTVSeriesRecommendations([]);
        }
      } catch (error) {
        console.log('Error fetching recommended TV shows:', error);
      }
    }

    if (searchQuery) {
      fetchTVSeriesRecommendations();
    }
  }, [searchQuery]);

  
  return (
    <div className="box">
      <h1>Recommendations for: {searchQuery}</h1>
      <div className="card-container">
        {tvSeriesRecommendations.length > 0 && (
          <div className="row">
            {tvSeriesRecommendations.map((item) => (
              <div className="myCard" key={item.id}>
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
                    <div className="rating">
                    <Rating
                      initialRating={item.vote_average / 2}
                      emptySymbol={<span class="rating-icon">&#9734;</span>}
                      fullSymbol={<span class="rating-icon">&#9733;</span>}
                      readonly
                      class="star-rating"
                      style={{ color: 'yellow', fontSize: '24px' }}
                    />
                    </div>
                    <p>{item.overview}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Tvshow;
