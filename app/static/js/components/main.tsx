import * as React from "react";
import { render } from "react-dom";

import "bulma/css/bulma.css";
import "../../css/style.css";

window.onload = () => {
  render(
    <h1>Hello World</h1>,
    document.getElementById("react")
  );
};
