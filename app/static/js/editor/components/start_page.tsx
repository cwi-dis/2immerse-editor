import * as React from "react";
import { bindActionCreators } from "redux";
import { connect, Dispatch } from "react-redux";
import * as classNames from "classnames";

import { Nullable, makeRequest } from "../util";
import { ApplicationState, navigate } from "../store";
import { DocumentState } from "../reducers/document";
import { actionCreators as documentActionCreators, DocumentActions } from "../actions/document";

interface StartPageProps {
  document: DocumentState;
  documentActions: DocumentActions;
}

interface StartPageState {
  isLoading: boolean;
}

class StartPage extends React.Component<StartPageProps, StartPageState> {
  private urlInput: Nullable<HTMLInputElement>;

  constructor(props: never) {
    super(props);

    this.state = {
      isLoading: false
    };
  }

  private submitForm(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();

    if (!this.urlInput || this.urlInput.value === "") {
      console.log("URL input invalid");
      return;
    }

    this.setState({
      isLoading: true
    });

    const submitUrl = "/api/v1/document?url=" + this.urlInput.value;
    makeRequest("POST", submitUrl).then((data) => {
      this.setState({ isLoading: false });

    });
  }

  public render() {
    const boxStyle: React.CSSProperties = {
      width: "30vw",
      margin: "15% auto 0 auto",
      backgroundColor: "#EFEFEF",
      padding: 25,
      borderRadius: 15,
    };

    return (
      <div className="columnlayout">
        <div className="column-content" style={{width: "100%"}}>

          <div style={boxStyle}>
            <form className="column" onSubmit={this.submitForm.bind(this)}>
              <div className="field">
                <label className="label">Document URL</label>
                <div className="control">
                  <input key="url" className="input is-info" required={true} ref={(e) => this.urlInput = e} type="url" placeholder="URL" />
                </div>
              </div>

              <div className="field" style={{marginTop: 25}}>
                <div className="control">
                  <button className={classNames("button", "is-info", {"is-loading": this.state.isLoading})}>
                    Continue
                  </button>
                </div>
              </div>
            </form>
          </div>

        </div>
      </div>
    );
  }
}

function mapStateToProps(state: ApplicationState): Partial<StartPageProps> {
  return {
    document: state.document
  };
}

function mapDispatchToProps(dispatch: Dispatch<DocumentActions>): Partial<StartPageProps> {
  return {
    documentActions: bindActionCreators<DocumentActions>(documentActionCreators, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(StartPage);
