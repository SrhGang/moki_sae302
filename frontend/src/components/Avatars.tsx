import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/NavBar.css"

const Avatars = ()=>{
    const [selected, setSelected] = useState(0);

    return(
        <>
        <div className="modal-chose-avatar">
            <div className="chose-avatar-profil">
                <section>
                    <h3 className="big">Choisi ton avatar</h3>
                </section>
                
                <div className="list-avatar">
                    {Array.from({length: 9}).map((_, index) => 
                    (
                        <section className="avatar-profil" key={index}>
                            <img className="avatart-item" src={`./assets/img/peeps-avatar-alpha-${index}.png`}/>
                        </section>
                    ))}
                </div>

                <section className="btn-valid-chose">
                    <button className="btn-valid" id="btnValidAvatar" type="button">Valider</button>
                </section>
            </div>
        </div>
        </>
    )
}
export default Avatars;