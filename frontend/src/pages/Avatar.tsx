// frontend/src/pages/Home.tsx

import React from "react";

const Avatar = () => {

  return (
    <>
    <div className="modal-chose-avatar">
        <div className="chose-avatar-profil">
            <section><h3>Choisi ton avatar</h3></section>
            <div className="list-avatar">
                {/* <% avatars.forEach(function(avatar) { %> */}
                    <section className="avatar-profil" data-image="<%= avatar.id %>">
                      <img src="http://localhost:3000/static/media/peeps-avatar-alpha-2.6a6c9d37640551233228.png"/>
                    </section>
                {/* <% }); %> */}
            </div>

            <section className="btn-valid-chose">
                <button className="btn-valid" id="btnValidAvatar" type="button">Valider</button>
            </section>
        </div>
    </div>
    </>
  );
};

export default Avatar;