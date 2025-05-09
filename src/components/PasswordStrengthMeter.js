import React from 'react';
import '../CSS/PasswordStrengthMeter.css';

function PasswordStrengthMeter({ score, message }) {
  return (
    <div className="password-strength">
      <div className="strength-meter">
        <div
          className={`strength-progress strength-${score >= 5 ? 5 : score}`}
          style={{ width: `${(score / 5) * 100}%` }}
        ></div>
      </div>
      <div className="strength-text">{message}</div>
    </div>
  );
}

export default PasswordStrengthMeter;
