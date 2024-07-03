import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import { configureAutoTrack } from 'aws-amplify/analytics';

Amplify.configure(outputs);

configureAutoTrack({
  enable: true,
  type: 'event'
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
