import * as React from "react";

interface LayoutDesignerProps {
  addPersonalDevice: () => void;
  addCommunalDevice: () => void;
}

class LayoutDesigner extends React.Component<LayoutDesignerProps, {}> {
  public render() {
    return (
      <div className="column">
        <div className="content">
          <h1>Layout Designer</h1>
          <div className="field">
            <p className="control">
              <button onClick={this.props.addCommunalDevice}>Add communal device</button>
            </p>
          </div>
          <br/>
          <div className="columns">
            <div className="column is-8" style={{borderRight: "1px solid #B1B1B1"}}>
              <h3 style={{textAlign: "center"}}>Communal Device</h3>
            </div>
            <div className="column is-4">
              <h3 style={{textAlign: "center"}}>Personal Devices</h3>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default LayoutDesigner;
