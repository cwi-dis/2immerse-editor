import * as React from "react";

class Layout extends React.Component<{children?: any}, {}> {
  public render() {
    return (
      <div>
        <div>
          <ul>
            <li>Design Layout</li>
            <li>Manage Masters</li>
            <li>Author Program</li>
          </ul>
        </div>
        <div>{React.cloneElement(this.props.children, Object.assign({}, this.props))}</div>
      </div>
    );
  }
}

export default Layout;
