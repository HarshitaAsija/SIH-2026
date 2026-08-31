import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("AASRA App Component Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '4rem auto', fontFamily: 'sans-serif', backgroundColor: '#FFFDFC', border: '1px solid #DDD9D1', borderRadius: '1rem', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#72243E', fontSize: '1.25rem', fontWeight: 'bold' }}>AASRA App Display Notice</h2>
          <p style={{ color: '#697075', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            A temporary component error occurred while rendering the page. Click below to reload the app cleanly.
          </p>
          <pre style={{ backgroundColor: '#F7F4EE', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.75rem', color: '#34383C', overflowX: 'auto', marginTop: '1rem' }}>
            {this.state.error?.toString() || 'Unknown React render error'}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '1.5rem', backgroundColor: '#527D7D', color: '#FFFFFF', padding: '0.5rem 1.25rem', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Reload AASRA App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
