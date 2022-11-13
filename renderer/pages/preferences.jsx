import React from "react";
import Head from "next/head";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { AiFillHome, AiFillDelete } from "react-icons/ai";

function Preference() {
  const [pref, setPref] = useState({
    nom: "",
    adresse: "",
    zip: "",
    ville: "",
    telephone: "",
    mail: "",
    website: "",
    iban: "",
    langue: "fr",
    img: "",
    persRef: "",
    comm1: "",
    comm2: "",
  });

  const prefRef = useRef();
  prefRef.current = pref;
  function encondeImageFileAsUrl(element) {
    var file = element.target.files[0];
    var reader = new FileReader();
    reader.onloadend = function () {
      setPref({ ...pref, img: reader.result });
    };
    reader.readAsDataURL(file);
  }
  useEffect(() => {
    if (localStorage.getItem("MY_PREF") === null) {
      localStorage.setItem("MY_PREF", JSON.stringify(pref));
    }
    const data = window.localStorage.getItem("MY_PREF");
    if (data !== null) setPref(JSON.parse(data));
  }, []);

  let dataStr, dataUri, exportFileDefaultName;
  useEffect(() => {
    dataStr = JSON.stringify(pref);
    dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    exportFileDefaultName = pref.nom + ".json";
    window.localStorage.setItem("MY_PREF", JSON.stringify(pref));
  }, [pref]);

  const handleDownload = () => {
    let element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(dataStr));
    element.setAttribute("download", exportFileDefaultName);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  };
  function onReaderLoad(event) {
    var obj = JSON.parse(event.target.result);
    setPref(obj);
  }

  return (
    <div className="grid grid-col-1 text-2xl w-full ">
      <Head>
        <title>Pay Your Bill - MF</title>
      </Head>
      <div className="menu">
        <Link href="/home">
          <AiFillHome />
        </Link>
      </div>
      <form className="bg-white shadow-md rounded px-8 pt-6 pb-8">
        <h1 className="text-6xl font-normal leading-normal mt-0 mb-2 text-gray-800">{pref.langue === "fr" ? "Préférences" : "Einstellungen"}</h1>
        <label className="block text-gray-700 text-ssm font-bold mb-2" htmlFor="import">
          {pref.langue === "fr" ? "Importer profil utilisateur·rice" : "Profil importieren"}
        </label>
        <input
          className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
          onChange={(e) => {
            if (e.target.files[0]) {
              var reader = new FileReader();
              reader.onload = onReaderLoad;
              reader.readAsText(e.target.files[0]);
            }
          }}
          type="file"
          accept="application/JSON"
        />
        <label className="block text-gray-700 text-ssm font-bold mb-2" htmlFor="langue">
          {pref.langue === "fr" ? "Langue" : "Sprache"}
        </label>
        <div className="inline-block relative w-64">
          <select
            className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
            onChange={(e) => setPref({ ...pref, langue: e.target.value })}
            value={pref.langue}
            name="langue"
            id=""
          >
            <option value="fr" selected>
              Français
            </option>
            <option value="de">Deutsch</option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
        <div className="crediteur">
          <label className="block text-gray-700 text-ssm font-bold mb-2" htmlFor="nom">
            Logo (.png/.jpg)
          </label>
          {pref.img != "" && (
            <div style={{ position: "relative", paddingBottom: "10px", width: "150px" }}>
              <img style={{ maxWidth: "115px", height: "auto" }} src={pref.img} alt="" />
              <AiFillDelete
                onClick={() => {
                  setPref({ ...pref, img: "" });
                }}
                style={{ position: "absolute", top: 0, right: 0, fontSize: "25px" }}
              />
            </div>
          )}
          {pref.img === "" && (
            <input
              class="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
              type="file"
              accept="image/png, image/jpeg"
              onChange={(e) => {
                console.log(e);
                if (e.target.files[0]) {
                  encondeImageFileAsUrl(e);
                }
              }}
            />
          )}

          <label className="block text-gray-700 text-ssm font-bold mb-2" htmlFor="nom">
            {pref.langue === "fr" ? "Nom*" : "Name*"}
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={pref.nom}
            onChange={(e) => setPref({ ...pref, nom: e.target.value })}
            type="text"
            name="nom"
            maxlength="70"
          />
          <label className="block text-gray-700 text-ssm font-bold mb-2" htmlFor="adresse">
            Adresse*
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={pref.adresse}
            onChange={(e) => setPref({ ...pref, adresse: e.target.value })}
            type="text"
            name="adresse"
            maxlength="70"
          />
          <label className="block text-gray-700 text-ssm font-bold mb-2" htmlFor="zip">
            {pref.langue === "fr" ? "Code postal*" : "Postleitzahl*"}
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={pref.zip}
            onChange={(e) => setPref({ ...pref, zip: e.target.value })}
            type="text"
            name="zip"
            maxlength="16"
          />
          <label className="block text-gray-700 text-ssm font-bold mb-2" htmlFor="ville">
            {pref.langue === "fr" ? "Ville*" : "Stadt*"}
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={pref.ville}
            onChange={(e) => setPref({ ...pref, ville: e.target.value })}
            type="text"
            name="ville"
            maxlength="35"
          />
          <label className="block text-gray-700 text-ssm font-bold mb-2" htmlFor="telephone">
            {pref.langue === "fr" ? "Téléphone" : "Telefon"}
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={pref.telephone}
            onChange={(e) => setPref({ ...pref, telephone: e.target.value })}
            type="text"
            name="telephone"
          />
          <label className="block text-gray-700 text-ssm font-bold mb-2" htmlFor="mail">
            {pref.langue === "fr" ? "Mail" : "Email"}
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={pref.mail}
            onChange={(e) => setPref({ ...pref, mail: e.target.value })}
            type="text"
            name="mail"
          />
          <label className="block text-gray-700 text-ssm font-bold mb-2" htmlFor="nom">
            {pref.langue === "fr" ? "Website" : "Webseite"}
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={pref.website}
            onChange={(e) => setPref({ ...pref, website: e.target.value })}
            type="text"
            name="website"
          />
          <label className="block text-gray-700 text-ssm font-bold mb-2" htmlFor="nom">
            {pref.langue === "fr" ? "IBAN*" : "IBAN*"}
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={pref.iban}
            onChange={(e) => setPref({ ...pref, iban: e.target.value })}
            type="text"
            name="iban"
            maxlength="26"
          />

          <hr style={{ marginBottom: "30px", marginTop: "30px" }}></hr>
          <h2 className="text-4xl font-normal leading-normal mt-0 mb-2 text-gray-800">
            {pref.langue === "fr" ? "Remplissage automatique" : "Automatisch ausfüllung"}
          </h2>
          <label className="block text-gray-700 text-ssm font-bold mb-2" htmlFor="persref">
            {pref.langue === "fr" ? "Personne de référence" : "Ansprechperson"}
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={pref.persRef}
            placeholder="Marie Taline"
            onChange={(e) => setPref({ ...pref, persRef: e.target.value })}
            type="text"
            name="persref"
          />
          <label className="block text-gray-700 text-ssm font-bold mb-2" htmlFor="communication">
            {pref.langue === "fr" ? "Communication" : "Mitteilung"}
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={pref.comm1}
            placeholder={
              pref.langue === "fr" ? "Payable dans les 30 jours suivant la réception" : "Zahlbar bis spätestens 30 Tage nach Rechnungseingang"
            }
            type="text"
            onChange={(e) => setPref({ ...pref, comm1: e.target.value })}
          />
          <label className="block text-gray-700 text-ssm font-bold mb-2" htmlFor="communication">
            {pref.langue === "fr" ? "Communication 2" : "Mitteilung 2"}
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={pref.comm2}
            placeholder={pref.langue === "fr" ? "Merci et meilleures salutations" : "Vielen Dank und freundliche Grüsse"}
            type="text"
            onChange={(e) => setPref({ ...pref, comm2: e.target.value })}
          />
          <div
            className="button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={() => handleDownload()}
          >
            {pref.langue === "fr" ? "EXPORTER PROFIL UTILISATEUR·RICE" : "PROFIL EXPORTIEREN"}
          </div>
        </div>
      </form>
    </div>
  );
}

export default Preference;
