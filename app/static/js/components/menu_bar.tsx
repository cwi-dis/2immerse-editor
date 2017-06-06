import * as React from "react";
import { Link } from "react-router";

class MenuBar extends React.Component<{}, {}> {
  public render() {
    return (
      <ul style={{listStyleType: "none"}}>
        <li><Link to="/">Design Layout</Link></li>
        <li><Link to="/masters">Manage Masters</Link></li>
        <li><Link to="/program">Author Program</Link></li>
      </ul>
    );
  }
}

export default MenuBar;