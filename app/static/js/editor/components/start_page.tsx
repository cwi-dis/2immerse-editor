/**
 * Copyright 2018 Centrum Wiskunde & Informatica
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from "react";
import { List } from "immutable";
import { bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";
import * as classNames from "classnames";

import { Nullable, makeRequest } from "../util";
import { ApplicationState, navigate } from "../store";
import { Asset, Area, ChapterTree, Layout, Region } from "../api_types";
import { DocumentState } from "../reducers/document";

import { actionCreators as documentActionCreators, DocumentActions } from "../actions/document";
import { actionCreators as screenActionCreators, ScreenActions } from "../actions/screens";
import { actionCreators as assetActionCreators, AssetActions } from "../actions/assets";
import { actionCreators as chapterActionCreators, ChapterActions } from "../actions/chapters";
import { actionCreators as timelineActionCreators, TimelineActions } from "../actions/timelines";

/**
 * Props defining action creators used in the component.
 */
interface StartPageActionProps {
  documentActions: DocumentActions;
  screenActions: ScreenActions;
  assetActions: AssetActions;
  chapterActions: ChapterActions;
  timelineActions: TimelineActions;
}

/**
 * Props defining parts of the application state used in the component.
 */
interface StartPageConnectedProps {
  document: DocumentState;
}

type StartPageProps = StartPageActionProps & StartPageConnectedProps;

/**
 * State for StartPage
 */
interface StartPageState {
  isLoading: boolean;
  selectedMethod: "url" | "upload" | "id";
  existingDocuments: Array<{ id: string, description: string }>;
}

/**
 * Scans a layout document retrieved from the API for a region corresponding to
 * the given area ID and returns it. Returns `undefined` otherwise
 *
 * @param id Area ID to search for
 * @param layout Layout document where we want to find the region corresponding to the area
 * @returns The region for the given area ID or `undefined`
 */
function getRegionForArea(id: string, layout: Layout) {
  return List(layout.regions).find((region) => region.id === id)!;
}

/**
 * StartPage is a Redux-connected component responsible for loading the initial
 * document, parsing it and creating the required data structures in the Redux
 * state tree. It receives all its props via the Redux state tree.
 */
class StartPage extends React.Component<StartPageProps, StartPageState> {
  private urlInput: Nullable<HTMLInputElement>;
  private fileInput: Nullable<HTMLInputElement>;
  private idInput: Nullable<HTMLSelectElement>;

  constructor(props: never) {
    super(props);

    this.state = {
      isLoading: false,
      selectedMethod: "url",
      existingDocuments: []
    };
  }

  /**
   * Callback which is invoked after the component updated. Here this is used
   * after a new document ID has been assigned to the Redux state tree. It
   * requests all data associated to the document from the server, parses it
   * and allocated the relevant data structures in the redux state tree. This
   * is only done if the document ID is non-empty. Navigates to the
   * LayoutDesigner component after all data has been processed.
   *
   * @param prevProps Props as they were before the update
   */
  public async componentDidUpdate(prevProps: StartPageProps) {
    const { documentId } = this.props.document;

    if (documentId !== "" && documentId !== prevProps.document.documentId) {
      console.log("constructing document", documentId);
      const baseUrl = `/api/v1/document/${documentId}/editing/`;

      // Retrieve document assets and parse them
      const assetData = await makeRequest("GET", baseUrl + "getAssets");
      const assets: Array<Asset> = JSON.parse(assetData);
      console.log("assets", assets);

      // Allocate all assets locally
      assets.forEach((asset) => {
        const { id, name, description, previewUrl, duration } = asset;
        this.props.assetActions.addAsset(id, name, description, previewUrl, duration);
      });

      // Retrieve layout and parse it
      const layoutData = await makeRequest("GET", baseUrl + "getLayout");
      const layout: Layout = JSON.parse(layoutData);
      console.log("layout", layout);

      // Allocate devices and create regions
      layout.devices.forEach((device) => {
        // Join areas with corresponding regions
        const regions: Array<Area & Region> = device.areas.map((area) => {
          const { id, name, color } = getRegionForArea(area.region, layout);

          return {
            ...area,
            id, name, color
          };
        });

        // Allocate device and create regions
        this.props.screenActions.addDeviceAndPlaceRegions(
          device.type,
          device.name,
          device.orientation,
          regions
        );
      });

      // Retrieve and parse chapter data
      const chapterData = await makeRequest("GET", baseUrl + "getChapters");
      const chapterTree: ChapterTree = JSON.parse(chapterData);
      console.log("chapter tree", chapterTree);

      // Load chapter tree and timelines
      this.props.chapterActions.loadChapterTree(chapterTree);
      this.props.timelineActions.loadTimelines(chapterTree);

      navigate("/layout");
    }
  }

