import React, { useState, useEffect } from 'react'
import axios from './axios';
import "./Row.css";
import Youtube from 'react-youtube';
import movieTrailer from 'movie-trailer';

const base_url = "https://image.tmdb.org/t/p/original/";
function Row({title, fetchUrl ,isLargeRow }) {
    // useState() is something where you can put your variable(dynamic) like arrays, objects, etc.
    const [movies, setMovies] = useState([]) ; 
    const [trailerUrl, setTrailerUrl] = useState("");
    // A snippet of code that runs on specific conditions/variable
    useEffect(()=>{
        // if [], run once when the row loads and don't run again.
        // if [movies], it runs everytime when the movie changes. a row has lots of movies

        async function fetchData(){
            const request = await axios.get(fetchUrl) //await- wait for the promise to come.
            console.log(request);
            setMovies(request.data.results);
            return request;
        }
        
        fetchData();
    },[fetchUrl]);

const opts ={
    height: "500",
    width:"100%",
    playerVars: {

        autoplay: 1,
    },
};    

const handleClick = (movie) => {
    if (trailerUrl){
        setTrailerUrl("");
    } else{
        movieTrailer(movie?.name || "")
           .then((url) => {
            const urlParams = new URLSearchParams(new URL (url).search);
            setTrailerUrl(urlParams.get('v'));
           }) 
           .catch((error) => console.log(error))
    }
};

console.table(movies);

    return (
        <div className='row'>
            <h2>{title}</h2>
            <div className='row__posters'>
                { /* row_posters */}

                { movies.map(movie => (
                    <img
                    key={movie.id} 
                    onClick={(() => handleClick(movie))}
                    className={`row__poster ${isLargeRow && "row__posterLarge"}`}
                    src={`${base_url}${isLargeRow ? movie.poster_path: movie.backdrop_path}`} alt={movie.name}/>
                ))}
            </div>
        {trailerUrl && <Youtube videoId={trailerUrl} opts={opts}/>
    }    </div>
    )
}

export default Row