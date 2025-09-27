import './index.css';
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { GoogleOAuthProvider } from "@react-oauth/google";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <GoogleOAuthProvider clientId ="953632718965-n9e9rrp1lfeq4flk7pcfjm69514th5be.apps.googleusercontent.com953632718965-n9e9rrp1lfeq4flk7pcfjm69514th5be.apps.googleusercontent.com">
    
    <App />
  
  </GoogleOAuthProvider>
);
