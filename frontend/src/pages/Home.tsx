// frontend/src/pages/Home.tsx

import React from "react";
import { Link } from "react-router-dom";

const Home = () => {

  return (
    <>
        <header>
            <div className="container">
                <nav className="nav-header">
                    <section className="nav-logo"><img src="./assets/img/moki1.png" alt="Moki"/></section>
                    <div className="nav-menu">
                        <Link to="/login" className="btn-menu">Se connecter</Link>

                        <div className="toggle-menu">
                            <section className="toogle"></section>
                            <section className="toogle"></section>
                        </div>
                    </div>
                </nav>
            </div>
        </header>


        <main>
            <div className="container">
                <div className="section-container">
                    <section className="small-text">La meilleure plateforme de discussion en groupe sur Moki</section>
                    
                    <section className="big-text">Chattez avec Style</section>
                </div>

                <div className="section-container">
                    <div className="chat-img">
                        <section className="section-img">
                            <img src="./assets/img/moki2.png" />
                        </section>
                    </div>

                    <section className="main-description">
            
                        <div className="descp-grid">
                            <div className="descp-grid-left">
                                
                                <div className="descp-text-animation text-animation-active">
                                    <div className="stagger-text">
                                        <section className="text-animated semi-bold"><span className="img-stagger"><img src="./assets/img/star-of-bethlehem-100.png" alt="" /></span> <strong>Conversations Vivantes :</strong></section>
                                        <section className="text-animated">Explorez des discussions animées avec des groupes partageant vos passions et centres d'intérêt.</section>
                                    </div>
                                </div>
                                
                                <div className="descp-text-animation">
                                    <div className="stagger-text">
                                        <section className="text-animated semi-bold"><span className="img-stagger"><img src="./assets/img/chat-bubble-100.png" alt=""/></span> <strong>Interface Conviviale : </strong></section>
                                        <section className="text-animated">Profitez d'une interface utilisateur intuitive qui rend la navigation et la participation aux conversations aussi simples que possible.</section>
                                    </div>
                                </div>
                                
                                <div className="descp-text-animation">
                                    <div className="stagger-text">
                                        <section className="text-animated semi-bold"><span className="img-stagger"><img src="./assets/img/paint-100.png" alt=""/></span> <strong>Personnalisation Avancée :</strong> </section>
                                        <section className="text-animated">Exprimez-vous avec style grâce à des fonctionnalités de personnalisation avancées pour votre profil et vos discussions.</section>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
            
                        <section className="cta">
                            <Link to="/signup" className="button-primary">Rejoignez Moki maintenant</Link>
                        </section>
                    </section>
                </div>
                
            </div>
        </main>
    </>
  );
};

export default Home;