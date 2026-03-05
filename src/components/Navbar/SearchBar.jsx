import React, { useContext, useState } from 'react'
import { MdSearch } from "react-icons/md";
import './Navbar.css'
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';

export default function SearchBar() {

    const { setSearchTerm } = useContext(StoreContext);
    const [inputValue, setInputValue] = useState('');
    const navigate = useNavigate();

    const handleSearch = () => {
        if (inputValue.trim() !== "") {
            setSearchTerm(inputValue.trim());
            navigate('/search');
        }
    }

    const handleKey = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    }

    return (
        <div className="navbar-search">
            <MdSearch 
                className="search-icon"
                onClick={handleSearch}
                style={{ cursor: "pointer" }}
            />
            <input
                type="text"
                placeholder="Search dishes"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKey}
            />
        </div>
    )
}