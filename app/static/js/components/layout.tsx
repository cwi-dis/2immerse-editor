import * as React from "react";

import MenuBar from "./menu_bar";

interface ApplicationProps {
  children?: any;
}

class Layout extends React.Component<ApplicationProps, {}> {
  public render() {
    return (
      <div>
        <MenuBar/>
        <div className="columns" style={{margin: 10}}>
          {React.cloneElement(this.props.children, Object.assign({}, this.props))}
        </div>
      </div>
    );
  }
}

export default Layout;
