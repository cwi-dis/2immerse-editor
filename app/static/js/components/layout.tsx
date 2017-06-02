import * as React from "react";
import { Link } from "react-router";

class Layout extends React.Component<{children?: any}, {}> {
  public render() {
    return (
      <div>
        <div style={{width: "100%", height: 50}}>
          <ul style={{listStyleType: "none"}}>
            <li><Link to="/">Design Layout</Link></li>
            <li><Link to="/masters">Manage Masters</Link></li>
            <li><Link to="/program">Author Program</Link></li>
          </ul>
        </div>
        <div>{React.cloneElement(this.props.children, Object.assign({}, this.props))}</div>
      </div>
    );
  }
}

export default Layout;
