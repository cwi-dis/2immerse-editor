import * as React from "react";
import { render } from "react-dom";

import App from "./app";

import "bulma/css/bulma.css";
import "../../css/style.css";

window.onload = () => {
  // Render app and attach it to div 'react'
  render(
    <App />,
    document.getElementById("react")
  );
};
