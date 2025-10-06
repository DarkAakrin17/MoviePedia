import React, { useState, useEffect } from 'react';
import logoImage from './logo.png';
import './Nav.css';
import { useHistory, useLocation } from 'react-router-dom';

function Nav() {
  const [show, handleShow] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const history = useHistory();
  const location = useLocation();

  const handleInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim() !== '') {
      // Redirect to the RecommendationsPage with the search query as a URL parameter
      history.push(`/recommendations?search=${encodeURIComponent(searchQuery)}`);
      window.location.reload();
       // Refresh the page
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        handleShow(true);
      } else handleShow(false);
    });
  });

  const handleLogoClick = () => {
    history.goBack();
  };



  return (
    <div className={`nav ${show && 'nav__black'}`}>
      <a href="/" onClick={handleLogoClick}>
        <img className="nav__logo" src={logoImage} alt="MoviePedia Logo" />
      </a>
      <div class="input__container">
        <div class="shadow__input"></div>
        <button class="input__button__shadow" onClick={handleSearch}  >
          <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" height="20px" width="20px">
            <path
              d="M4 9a5 5 0 1110 0A5 5 0 014 9zm5-7a7 7 0 104.2 12.6.999.999 0 00.093.107l3 3a1 1 0 001.414-1.414l-3-3a.999.999 0 00-.107-.093A7 7 0 009 2z"
              fill-rule="evenodd"
              fill="#17202A"
            ></path>
          </svg>
        </button>
        <input
          type="text"
          class="input__search"
          placeholder="Enter a full movie name"
          autocorrect="off"
          autocapitalize="off"
          required
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
      </div>
      <button className='nav__avatar'>
      </button>
    </div>
  );
}

export default Nav;
