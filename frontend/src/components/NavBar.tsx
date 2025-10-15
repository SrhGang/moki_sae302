import React from "react";
import { Link } from "react-router-dom";
import "../styles/NavBar.css"


const NavBar = ()=>{
    return(
        <>
        <header>
            <div className="container">
                <nav className="nav-header">
                    <Link to="/" className="nav-logo"><img src="./assets/img/moki1.png" alt="Moki"/></Link>
                    
                    <div className="nav-menu">
                        <Link to="/avatars" className="btn-menu ">Avatars </Link>
                        <Link to="/signup" className="btn-menu">S'inscrire </Link>
                        <Link to="/login" className="btn-menu menu-active">Se connecter </Link>
                        <Link to="/dashboard" className="btn-menu menu-active">Tableau de bord </Link>
                        

                        <div className="toggle-menu">
                            <section className="toogle"></section>
                            <section className="toogle"></section>
                        </div>
                    </div>
                </nav>
            </div>
        </header>
        </>
    )
}
export default NavBar