import * as React from "react";

const Layout = React.createClass({
  render: function () {
    return (
      <div>
        {React.cloneElement(this.props.children, Object.assign({}, this.props))}
      </div>
    );
  }
});

export default Layout;
