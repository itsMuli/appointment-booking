import { useState } from 'react';
import PropTypes from 'prop-types';
import { Eye, EyeOff } from 'lucide-react';

const PasswordInput = ({ value, onChange, name = 'password', placeholder = 'Password', required = false, className = '' }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <input
        name={name}
        value={value}
        onChange={onChange}
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-md pr-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      />
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
      >
        {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
};

PasswordInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string
};

PasswordInput.defaultProps = {
  value: '',
  name: 'password',
  placeholder: 'Password',
  required: false,
  className: ''
};

export default PasswordInput;
