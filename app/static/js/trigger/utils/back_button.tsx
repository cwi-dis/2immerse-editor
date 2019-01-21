import * as React from "react";

function asBackButton<P>(WrappedComponent: React.ComponentType<P> | string) {
  // Higher-order component for wrapping a back-arrow in a custom link component
  return class BackButton extends React.Component<P> {
    render() {
      return (
        <WrappedComponent className="back-button" {...this.props}>
          <span className="icon is-large">
            <i className="fa fa-arrow-left fas fa-lg" />
          </span>
        </WrappedComponent>
      );
    }
  };
}

export default asBackButton;
