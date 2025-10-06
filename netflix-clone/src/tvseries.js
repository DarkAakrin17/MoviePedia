import React, { useEffect, useState } from 'react';
import axios from 'axios';

function RecommendedTVShows({ title }) {
  const [tvShows, setTVShows] = useState([]);

  useEffect(() => {
    async function fetchRecommendedTVShows() {
      try {
        const API_KEY = '4c2f451435eedf81d10e2859f42149d7'; // Replace with your actual API key
        const searchEndpoint = `https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(
          title
        )}`;

        const searchResponse = await axios.get(searchEndpoint);
        const searchResults = searchResponse.data.results;

        if (searchResults.length > 0) {
          const tvSeriesId = searchResults[0].id; // Assuming the first search result is the desired TV series

          // Fetch recommendations for the TV series
          const recommendationsEndpoint = `https://api.themoviedb.org/3/tv/${tvSeriesId}/recommendations?api_key=${API_KEY}`;
          const recommendationsResponse = await axios.get(recommendationsEndpoint);
          const recommendedTVShows = recommendationsResponse.data.results;

          setTVShows(recommendedTVShows);
        } else {
          setTVShows([]);
        }
      } catch (error) {
        console.log('Error fetching recommended TV shows:', error);
      }
    }

    if (title) {
      fetchRecommendedTVShows();
    }
  }, [title]);

  return (
    <p></p>
  );
}

export default RecommendedTVShows;
