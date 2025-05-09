import React from 'react';
import '../CSS/FormInput.css';

function FormInput({
  label,
  type = 'text',
  id,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  icon,
  autoComplete,
  minLength,
  maxLength,
  errorMessage,
}) {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <div className="input-with-icon">
        <i className={icon}></i>
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          minLength={minLength}
          maxLength={maxLength}
          className={errorMessage ? 'input-error' : ''}
        />
      </div>
      {errorMessage && <div className="input-error-message">{errorMessage}</div>}
    </div>
  );
}

export default FormInput;
