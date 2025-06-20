
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Restore the main App component

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Fatal: Root element #root not found in HTML. React cannot render.");
  document.body.innerHTML = '<div style="color:red;font-family:sans-serif;padding:20px;text-align:center;"><h1>Critical Error</h1><p>The HTML element with id="root" was not found. React application cannot start.</p></div>';
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("React app (App.tsx) rendering initiated.");
  } catch (error) {
    console.error("Error rendering React App:", error);
    rootElement.innerHTML = `
      <div style="color:red;font-family:sans-serif;padding:20px;background-color:#fff0f0;border:2px solid red;text-align:left;">
        <h2 style="color:darkred;">An error occurred during React rendering:</h2>
        <p><strong>Message:</strong> ${(error as Error).message}</p>
        <pre style="white-space:pre-wrap;word-wrap:break-word;background-color:#f9f9f9;padding:10px;border:1px solid #ddd;"><strong>Stack:</strong>\n${(error as Error).stack}</pre>
        <p>Please check the browser console for more details (F12 or Right-click &gt; Inspect &gt; Console).</p>
      </div>
    `;
  }
}

// Basic checks for React/ReactDOM (optional, can be removed if App loads)
if (typeof React === 'undefined') {
    console.error("CRITICAL: React library is undefined. Check import map & CDN.");
}
if (typeof ReactDOM === 'undefined' || typeof ReactDOM.createRoot !== 'function') {
    console.error("CRITICAL: ReactDOM or ReactDOM.createRoot is undefined. Check import map & CDN.");
}
console.log("index.tsx script execution finished.");