  /**
   * Callback invoked in response to submission of the form. It can either take
   * a URL to an existing document, the ID of a document which already exists
   * on the server or a document uploaded from the local file system. After
   * uploading the data to the server, it receives the new document ID and
   * updates the Redux state accordingly, which in turn triggers
   * `componentDidUpdate()`. That function will then retrieve the processed
   * document data from the server, generate the state tree and redirect to
   * the LayoutDesigner.
   *
   * @param ev The original form event triggered by the submission
   */
  private async submitForm(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();

    let formData: FormData | undefined;
    let submitUrl = "/api/v1/document";
    let docBaseUrl = "";

    if (this.fileInput && this.fileInput.files) {
      const document = this.fileInput.files.item(0)!;

      formData = new FormData();
      formData.append("document", document, document.name);
    } else if (this.urlInput && this.urlInput.value) {
      submitUrl = "/api/v1/document?url=" + this.urlInput.value;
      docBaseUrl = this.urlInput.value.split("/").slice(0, -1).join("/") + "/";
    } else if (this.idInput && this.idInput.value) {
      this.props.documentActions.assignDocumentId(this.idInput.value, docBaseUrl);
      return;
    }

    this.setState({
      isLoading: true
    });

    // Submit form data and get new document ID
    const data = await makeRequest("POST", submitUrl, formData);
    const { documentId } = JSON.parse(data);
    console.log("document id:", documentId);

    // Assign document ID to local session
    this.setState({ isLoading: false });
    this.props.documentActions.assignDocumentId(documentId, docBaseUrl);
  }

  /**
   * Renders the component
   */
  public render() {
    const { selectedMethod } = this.state;

    const boxStyle: React.CSSProperties = {
      width: "30vw",
      margin: "15% auto 0 auto",
      backgroundColor: "#EFEFEF",
      padding: 25,
      borderRadius: 15,
    };

    const onMethodUpdated = (ev: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedMethod = ev.target.value as "url" | "upload";

      this.setState({
        selectedMethod
      });
    };

    return (
      <div className="columnlayout">
        <div className="column-content" style={{width: "100%"}}>

          <div style={boxStyle}>
            <form className="column" onSubmit={this.submitForm.bind(this)}>
              <div className="field">
                <label className="label">Start session from</label>
                <div className="control">
                  <div className="select is-fullwidth is-info">
                    <select className="is-info" value={selectedMethod} onChange={onMethodUpdated.bind(this)}>
                      <option value="upload">File upload&emsp;&emsp;</option>
                      <option value="url">URL</option>
                      <option value="id">Document ID</option>
                    </select>
                  </div>
                </div>
              </div>

              {(selectedMethod === "url") ?
                <div className="field">
                  <label className="label">Document URL</label>
                  <div className="control">
                    <input key="url" className="input is-info" required={true} ref={(e) => this.urlInput = e} type="url" placeholder="URL" />
                  </div>
                </div>
              : (selectedMethod === "upload") ?
                <div className="field">
                  <label className="label">File</label>
                  <div className="control">
                    <input key="upload" className="input is-info" required={true} ref={(e) => this.fileInput = e} type="file" placeholder="File" />
                  </div>
                </div>
              :
                <div className="field">
                  <label className="label">Document ID</label>
                  <div className="control">
                    <div className="select is-fullwidth is-info">
                      <select key="id" ref={(e) => this.idInput = e} required={true}>
                        {this.state.existingDocuments.map((document, i) => {
                          return <option key={i} value={document.id}>{document.description}</option>;
                        })}
                      </select>
                    </div>
                  </div>
                </div>
             }

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

/**
 * Maps application state to component props.
 *
 * @param state Application state
 */
function mapStateToProps(state: ApplicationState): StartPageConnectedProps {
  return {
    document: state.document
  };
}

/**
 * Wraps action creators with the dispatch function and maps them to props.
 *
 * @param dispatch Dispatch function for the configured store
 */
function mapDispatchToProps(dispatch: Dispatch<any>): StartPageActionProps {
  return {
    assetActions: bindActionCreators(assetActionCreators, dispatch),
    documentActions: bindActionCreators(documentActionCreators, dispatch),
    screenActions: bindActionCreators(screenActionCreators, dispatch),
    chapterActions: bindActionCreators(chapterActionCreators, dispatch),
    timelineActions: bindActionCreators(timelineActionCreators, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(StartPage);
