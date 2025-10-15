// frontend/src/pages/Home.tsx

import React from "react";
import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import "../styles/home.css";

const Home = () => {

  return (
    <>
        <NavBar />

        <main>
            <div className="container">
                <div className="section-container">
                    <section className="intro-text big">La meilleure plateforme de discussion</section>
                    

                    <section className="big-text big">Chattez avec <span className="style-text big">Style</span></section>

                    <Link to="/login" className="btn-intro">Commencer</Link>
                </div>

                <div className="section-container">
                    <div className="chat-img">
                        <section className="section-img">
                            {/* <img src="./assets/img/moki2.png" /> */}
                        </section>
                    </div>
                </div>
            </div>

            <div className="icon-container">
                    <section className="main-description"><br/>
                        <section className="intro-text big">Binevenue sur Mo<span className="k">k</span>i</section>
            
                        <div className="descp-grid">
                            <div className="descp-grid-left">
                                
                                {/* <div className="descp-text-animation text-animation-active">
                                    <div className="stagger-text">
                                        <section className="text-animated semi-bold"><span className="img-stagger"><img src="./assets/img/star-of-bethlehem-100.png" alt="" /></span> <strong>Conversations Vivantes :</strong></section>
                                        <section className="text-animated">Explorez des discussions animées avec des groupes partageant vos passions et centres d'intérêt.</section>
                                    </div>
                                </div> */}

                                <div className="descp-text-animation">
                                    <img src="./assets/img/star-of-bethlehem-100.png" alt=""/>
                                    <div className="content">
                                        <h3>Conversations Vivantes</h3>
                                        <section className="text-animated">Explorez des discussions animées avec des groupes partageant vos passions et centres d'intérêt.</section>
                                        
                                
                                    </div>
                                </div>
                                
                                {/* <div className="descp-text-animation">
                                    <div className="stagger-text">
                                        <section className="text-animated semi-bold"><span className="img-stagger"><img src="./assets/img/chat-bubble-100.png" alt=""/></span> <strong>Interface Conviviale : </strong></section>
                                        <section className="text-animated">Profitez d'une interface utilisateur intuitive qui rend la navigation et la participation aux conversations aussi simples que possible.</section>
                                    </div>
                                </div> */}

                                 <div className="descp-text-animation">
                                    <img src="./assets/img/chat-bubble-100.png" alt=""/>
                                    <div className="content">
                                        <h3>Interface conviviale</h3>
                                        <section className="text-animated">Profitez d'une interface utilisateur intuitive qui rend la navigation et la participation aux conversations aussi simples que possible.</section>
                                        
                                
                                    </div>
                                </div>
                                
                                {/* <div className="descp-text-animation">
                                    <div className="stagger-text">
                                        <section className="text-animated semi-bold"><span className="img-stagger"><img src="./assets/img/paint-100.png" alt=""/></span> <strong>Personnalisation Avancée :</strong> </section>
                                        <section className="text-animated">Exprimez-vous avec style grâce à des fonctionnalités de personnalisation avancées pour votre profil et vos discussions.</section>
                                    </div>
                                </div> */}

                                <div className="descp-text-animation">
                                    <img src="./assets/img/paint-100.png" alt=""/>
                                    <div className="content">
                                        <h3>Personnalisation avancée :</h3>
                                        <section className="text-animated">Exprimez-vous avec style grâce à des fonctionnalités de personnalisation avancées pour votre profil et vos discussions.</section>
                                       
                                
                                    </div>
                                </div>

                            </div>
                        </div>
                        <br/>
            
                        <section className="cta">
                            <Link to="/Signup" className="btn-outro">Rejoignez Moki maintenant</Link>
        
                        </section>
                    </section>
                </div>
                
                
            
        </main>
    </>
  );
};

export default Home;