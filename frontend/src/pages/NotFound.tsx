// frontend/src/pages/NotFound.tsx

import React from "react";
import { useNavigate } from "react-router-dom";
import '../styles/NotFound.css'

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };


  return (
    <div className="utility-wrapper">
        <div className="utility-container">
            <div className="text-mono">404</div>
            <div className="utility-content">
                <h1>Page non trouvée</h1>
                <p>La page que vous recherchez n'existe pas ou a été déplacée.</p>
            </div>
            
            <div><button onClick={handleGoBack}>Retour</button></div>
        </div>
    </div>
  );
};

export default NotFound;