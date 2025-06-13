import React from 'react';

const CategoryList = ({ categories }) => {
    return (
        <div>
            <h2>Danh sách chuyên mục ({categories.length}):</h2>
            <ul>
                {categories.map((cat) => (
                    <li key={cat.id}>
                        {cat.name}
                        {cat.description && ` (${cat.description})`}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CategoryList;
