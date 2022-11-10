import createWindow from "./create-window";
import { BrowserWindow, webContents } from "electron";

import { PDF } from "swissqrbill/pdf";
import { mm2pt, formatIBAN, isQRIBAN } from "swissqrbill/utils";
export { createWindow };

let { ipcMain } = require("electron");

ipcMain.handle("console", (event, line, mydata, currency) => {
  let langues = {
    description: "Description",
    quantité: "Quantité",
    langue: "FR",
    total: "Total",
    ref: "ref: ",
  };
  if (mydata.langue === "de") {
    langues = {
      description: "Bezeichnung",
      quantité: "Anzahl",
      langue: "DE",
      total: "Rechnungstotal",
      ref: "Ansprechperson: ",
    };
  }

  console.log(line);

  const logoBackground = "M33 0H0v33h33V0z";
  const logo =
    "M11.568 24.48C9.27467 24.48 7.33867 23.9733 5.76 22.96C4.18133 21.936 2.98667 20.5227 2.176 18.72C1.36533 16.9173 0.96 14.8373 0.96 12.48C0.96 10.1227 1.36533 8.04267 2.176 6.24C2.98667 4.43733 4.18133 3.02933 5.76 2.016C7.33867 0.991999 9.27467 0.48 11.568 0.48C14.2453 0.48 16.432 1.168 18.128 2.544C19.824 3.90933 20.9867 5.744 21.616 8.048L19.216 8.672C18.7253 6.848 17.8453 5.40267 16.576 4.336C15.3067 3.26933 13.6373 2.736 11.568 2.736C9.76533 2.736 8.26667 3.14666 7.072 3.968C5.87733 4.78933 4.976 5.936 4.368 7.408C3.77067 8.86933 3.46133 10.56 3.44 12.48C3.42933 14.4 3.72267 16.0907 4.32 17.552C4.928 19.0133 5.83467 20.16 7.04 20.992C8.256 21.8133 9.76533 22.224 11.568 22.224C13.6373 22.224 15.3067 21.6907 16.576 20.624C17.8453 19.5467 18.7253 18.1013 19.216 16.288L21.616 16.912C20.9867 19.216 19.824 21.056 18.128 22.432C16.432 23.7973 14.2453 24.48 11.568 24.48ZM25.1463 24V0.959999H27.4983V11.344H40.2343V0.959999H42.5703V24H40.2343V13.6H27.4983V24H25.1463ZM45.4525 24L53.3885 0.959999H56.5085L64.4445 24H61.9965L54.4605 2.272H55.3885L47.9005 24H45.4525ZM48.9885 18.416V16.208H60.8925V18.416H48.9885ZM67.3338 24V0.959999H74.3258C74.5711 0.959999 74.9871 0.965333 75.5738 0.976C76.1711 0.986666 76.7418 1.02933 77.2858 1.104C79.0351 1.34933 80.4964 2 81.6698 3.056C82.8431 4.112 83.7231 5.456 84.3098 7.088C84.8964 8.72 85.1898 10.5173 85.1898 12.48C85.1898 14.4427 84.8964 16.24 84.3098 17.872C83.7231 19.504 82.8431 20.848 81.6698 21.904C80.4964 22.96 79.0351 23.6107 77.2858 23.856C76.7524 23.92 76.1818 23.9627 75.5738 23.984C74.9658 23.9947 74.5498 24 74.3258 24H67.3338ZM69.7658 21.744H74.3258C74.7631 21.744 75.2324 21.7333 75.7338 21.712C76.2458 21.68 76.6831 21.6267 77.0458 21.552C78.3898 21.3173 79.4724 20.7733 80.2938 19.92C81.1258 19.0667 81.7338 18 82.1178 16.72C82.5018 15.4293 82.6938 14.016 82.6938 12.48C82.6938 10.9333 82.5018 9.51467 82.1178 8.224C81.7338 6.93333 81.1258 5.86667 80.2938 5.024C79.4618 4.18133 78.3791 3.64267 77.0458 3.408C76.6831 3.33333 76.2404 3.28533 75.7178 3.264C75.2058 3.232 74.7418 3.216 74.3258 3.216H69.7658V21.744ZM89.1538 24V0.959999H91.5058V24H89.1538ZM102.709 24V0.959999H104.869L113.925 20.336L122.933 0.959999H125.125V23.984H122.885V6.208L114.677 24H113.157L104.965 6.208V24H102.709ZM129.615 24V0.959999H144.015V3.216H131.967V11.184H142.095V13.44H131.967V21.744H144.015V24H129.615ZM155.021 24.48C153.411 24.48 151.96 24.2133 150.669 23.68C149.389 23.136 148.328 22.368 147.485 21.376C146.653 20.384 146.109 19.2053 145.853 17.84L148.253 17.44C148.637 18.9333 149.448 20.1067 150.685 20.96C151.923 21.8027 153.4 22.224 155.117 22.224C156.248 22.224 157.261 22.048 158.157 21.696C159.053 21.3333 159.757 20.8213 160.269 20.16C160.781 19.4987 161.037 18.7147 161.037 17.808C161.037 17.2107 160.931 16.704 160.717 16.288C160.504 15.8613 160.221 15.5093 159.869 15.232C159.517 14.9547 159.133 14.7253 158.717 14.544C158.301 14.352 157.896 14.1973 157.501 14.08L151.661 12.336C150.957 12.1333 150.307 11.8773 149.709 11.568C149.112 11.248 148.589 10.8693 148.141 10.432C147.704 9.984 147.363 9.46133 147.117 8.864C146.872 8.26667 146.749 7.584 146.749 6.816C146.749 5.51467 147.091 4.38933 147.773 3.44C148.456 2.49067 149.389 1.76 150.573 1.248C151.757 0.735999 153.107 0.485332 154.621 0.495998C156.157 0.495998 157.528 0.767998 158.733 1.312C159.949 1.856 160.952 2.63467 161.741 3.648C162.531 4.65067 163.053 5.84 163.309 7.216L160.845 7.664C160.685 6.66133 160.317 5.792 159.741 5.056C159.165 4.32 158.429 3.75467 157.533 3.36C156.648 2.95467 155.672 2.74667 154.605 2.736C153.571 2.736 152.648 2.912 151.837 3.264C151.037 3.60533 150.403 4.07467 149.933 4.672C149.464 5.26933 149.229 5.952 149.229 6.72C149.229 7.49867 149.443 8.12267 149.869 8.592C150.307 9.06133 150.84 9.42933 151.469 9.696C152.109 9.96267 152.728 10.1813 153.325 10.352L157.837 11.68C158.307 11.808 158.856 11.9947 159.485 12.24C160.125 12.4747 160.744 12.816 161.341 13.264C161.949 13.7013 162.451 14.2773 162.845 14.992C163.24 15.7067 163.437 16.6133 163.437 17.712C163.437 18.7787 163.224 19.7333 162.797 20.576C162.381 21.4187 161.789 22.128 161.021 22.704C160.264 23.28 159.373 23.7173 158.349 24.016C157.336 24.3253 156.227 24.48 155.021 24.48ZM175.209 24.48C173.598 24.48 172.147 24.2133 170.857 23.68C169.577 23.136 168.515 22.368 167.673 21.376C166.841 20.384 166.297 19.2053 166.041 17.84L168.441 17.44C168.825 18.9333 169.635 20.1067 170.873 20.96C172.11 21.8027 173.587 22.224 175.305 22.224C176.435 22.224 177.449 22.048 178.345 21.696C179.241 21.3333 179.945 20.8213 180.457 20.16C180.969 19.4987 181.225 18.7147 181.225 17.808C181.225 17.2107 181.118 16.704 180.905 16.288C180.691 15.8613 180.409 15.5093 180.057 15.232C179.705 14.9547 179.321 14.7253 178.905 14.544C178.489 14.352 178.083 14.1973 177.689 14.08L171.849 12.336C171.145 12.1333 170.494 11.8773 169.897 11.568C169.299 11.248 168.777 10.8693 168.329 10.432C167.891 9.984 167.55 9.46133 167.305 8.864C167.059 8.26667 166.937 7.584 166.937 6.816C166.937 5.51467 167.278 4.38933 167.961 3.44C168.643 2.49067 169.577 1.76 170.761 1.248C171.945 0.735999 173.294 0.485332 174.809 0.495998C176.345 0.495998 177.715 0.767998 178.921 1.312C180.137 1.856 181.139 2.63467 181.929 3.648C182.718 4.65067 183.241 5.84 183.497 7.216L181.033 7.664C180.873 6.66133 180.505 5.792 179.929 5.056C179.353 4.32 178.617 3.75467 177.721 3.36C176.835 2.95467 175.859 2.74667 174.793 2.736C173.758 2.736 172.835 2.912 172.025 3.264C171.225 3.60533 170.59 4.07467 170.121 4.672C169.651 5.26933 169.417 5.952 169.417 6.72C169.417 7.49867 169.63 8.12267 170.057 8.592C170.494 9.06133 171.027 9.42933 171.657 9.696C172.297 9.96267 172.915 10.1813 173.513 10.352L178.025 11.68C178.494 11.808 179.043 11.9947 179.673 12.24C180.313 12.4747 180.931 12.816 181.529 13.264C182.137 13.7013 182.638 14.2773 183.033 14.992C183.427 15.7067 183.625 16.6133 183.625 17.712C183.625 18.7787 183.411 19.7333 182.985 20.576C182.569 21.4187 181.977 22.128 181.209 22.704C180.451 23.28 179.561 23.7173 178.537 24.016C177.523 24.3253 176.414 24.48 175.209 24.48ZM186.928 24V0.959999H189.088L198.144 20.336L207.152 0.959999H209.344V23.984H207.104V6.208L198.896 24H197.376L189.184 6.208V24H186.928ZM213.834 24V0.959999H228.234V3.216H216.186V11.184H226.314V13.44H216.186V21.744H228.234V24H213.834ZM232.084 24V0.959999H240.98C241.204 0.959999 241.454 0.970666 241.732 0.991999C242.02 1.00267 242.308 1.03467 242.596 1.088C243.801 1.26933 244.82 1.69067 245.652 2.352C246.494 3.00267 247.129 3.824 247.556 4.816C247.993 5.808 248.212 6.90667 248.212 8.112C248.212 9.85067 247.753 11.36 246.836 12.64C245.918 13.92 244.606 14.7253 242.9 15.056L242.084 15.248H234.436V24H232.084ZM246.036 24L241.492 14.624L243.748 13.76L248.74 24H246.036ZM234.436 13.008H240.916C241.108 13.008 241.332 12.9973 241.588 12.976C241.844 12.9547 242.094 12.9173 242.34 12.864C243.129 12.6933 243.774 12.368 244.276 11.888C244.788 11.408 245.166 10.8373 245.412 10.176C245.668 9.51467 245.796 8.82667 245.796 8.112C245.796 7.39733 245.668 6.70933 245.412 6.048C245.166 5.376 244.788 4.8 244.276 4.32C243.774 3.84 243.129 3.51467 242.34 3.344C242.094 3.29067 241.844 3.25867 241.588 3.248C241.332 3.22667 241.108 3.216 240.916 3.216H234.436V13.008Z";
  const logoText =
    "M11.568 24.48C9.27467 24.48 7.33867 23.9733 5.76 22.96C4.18133 21.936 2.98667 20.5227 2.176 18.72C1.36533 16.9173 0.96 14.8373 0.96 12.48C0.96 10.1227 1.36533 8.04267 2.176 6.24C2.98667 4.43733 4.18133 3.02933 5.76 2.016C7.33867 0.991999 9.27467 0.48 11.568 0.48C14.2453 0.48 16.432 1.168 18.128 2.544C19.824 3.90933 20.9867 5.744 21.616 8.048L19.216 8.672C18.7253 6.848 17.8453 5.40267 16.576 4.336C15.3067 3.26933 13.6373 2.736 11.568 2.736C9.76533 2.736 8.26667 3.14666 7.072 3.968C5.87733 4.78933 4.976 5.936 4.368 7.408C3.77067 8.86933 3.46133 10.56 3.44 12.48C3.42933 14.4 3.72267 16.0907 4.32 17.552C4.928 19.0133 5.83467 20.16 7.04 20.992C8.256 21.8133 9.76533 22.224 11.568 22.224C13.6373 22.224 15.3067 21.6907 16.576 20.624C17.8453 19.5467 18.7253 18.1013 19.216 16.288L21.616 16.912C20.9867 19.216 19.824 21.056 18.128 22.432C16.432 23.7973 14.2453 24.48 11.568 24.48ZM25.1463 24V0.959999H27.4983V11.344H40.2343V0.959999H42.5703V24H40.2343V13.6H27.4983V24H25.1463ZM45.4525 24L53.3885 0.959999H56.5085L64.4445 24H61.9965L54.4605 2.272H55.3885L47.9005 24H45.4525ZM48.9885 18.416V16.208H60.8925V18.416H48.9885ZM67.3338 24V0.959999H74.3258C74.5711 0.959999 74.9871 0.965333 75.5738 0.976C76.1711 0.986666 76.7418 1.02933 77.2858 1.104C79.0351 1.34933 80.4964 2 81.6698 3.056C82.8431 4.112 83.7231 5.456 84.3098 7.088C84.8964 8.72 85.1898 10.5173 85.1898 12.48C85.1898 14.4427 84.8964 16.24 84.3098 17.872C83.7231 19.504 82.8431 20.848 81.6698 21.904C80.4964 22.96 79.0351 23.6107 77.2858 23.856C76.7524 23.92 76.1818 23.9627 75.5738 23.984C74.9658 23.9947 74.5498 24 74.3258 24H67.3338ZM69.7658 21.744H74.3258C74.7631 21.744 75.2324 21.7333 75.7338 21.712C76.2458 21.68 76.6831 21.6267 77.0458 21.552C78.3898 21.3173 79.4724 20.7733 80.2938 19.92C81.1258 19.0667 81.7338 18 82.1178 16.72C82.5018 15.4293 82.6938 14.016 82.6938 12.48C82.6938 10.9333 82.5018 9.51467 82.1178 8.224C81.7338 6.93333 81.1258 5.86667 80.2938 5.024C79.4618 4.18133 78.3791 3.64267 77.0458 3.408C76.6831 3.33333 76.2404 3.28533 75.7178 3.264C75.2058 3.232 74.7418 3.216 74.3258 3.216H69.7658V21.744ZM89.1538 24V0.959999H91.5058V24H89.1538ZM102.709 24V0.959999H104.869L113.925 20.336L122.933 0.959999H125.125V23.984H122.885V6.208L114.677 24H113.157L104.965 6.208V24H102.709ZM129.615 24V0.959999H144.015V3.216H131.967V11.184H142.095V13.44H131.967V21.744H144.015V24H129.615ZM155.021 24.48C153.411 24.48 151.96 24.2133 150.669 23.68C149.389 23.136 148.328 22.368 147.485 21.376C146.653 20.384 146.109 19.2053 145.853 17.84L148.253 17.44C148.637 18.9333 149.448 20.1067 150.685 20.96C151.923 21.8027 153.4 22.224 155.117 22.224C156.248 22.224 157.261 22.048 158.157 21.696C159.053 21.3333 159.757 20.8213 160.269 20.16C160.781 19.4987 161.037 18.7147 161.037 17.808C161.037 17.2107 160.931 16.704 160.717 16.288C160.504 15.8613 160.221 15.5093 159.869 15.232C159.517 14.9547 159.133 14.7253 158.717 14.544C158.301 14.352 157.896 14.1973 157.501 14.08L151.661 12.336C150.957 12.1333 150.307 11.8773 149.709 11.568C149.112 11.248 148.589 10.8693 148.141 10.432C147.704 9.984 147.363 9.46133 147.117 8.864C146.872 8.26667 146.749 7.584 146.749 6.816C146.749 5.51467 147.091 4.38933 147.773 3.44C148.456 2.49067 149.389 1.76 150.573 1.248C151.757 0.735999 153.107 0.485332 154.621 0.495998C156.157 0.495998 157.528 0.767998 158.733 1.312C159.949 1.856 160.952 2.63467 161.741 3.648C162.531 4.65067 163.053 5.84 163.309 7.216L160.845 7.664C160.685 6.66133 160.317 5.792 159.741 5.056C159.165 4.32 158.429 3.75467 157.533 3.36C156.648 2.95467 155.672 2.74667 154.605 2.736C153.571 2.736 152.648 2.912 151.837 3.264C151.037 3.60533 150.403 4.07467 149.933 4.672C149.464 5.26933 149.229 5.952 149.229 6.72C149.229 7.49867 149.443 8.12267 149.869 8.592C150.307 9.06133 150.84 9.42933 151.469 9.696C152.109 9.96267 152.728 10.1813 153.325 10.352L157.837 11.68C158.307 11.808 158.856 11.9947 159.485 12.24C160.125 12.4747 160.744 12.816 161.341 13.264C161.949 13.7013 162.451 14.2773 162.845 14.992C163.24 15.7067 163.437 16.6133 163.437 17.712C163.437 18.7787 163.224 19.7333 162.797 20.576C162.381 21.4187 161.789 22.128 161.021 22.704C160.264 23.28 159.373 23.7173 158.349 24.016C157.336 24.3253 156.227 24.48 155.021 24.48ZM175.209 24.48C173.598 24.48 172.147 24.2133 170.857 23.68C169.577 23.136 168.515 22.368 167.673 21.376C166.841 20.384 166.297 19.2053 166.041 17.84L168.441 17.44C168.825 18.9333 169.635 20.1067 170.873 20.96C172.11 21.8027 173.587 22.224 175.305 22.224C176.435 22.224 177.449 22.048 178.345 21.696C179.241 21.3333 179.945 20.8213 180.457 20.16C180.969 19.4987 181.225 18.7147 181.225 17.808C181.225 17.2107 181.118 16.704 180.905 16.288C180.691 15.8613 180.409 15.5093 180.057 15.232C179.705 14.9547 179.321 14.7253 178.905 14.544C178.489 14.352 178.083 14.1973 177.689 14.08L171.849 12.336C171.145 12.1333 170.494 11.8773 169.897 11.568C169.299 11.248 168.777 10.8693 168.329 10.432C167.891 9.984 167.55 9.46133 167.305 8.864C167.059 8.26667 166.937 7.584 166.937 6.816C166.937 5.51467 167.278 4.38933 167.961 3.44C168.643 2.49067 169.577 1.76 170.761 1.248C171.945 0.735999 173.294 0.485332 174.809 0.495998C176.345 0.495998 177.715 0.767998 178.921 1.312C180.137 1.856 181.139 2.63467 181.929 3.648C182.718 4.65067 183.241 5.84 183.497 7.216L181.033 7.664C180.873 6.66133 180.505 5.792 179.929 5.056C179.353 4.32 178.617 3.75467 177.721 3.36C176.835 2.95467 175.859 2.74667 174.793 2.736C173.758 2.736 172.835 2.912 172.025 3.264C171.225 3.60533 170.59 4.07467 170.121 4.672C169.651 5.26933 169.417 5.952 169.417 6.72C169.417 7.49867 169.63 8.12267 170.057 8.592C170.494 9.06133 171.027 9.42933 171.657 9.696C172.297 9.96267 172.915 10.1813 173.513 10.352L178.025 11.68C178.494 11.808 179.043 11.9947 179.673 12.24C180.313 12.4747 180.931 12.816 181.529 13.264C182.137 13.7013 182.638 14.2773 183.033 14.992C183.427 15.7067 183.625 16.6133 183.625 17.712C183.625 18.7787 183.411 19.7333 182.985 20.576C182.569 21.4187 181.977 22.128 181.209 22.704C180.451 23.28 179.561 23.7173 178.537 24.016C177.523 24.3253 176.414 24.48 175.209 24.48ZM186.928 24V0.959999H189.088L198.144 20.336L207.152 0.959999H209.344V23.984H207.104V6.208L198.896 24H197.376L189.184 6.208V24H186.928ZM213.834 24V0.959999H228.234V3.216H216.186V11.184H226.314V13.44H216.186V21.744H228.234V24H213.834ZM232.084 24V0.959999H240.98C241.204 0.959999 241.454 0.970666 241.732 0.991999C242.02 1.00267 242.308 1.03467 242.596 1.088C243.801 1.26933 244.82 1.69067 245.652 2.352C246.494 3.00267 247.129 3.824 247.556 4.816C247.993 5.808 248.212 6.90667 248.212 8.112C248.212 9.85067 247.753 11.36 246.836 12.64C245.918 13.92 244.606 14.7253 242.9 15.056L242.084 15.248H234.436V24H232.084ZM246.036 24L241.492 14.624L243.748 13.76L248.74 24H246.036ZM234.436 13.008H240.916C241.108 13.008 241.332 12.9973 241.588 12.976C241.844 12.9547 242.094 12.9173 242.34 12.864C243.129 12.6933 243.774 12.368 244.276 11.888C244.788 11.408 245.166 10.8373 245.412 10.176C245.668 9.51467 245.796 8.82667 245.796 8.112C245.796 7.39733 245.668 6.70933 245.412 6.048C245.166 5.376 244.788 4.8 244.276 4.32C243.774 3.84 243.129 3.51467 242.34 3.344C242.094 3.29067 241.844 3.25867 241.588 3.248C241.332 3.22667 241.108 3.216 240.916 3.216H234.436V13.008Z";

  //-- QR bill data object

  const reference = Math.random * 1000000000000000000000000000;

  let data;

  let prix = 0;

  let size = "A4";
  if (line.nurqr) {
    size = "A6";
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
      currency: "CHF",
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

  const pdf = new PDF(data, line.folder + "/" + line.doctitle + ".pdf", {
    autoGenerate: line.nurqr,
    size: size,
    language: langues.langue,
    scissors: false,
    separate: false,
    outlines: false,
  });

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
    if (line.persref != "") {
      pdf.text(
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
          "\n" +
          "\n" +
          langues.ref +
          line.persref,
        mm2pt(20),
        mm2pt(35),
        {
          width: mm2pt(100),
          height: mm2pt(50),
          align: "left",
        }
      );
    } else {
      pdf.text(
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
          mydata.website,
        mm2pt(20),
        mm2pt(35),
        {
          width: mm2pt(100),
          height: mm2pt(50),
          align: "left",
        }
      );
    }

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

    const date = new Date();

    pdf.fontSize(11);
    pdf.font("Helvetica");
    pdf.text(data.creditor.city + ", le " + date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear(), {
      width: mm2pt(170),
      align: "right",
    });
  }

  // pdf.addPath(logoText, mm2pt(20), mm2pt(14)).fillColor("#2969B5").fill();

  //-- Add table

  const table = {
    width: mm2pt(170),
    rows: [
      {
        height: 30,
        fillColor: "#ECF0F1",
        columns: [
          {
            text: "Position",
            width: mm2pt(20),
          },
          {
            text: langues.quantité,
            width: mm2pt(20),
          },
          {
            text: langues.description,
          },
          {
            text: langues.total,
            width: mm2pt(22),
          },
        ],
      },
      {
        height: 40,
        columns: [
          {
            text: "",
            width: mm2pt(20),
          },
          {
            text: "",
            width: mm2pt(20),
          },
          {
            text: "Total",
            font: "Helvetica-Bold",
          },
          {
            text: prix.toFixed(2) + " " + currency,
            width: mm2pt(30),
            font: "Helvetica-Bold",
            textOptions: {
              align: "right",
            },
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

  for (const facture of line.factures) {
    let singleEntry = {
      columns: [
        {
          text: index,
          width: mm2pt(20),
        },
        {
          text: facture.qty,
          width: mm2pt(20),
        },
        {
          text: facture.desc,
        },
        {
          text: facture.prix + " " + currency,
          width: mm2pt(30),
          textOptions: {
            align: "right",
          },
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
