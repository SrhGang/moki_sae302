// frontend/src/pages/Home.tsx

import React, { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "hooks/useAuth";
import "../styles/login.css";

const Signup = () => {
    const { message, signup } = useAuth();
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");

const handleSignup = () => {
        console.log('Username : ', username);
        console.log('Password : ', password);
        signup(username, password);
    }

  return (
    <>
    
          
    <main>
        <div className="container container-login">
            <div className="form-container">
                <section className="bold login-title">Inscrivez-vous à <Link to="/" className="home">Mo<span className="k">k</span>i</Link></section>
                         

                <form className="login-form">
                    <div className="form-group">
                        <input type="text" id="fullname" name="username" placeholder="Nom d'utilisateur" 
                            onChange={(e)=> {
                                setUsername(e.target.value);
                            }}
                        required/>
                    </div>
                    
                    <div className="form-group">
                        <input type="password" id="new-password" name="password" placeholder="Mot de passe" 
                            onChange={(e)=> {
                            setPassword(e.target.value);
                        }}
                        required/>
                    </div>

                    <button type="button" onClick={handleSignup} className="button-primary">S'inscrire</button>
                </form>

                <section className="main-description">
                    <p>Déjà un membre ? <a href="/login" className="link-primary">Se connecter</a>.</p>
                </section>
            </div>
        </div>
        
    </main>
    </>
  );
};

export default Signup;