import createWindow from "./create-window";
import { BrowserWindow, webContents } from "electron";

import { PDF } from "swissqrbill/pdf";
import { mm2pt, isQRIBAN, isIBANValid } from "swissqrbill/utils";
export { createWindow };

let { ipcMain } = require("electron");

ipcMain.handle("console", (event, line, mydata, currency) => {
  let langues = {
    description: "Description",
    quantité: "Quantité",
    langue: "FR",
    total: "Total",
    ref: "ref: ",
    placeDate: ", le ",
    unitaire: "Prix unitaire",
    tva: "TVA",
    horsTva: "Montant hors TVA",
    ttc: "TTC",
  };
  if (mydata.langue === "de") {
    langues = {
      description: "Bezeichnung",
      quantité: "Anzahl",
      langue: "DE",
      total: "Rechnungstotal",
      ref: "Ansprechperson: ",
      placeDate: " ",
      unitaire: "Einzelpreis",
      tva: "MwSt",
      horsTva: "Exklusiv MwSt",
      ttc: "inkl. MwSt",
    };
  }

  //-- QR bill data object

  const reference = Math.random * 1000000000000000000000000000;

  let data;

  let prix = 0;

  let size = "A4";
  if (line.nurqr) {
    size = line.format;
  } else {
    size = "A4";
  }

  for (const facture of line.factures) {
    let singlePrice = parseFloat(facture.prix);
    prix += singlePrice;
  }

  if (line.type === "facture") {
    data = {
      currency: currency,
      amount: prix,
      message: line.message,
      creditor: {
        name: mydata.nom,
        address: mydata.adresse,
        zip: mydata.zip,
        city: mydata.ville,
        account: mydata.iban,
        country: "CH",
      },
      debtor: {
        name: line.dcrediteur,
        address: line.dadresse,
        zip: line.dzip,
        city: line.dcity,
        country: "CH",
      },
    };
  } else if (line.type === "qr") {
    data = {
      currency: currency,
      amount: Number(line.total),
      message: line.message,
      creditor: {
        name: mydata.nom,
        address: mydata.adresse,
        zip: mydata.zip,
        city: mydata.ville,
        account: mydata.iban,
        country: "CH",
      },
      debtor: {
        name: line.dcrediteur,
        address: line.dadresse,
        zip: line.dzip,
        city: line.dcity,
        country: "CH",
      },
    };
  } else {
    data = {
      currency: "CHF",
      amount: 0.0,
      creditor: {
        name: mydata.nom,
        address: mydata.adresse,
        zip: mydata.zip,
        city: mydata.ville,
        account: mydata.iban,
        country: "CH",
      },
    };
  }

  if (line.reference != "") {
    data.reference = line.reference;
  }

  const pdf = new PDF(data, line.folder + line.doctitle + ".pdf", {
    autoGenerate: line.nurqr,
    size: size,
    language: langues.langue,
    scissors: false,
    separate: false,
    outlines: false,
  });

  // TVA

  let tvaAmount;
  let netAmount;

  if (mydata.tva && mydata.tva === "oui") {
    tvaAmount = ((prix / 100) * mydata.tauxTva).toFixed(2); // Calculate TVA from total price
    netAmount = (prix - tvaAmount).toFixed(2); // Net price without TVA
  }

  //-- Add logo

  let img = mydata.img;

  if (!line.nurqr) {
    if (img != "") {
      pdf.image(img, mm2pt(20), mm2pt(10), { height: 60 });
    }

    //-- Add creditor address

    pdf.fontSize(12);
    pdf.fillColor("black");
    pdf.font("Helvetica");

    pdf.text(
      // `${line.persref != "" ? "yo entreprise \n" : ""}` +
      data.creditor.name +
        "\n" +
        data.creditor.address +
        "\n" +
        data.creditor.zip +
        " " +
        data.creditor.city +
        "\n" +
        mydata.telephone +
        "\n" +
        mydata.mail +
        "\n" +
        mydata.website +
        `${line.persref != "" ? "\n \n " + langues.ref + line.persref : ""}`,
      mm2pt(20),
      mm2pt(35),
      {
        width: mm2pt(100),
        height: mm2pt(50),
        align: "left",
      }
    );

    //-- Add debtor address

    pdf.fontSize(12);
    pdf.font("Helvetica");
    pdf.text(line.dcrediteur + "\n" + line.dadresse + "\n" + line.dzip + " " + line.dcity, mm2pt(130), mm2pt(60), {
      width: mm2pt(70),
      height: mm2pt(50),
      align: "left",
    });

    //-- Add title
    let title = line.title;

    pdf.fontSize(14);
    pdf.font("Helvetica-Bold");
    pdf.text(title, mm2pt(20), mm2pt(100), {
      width: mm2pt(170),
      align: "left",
    });

    const date = line.date;

    const [year, month, day] = date.split("-");

    const result = [day, month, year].join("/");

    pdf.fontSize(11);
    pdf.font("Helvetica");
    pdf.text(data.creditor.city + langues.placeDate + result, {
      width: mm2pt(170),
      align: "right",
    });
  }

  //-- Add table

  const table = {
    width: mm2pt(170),
    rows: [
      {
        height: 30,
        fillColor: "#ECF0F1",
        columns: [
          {
            text: "Pos.",
            width: mm2pt(10),
          },
          {
            text: langues.quantité,
            width: mm2pt(20),
          },
          {
            text: langues.description,
          },
          {
            text: langues.unitaire,
            width: mm2pt(30),
          },
          {
            text: "Total",
            width: mm2pt(30),
          },
        ],
      },
      {
        height: 40,
        columns: [
          {
            text: "",
            width: mm2pt(10),
          },
          {
            text: "",
            width: mm2pt(20),
          },
          {
            text: mydata.tva && mydata.tva === "oui" ? langues.total + " " + langues.ttc : langues.total,
            font: "Helvetica-Bold",
          },
          {
            text: prix.toFixed(2) + " " + currency,
            width: mm2pt(30),
            font: "Helvetica-Bold",
          },
        ],
      },
      {
        height: 30,
        columns: [
          {
            text: line.communication,
            width: mm2pt(170),
          },
          {
            text: "",
            width: mm2pt(20),
          },
          {
            text: "",
            font: "Helvetica-Bold",
          },
          {
            text: "",
            width: mm2pt(30),
            font: "Helvetica-Bold",
          },
        ],
      },
      {
        height: 30,
        columns: [
          {
            text: line.communication2,
            width: mm2pt(170),
          },
          {
            text: "",
            width: mm2pt(20),
          },
          {
            text: "",
            font: "Helvetica-Bold",
          },
          {
            text: "",
            width: mm2pt(30),
            font: "Helvetica-Bold",
          },
        ],
      },
    ],
  };
  let index = 1;
  if (mydata.tva && mydata.tva === "oui") {
    let emptyRow = {
      columns: [
        {
          text: "",
          width: mm2pt(10),
        },
        {
          text: "",
          width: mm2pt(20),
        },
        {
          text: "",
          width: mm2pt(110),
          font: "Helvetica-Bold",
        },
        {
          text: "",
          width: mm2pt(30),
          font: "Helvetica-Bold",
          align: "right",
        },
      ],
    };
    let netRow = {
      columns: [
        {
          text: "",
          width: mm2pt(10),
        },
        {
          text: "",
          width: mm2pt(20),
        },
        {
          text: langues.horsTva,
          width: mm2pt(110),
        },
        {
          text: netAmount + " " + currency,
          width: mm2pt(30),
          align: "right",
        },
      ],
    };

    let tvaRow = {
      columns: [
        {
          text: "",
          width: mm2pt(10),
        },
        {
          text: "",
          width: mm2pt(20),
        },
        {
          text: langues.tva + " " + mydata.tauxTva + "% " + mydata.numTva,
          width: mm2pt(110),
        },
        {
          text: tvaAmount + " " + currency,
          width: mm2pt(30),
          align: "right",
        },
      ],
    };

    // Find the index where the total row is going to be inserted
    const totalRowIndex = table.rows.length;
    console.log(totalRowIndex);

    // Insert the net and TVA rows before the total row
    table.rows.splice(totalRowIndex - 3, 0, netRow, tvaRow);
  }

  for (const facture of line.factures) {
    let singleEntry = {
      columns: [
        {
          text: index,
          width: mm2pt(10),
        },
        {
          text: facture.qty,
          width: mm2pt(20),
        },
        {
          text: facture.desc,
        },
        {
          text: parseFloat(facture.sub).toFixed(2) + " " + currency,
          width: mm2pt(30),
        },
        {
          text: parseFloat(facture.prix).toFixed(2) + " " + currency,
          width: mm2pt(30),
        },
      ],
    };

    index++;

    table.rows.splice(index - 1, 0, singleEntry);
  }

  if (!line.nurqr) {
    pdf.addTable(table);
  }

  //-- Add QR slip

  if (line.type === "facture") {
    pdf.addQRBill();
  }

  //-- Finalize the document
  if (!line.nurqr) {
    pdf.end();
  }

  return `success`;
});

ipcMain.handle("qriban", (event, iban) => {
  isQRIBAN(iban);

  return isQRIBAN(iban);
});

ipcMain.handle("ibanValid", (event, iban) => {
  isQRIBAN(iban);

  return isIBANValid(iban);
});
