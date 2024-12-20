import React, { useState } from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ onSearch }) => {
    return (
        <div className="position-relative">
            <input
                type="text"
                placeholder="Search videos..."
                className="form-control form-control-lg bg-dark text-light border-secondary rounded-pill c-width"
                onChange={(e) => onSearch(e.target.value)}
            />
            <Search
                size={20}
                className="position-absolute top-50 translate-middle-y text-secondary"
                style={{ right: '15px' }}
            />
        </div>
    );
};

export default SearchBar;