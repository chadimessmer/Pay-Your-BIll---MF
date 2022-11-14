import React from "react";
import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
let { ipcRenderer } = require("electron");
import { AiFillSetting } from "react-icons/ai";
import chaching from "../sounds/chaching.mp3";
import toast, { Toaster } from "react-hot-toast";

function Home() {
  const [values, setValue] = useState({
    dcrediteur: "",
    dadresse: "",
    dzip: "",
    dcity: "",
    communication: "",
    communication2: "",
    folder: "",
    type: "facture",
    factures: [],
    message: "",
    reference: "",
    title: "",
    doctitle: "",
    persref: "",
    qriban: false,
    nurqr: false,
    total: "",
    format: "A6",
  });
  const [totalAmount, setTotalAmount] = useState(0);
  const [enFrancais, setEnFrancais] = useState(true);

  useEffect(() => {
    if (localStorage.getItem("MY_PREF") != null) {
      const data = JSON.parse(window.localStorage.getItem("MY_PREF"));
      if (data.langue === "fr") {
        setEnFrancais(true);
      } else {
        setEnFrancais(false);
      }

      let persRefData = "";
      let comm1Data = "";
      let comm2Data = "";
      if (data.persRef) {
        persRefData = data.persRef;
      }
      if (data.comm1) {
        comm1Data = data.comm1;
      }
      if (data.comm2) {
        comm2Data = data.comm2;
      }
      setTimeout(() => {
        setValue({ ...values, persref: persRefData, communication: comm1Data, communication2: comm2Data });
      }, 100);
    }
    checkQr();
  }, []);
  const { factures } = values;
  const [folder, setFolder] = useState("");

  const successToast = () => toast(enFrancais ? "PDF exporté !" : "PDF exportiert !", { icon: "💰" });
  const problemToast = () => toast("Oh non, y'a eu un problème", { icon: "😵‍💫" });

  const clearBill = () => {
    if (localStorage.getItem("MY_PREF") != null) {
      const data = JSON.parse(window.localStorage.getItem("MY_PREF"));
      setValue({
        dcrediteur: "",
        dadresse: "",
        dzip: "",
        dcity: "",
        communication: data.comm1,
        communication2: data.comm2,
        folder: "",
        type: "facture",
        factures: [],
        message: "",
        reference: "",
        title: "",
        doctitle: "",
        persref: data.persRef,
        qriban: false,
        nurqr: false,
        total: "",
        format: "A6",
      });
    } else {
      setValue({
        dcrediteur: "",
        dadresse: "",
        dzip: "",
        dcity: "",
        communication: "",
        communication2: "",
        folder: "",
        type: "facture",
        factures: [],
        message: "",
        reference: "",
        title: "",
        doctitle: "",
        persref: "",
        qriban: false,
        nurqr: false,
        total: "",
        format: "A6",
      });
    }
  };
  const [currency, setCurrency] = useState("CHF");

  const handleCheckout = async (e) => {
    const soundChaching = new Audio(chaching);

    const myData = JSON.parse(window.localStorage.getItem("MY_PREF"));
    soundChaching.play();

    let responseText = await ipcRenderer.invoke("console", values, myData, currency);
    if (responseText === "success") {
      successToast();
    } else {
      problemToast();
    }
  };

  const checkQr = async (qriban) => {
    const myData = JSON.parse(window.localStorage.getItem("MY_PREF"));

    if (myData) {
      const iban = myData.iban;

      let responseText = await ipcRenderer.invoke("qriban", iban);
      setValue({ ...values, qriban: responseText });
    }
  };

  const addMore = (e) => {
    e.preventDefault();
    let newField = { qty: "", desc: "", prix: "" };

    let newValue = factures;

    newValue.push(newField);

    setValue({ ...values, factures: newValue });
  };

  const fileRequest = () => {
    ipcRenderer.send("file-request");

    ipcRenderer.on("file", (event, file) => {
      let link = file;
      if (link.includes("\\")) {
        link += "\\";
      } else {
        link += "/";
      }
      setFolder(link);
    });
  };

  let dataStr, dataUri, exportFileDefaultName;

  useEffect(() => {
    setValue({ ...values, folder: folder });
  }, [folder]);

  useEffect(() => {
    dataStr = JSON.stringify(values);
    dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    exportFileDefaultName = values.doctitle + ".json";
    if (factures.length > 0) {
      let total = 0;
      for (const facture of factures) {
        if (facture.prix != "") {
          let thisFacture = parseFloat(facture.prix);
          total += thisFacture;
        }
      }
      setTotalAmount(total.toFixed(2));
    }
  }, [values]);

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
    setValue(obj);
  }

  return (
    <React.Fragment>
      <Head>
        <title>Pay Your Bill - MF</title>
      </Head>
      <div className="grid grid-col-1 text-2xl w-full ">
        <div className="menu">
          <Link href="/preferences">
            <AiFillSetting />
          </Link>
        </div>
        <form
          className="bg-white shadow-md rounded px-8 pt-6 pb-8"
          id="myForm"
          onSubmit={() => {
            e.preventDefault();

            handleCheckout();
          }}
        >
          <h1 className="text-6xl font-normal leading-normal mt-0 mb-2 text-gray-800">{enFrancais ? "Facture" : "Rechnung"}</h1>

          <div className="crediteur">
            <div className="button delete text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" onClick={() => clearBill()}>
              {enFrancais ? "NOUVELLE FACTURE" : "NEUE RECHNUNG"}
            </div>
            <label className="block text-gray-700 text-ssm font-bold mb-2" htmlFor="import">
              {enFrancais ? "Importer fichier" : "Datei importieren"}
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

            <div className="flex pt-5">
              <label className="block text-gray-700 text-ssm font-bold mb-2" htmlFor="cars">
                {enFrancais ? "Type" : "Dokumententyp"}
              </label>
              <div className="inline-block relative w-64">
                <select
                  className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                  value={values.type}
                  onChange={(e) => {
                    if (e.target.value === "qr") {
                      setValue({ ...values, nurqr: true, type: e.target.value });
                    } else {
                      setValue({ ...values, nurqr: false, type: e.target.value });
                    }
                  }}
                  name="type"
                  id="type"
                >
                  <option value="facture">{enFrancais ? "Facture" : "Rechnung"}</option>
                  <option value="qr">{enFrancais ? "QR-code uniquement" : "Nur QR-Code"}</option>
                  <option value="devis">{enFrancais ? "Devis" : "Offerte"}</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>

              <label className="pl-10 block text-gray-700 text-ssm font-bold mb-2" htmlFor="currency">
                {enFrancais ? "Devise" : "Währung"}
              </label>
              <div className="inline-block relative w-64">
                <select
                  className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                  value={currency}
                  name="currency"
                  id="currency"
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="CHF">CHF</option>
                  <option value="EUR">EUR</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
            {values.nurqr && (
              <div>
                <label className="block text-gray-700 text-ssm font-bold mb-2" htmlFor="cars">
                  {enFrancais ? "Format" : "Dokumentformat"}
                </label>
                <div className="inline-block relative w-64">
                  <select
                    className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                    value={values.format}
                    onChange={(e) => {
                      setValue({ ...values, format: e.target.value });
                    }}
                    name="type"
                    id="type"
                  >
                    <option value="A4">A4</option>
                    <option value="A5">A5</option>
                    <option value="A6">A6</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            <hr style={{ marginBottom: "30px", marginTop: "30px" }}></hr>
            <h2 className="text-4xl font-normal leading-normal mt-0 mb-2 text-gray-800">{enFrancais ? "Destinataire" : "Empfänger*in"}</h2>
            <label className="block text-gray-700 text-ssm font-bold mb-2" htmlFor="creditor">
              {enFrancais ? "Nom" : "Name"}
            </label>
            <input
              cl
              value={values.dcrediteur}
              placeholder="Mr Money"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              onChange={(e) => setValue({ ...values, dcrediteur: e.target.value })}
              type="text"
              name="creditor"
              maxlength="70"
            />
            <label className="block text-gray-700 text-ssm font-bold mb-2" htmlFor="adress">
              Adresse
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={values.dadresse}
              placeholder="Dollar street 100"
              onChange={(e) => setValue({ ...values, dadresse: e.target.value })}
              type="text"
              name="adress"
              maxlength="70"
            />
            <label className="block text-gray-700 text-ssm font-bold mb-2" htmlFor="zip">
              {enFrancais ? "Code postal" : "Postleitzahl"}
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={values.dzip}
              placeholder="1000"
              onChange={(e) => setValue({ ...values, dzip: e.target.value })}
              type="text"
              name="zip"
              maxlength="16"
            />
            <label className="block text-gray-700 text-ssm font-bold mb-2" htmlFor="city">
              {enFrancais ? "Ville" : "Stadt"}
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={values.dcity}
              placeholder="MoneyCity"
              onChange={(e) => setValue({ ...values, dcity: e.target.value })}
              type="text"
              name="city"
              maxlength="35"
            />
            {!values.nurqr && (
              <div>
                <label className="block text-gray-700 text-ssm font-bold mb-2" htmlFor="titre">
                  {enFrancais ? "Titre du document" : "Titel Dokument"}
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={values.title}
                  placeholder={enFrancais ? "Facture 292929" : "Rechnung 292929"}
                  onChange={(e) => setValue({ ...values, title: e.target.value })}
                  type="text"
                  name="titre"
                />
                <label className="block text-gray-700 text-ssm font-bold mb-2" htmlFor="persref">
                  {enFrancais ? "Personne de référence" : "Ansprechperson"}
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={values.persref}
                  placeholder="Marie Taline"
                  onChange={(e) => setValue({ ...values, persref: e.target.value })}
                  type="text"
                  name="persref"
                />
              </div>
            )}

            {values.qriban && (
              <div>
                <label className="block text-gray-700 text-ssm font-bold mb-2" htmlFor="message">
                  {enFrancais ? "Référence (seulement pour QR-IBAN)" : "Referenz (nur für QR-IBAN)"}
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={values.reference}
                  placeholder="210000000003139471430009017"
                  onChange={(e) => setValue({ ...values, reference: e.target.value })}
                  type="text"
                  name="titre"
                />
              </div>
            )}

            <label className="block text-gray-700 text-ssm font-bold mb-2" htmlFor="message">
              {enFrancais ? "Informations supplémentaires" : "Zusätzliche Informationen"}
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={values.message}
              placeholder="ref: 292929"
              onChange={(e) => setValue({ ...values, message: e.target.value })}
              type="text"
              name="titre"
            />

            <hr style={{ marginBottom: "30px", marginTop: "30px" }}></hr>
            {values.nurqr ? (
              <div>
                <label className="block text-gray-700 text-ssm font-bold mb-2" htmlFor="total">
                  {enFrancais ? "Total" : "Total"}
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={values.total}
                  onChange={(e) => setValue({ ...values, total: e.target.value })}
                  type="number"
                  name="total"
                />
              </div>
            ) : (
              <div>
                <h2 className="text-4xl font-normal leading-normal mt-0 mb-2 text-gray-800" htmlFor="">
                  {enFrancais ? "Entrées" : "Eintrag"}
                </h2>
                {factures.map((input, index) => {
                  return (
                    <div className="entree" key={index}>
                      <label className="text-gray-700 text-sm font-bold mb-2" htmlFor="quantité">
                        {enFrancais ? "Quantité" : "Anzahl"}
                      </label>
                      <input
                        className="quantitee shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={values.factures[index].qty}
                        onChange={(e) => {
                          let newFactures = values.factures;

                          newFactures[index].qty = e.target.value;

                          setValue({ ...values, factures: newFactures });
                        }}
                        type="text"
                        name="quantité"
                      />
                      <label className=" text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                        {enFrancais ? "Description" : "Bezeichnung"}
                      </label>
                      <input
                        className="description shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={values.factures[index].desc}
                        onChange={(e) => {
                          let newFactures = values.factures;

                          newFactures[index].desc = e.target.value;

                          setValue({ ...values, factures: newFactures });
                        }}
                        type="text"
                        name="description"
                      />
                      <label className=" text-gray-700 text-sm font-bold mb-2" htmlFor="prix">
                        {enFrancais ? "Prix" : "Preis"}
                      </label>
                      <input
                        className="prix shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={values.factures[index].prix}
                        onChange={(e) => {
                          let newFactures = values.factures;

                          newFactures[index].prix = e.target.value;

                          setValue({ ...values, factures: newFactures });
                        }}
                        type="number"
                        name="prix"
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          let allFactures = values.factures;
                          allFactures.splice(index, 1);
                          setValue({ ...values, factures: allFactures });
                        }}
                        className="delete text-white font-bold py-2 px-4 w-11 rounded focus:outline-none focus:shadow-outline"
                      >
                        -
                      </button>
                    </div>
                  );
                })}
                {factures.length > 0 && (
                  <div style={{ textAlign: "right" }}>
                    Total : {totalAmount} {currency}
                  </div>
                )}

                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={addMore}
                >
                  {enFrancais ? "ajouter entrée" : "neuer Eintrag"}
                </button>
              </div>
            )}

            <hr style={{ marginBottom: "30px", marginTop: "30px" }}></hr>

            {!values.nurqr && (
              <div>
                <label className="block text-gray-700 text-ssm font-bold mb-2" htmlFor="communication">
                  {enFrancais ? "Communication" : "Mitteilung"}
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={values.communication}
                  placeholder={enFrancais ? "Payable dans les 30 jours suivant la réception" : "Zahlbar bis spätestens 30 Tage nach Rechnungseingang"}
                  type="text"
                  onChange={(e) => setValue({ ...values, communication: e.target.value })}
                />
                <label className="block text-gray-700 text-ssm font-bold mb-2" htmlFor="communication">
                  {enFrancais ? "Communication 2" : "Mitteilung 2"}
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={values.communication2}
                  placeholder={enFrancais ? "Merci et meilleures salutations" : "Vielen Dank und freundliche Grüsse"}
                  type="text"
                  onChange={(e) => setValue({ ...values, communication2: e.target.value })}
                />
              </div>
            )}

            <label className="block text-gray-700 text-ssm font-bold mb-2" htmlFor="doctitle">
              {enFrancais ? "Nom du fichier" : "Dateiname*"}
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={values.doctitle}
              placeholder={enFrancais ? "facture_22042022" : "rechnung_22042022"}
              onChange={(e) => setValue({ ...values, doctitle: e.target.value })}
              type="text"
              name="doctitle"
            />
            <div className="dossier">
              {values.doctitle != "" && (
                <div
                  onClick={() => fileRequest()}
                  className="button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  id="upload"
                >
                  {enFrancais ? "Choisir dossier" : "Ordner wählen"}
                </div>
              )}

              {values.folder != "" && (
                <p className="text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4">
                  {values.folder}
                  {values.doctitle != "" && <span>{values.doctitle}.pdf</span>}
                </p>
              )}
            </div>

            {values.folder != "" && (
              <div className="flex">
                <div
                  className="button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={() => {
                    handleCheckout();
                  }}
                >
                  {enFrancais ? "EXPORTER EN PDF" : "PDF EXPORTIEREN"}
                </div>

                <div
                  className="button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={() => handleDownload()}
                >
                  {enFrancais ? "SAUVEGARDER" : "SPEICHERN"}
                </div>
              </div>
            )}
          </div>
        </form>
        <Toaster />
      </div>
    </React.Fragment>
  );
}

export default Home;
