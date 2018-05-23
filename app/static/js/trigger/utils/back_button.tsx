import * as React from "react";

function asBackButton<P>(LinkComponent: React.ComponentType<P> | string) {
  return class extends React.Component<P> {
    public render() {
      return (
        <LinkComponent className="back-button" {...this.props}>
          <span className="icon is-large">
            <i className="fa fa-arrow-left fas fa-lg" />
          </span>
        </LinkComponent>
      );
    }
  };
}

export default asBackButton;
