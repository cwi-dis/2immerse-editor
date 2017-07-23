import * as React from "react";
import { makeRequest } from "../editor/util";

interface TriggerClientProps {
  documentId: string;
}

interface Trigger {
  trigger: boolean;
  modify: boolean;
  id: string;
  parameters: Array<any>;
  name: string;
}

interface TriggerClientState {
  abstractTriggers: Array<Trigger>;
  instantiatedTriggers: Array<any>;
}

class TriggerClient extends React.Component<TriggerClientProps, TriggerClientState> {
  constructor(props: TriggerClientProps) {
    super(props);

    this.state = {
      abstractTriggers: [],
      instantiatedTriggers: []
    };
  }

  public componentDidMount() {
    const url = `/api/v1/document/${this.props.documentId}/events`;

    makeRequest("GET", url).then((data) => {
      this.setState({
        abstractTriggers: JSON.parse(data)
      });
    }).catch((err) => {
      console.error("Could not fetch triggers:", err);
    });
  }

  public render() {
    return (
      <div style={{color: "#FFFFFF"}}>
        {this.state.abstractTriggers.map((trigger: Trigger, i) => {
          return (
            <p>{trigger.id} => {trigger.name}</p>
          );
        })}
      </div>
    );
  }
}

export default TriggerClient;