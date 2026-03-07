import './LoadingSpinner.css';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <p className="spinner-message">{message}</p>
    </div>
  );
}
