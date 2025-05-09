import React from 'react';
import '../CSS/BenefitsList.css';

function BenefitsList({ title, benefits, className }) {
  return (
    <div className={`benefits-container ${className || ''}`}>
      <h4>{title}</h4>
      <ul className="benefits-list">
        {benefits.map((benefit, index) => (
          <li key={index}>
            <i className="fas fa-check-circle"></i> {benefit}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BenefitsList;
