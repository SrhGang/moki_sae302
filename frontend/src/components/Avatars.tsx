import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/NavBar.css"
import { useAvatar } from "../hooks/useAvatar";


const Avatars = ()=>{
    const [selected, setSelected] = useState<number>(0);
    const { updateAvatar } = useAvatar();
    const navigate = useNavigate();

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
                        <section onClick={()=> {
                            setSelected(index);
                            
                        }} className={`avatar-profil ${selected === index ? '--selected' : ''}`} key={index}>
                            <img className="avatart-item" src={`./assets/img/peeps-avatar-alpha-${index}.png`}/>
                        </section>
                    ))}
                </div>

                <section className="btn-valid-chose">
                    <button onClick={async ()=> {
                        const update = await updateAvatar(`./assets/img/peeps-avatar-alpha-${selected}.png`);
                    

                    }} className="btn-valid" id="btnValidAvatar" type="button">Valider</button>
                
                </section>
            </div>
        </div>
        </>
    )
}
export default Avatars;