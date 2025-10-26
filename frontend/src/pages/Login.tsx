// frontend/src/pages/Home.tsx

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/login.css"; 
import useAuth from "hooks/useAuth";
import { useAuthContext } from "contexts/AuthContext";

const Login = () => {
    const { message, login } = useAuth();
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const {keys} = useAuthContext();
    const navigate = useNavigate();

    const handleLogin = async() => {
        console.log('Username : ', username);
        console.log('Password : ', password);
        
        const connect = await login(username, password);
        
        if (connect == "LOGIN_SUCCESS"){
        console.log("keys");
        
      navigate ("/dashboard");
    }
    }

  useEffect(()=>{
    if (keys.accessToken){
        console.log("keys");
        
      navigate ("/dashboard");
    }
    
  }, [keys])

  return (
    <>
    <main>
        <div className="container container-login">
            <div className="form-container">
                <section className="bold login-title">Connectez-vous à <Link to="/" className="home">Mo<span className="k">k</span>i</Link></section>

                <form className="login-form">
                    <div className="form-group">

                        <input type="text" id="username" name="username" placeholder="Nom d'utilisateur" value={username}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>)=> {
                            setUsername(event.target.value);
                        }}
                        required />
                    </div>

                    <div className="form-group">
                        
                        <input type="password" id="password" name="password" value={password} placeholder="Mot de passe"
                            onChange={(event: React.ChangeEvent<HTMLInputElement>)=> {
                            setPassword(event.target.value);
                        }}
                        required />
                    </div>

                    <section className="message">{message}</section>

                    <button type="button" onClick={handleLogin} className="button-primary">Se connecter</button>
                </form>

                <section className="main-description">
                    <p>Nouveau sur Moki ? <Link to="/Signup" className="link-primary">Inscrivez-vous ! </Link></p>
                </section>
            </div>
        </div>
    </main>
    </>
  );
};

export default Login;