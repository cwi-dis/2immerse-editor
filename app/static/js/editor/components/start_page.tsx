import * as React from "react";
import { List } from "immutable";
import { bindActionCreators } from "redux";
import { connect, Dispatch } from "react-redux";
import * as classNames from "classnames";

import { Nullable, makeRequest } from "../util";
import { ApplicationState, navigate } from "../store";
import { DocumentState } from "../reducers/document";

import { actionCreators as documentActionCreators, DocumentActions } from "../actions/document";
import { actionCreators as screenActionCreators, ScreenActions } from "../actions/screens";
import { actionCreators as assetActionCreators, AssetActions } from "../actions/assets";
import { actionCreators as chapterActionCreators, ChapterActions } from "../actions/chapters";
import { actionCreators as timelineActionCreators, TimelineActions } from "../actions/timelines";

interface Asset {
  id: string;
  name: string;
  description: string;
  previewUrl: string;
  duration: number;
}

interface Region {
  region: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Device {
  name: string;
  type: "communal" | "personal";
  orientation: "portrait" | "landscape";
  areas: Array<Region>;
}

interface Region {
  id: string;
  name: string;
  color: string;
}

interface Layout {
  devices: Array<Device>;
  regions: Array<Region>;
}

interface Element {
  asset: string;
  duration: number;
  offset: number;
}

interface Track {
  id: string;
  region: string;
  elements: Array<Element>;
}

export interface ChapterTree {
  id: string;
  name: string;
  tracks: Array<Track>;
  chapters: Array<ChapterTree>;
}

interface StartPageProps {
  document: DocumentState;

  documentActions: DocumentActions;
  screenActions: ScreenActions;
  assetActions: AssetActions;
  chapterActions: ChapterActions;
  timelineActions: TimelineActions;
}

interface StartPageState {
  isLoading: boolean;
  selectedMethod: "url" | "upload";
}

function getRegionForArea(id: string, layout: Layout) {
  return List(layout.regions).find((region) => {
    return region.id === id;
  })!;
}

class StartPage extends React.Component<StartPageProps, StartPageState> {
  private urlInput: Nullable<HTMLInputElement>;
  private fileInput: Nullable<HTMLInputElement>;

  constructor(props: never) {
    super(props);

    this.state = {
      isLoading: false,
      selectedMethod: "url"
    };
  }

  public componentDidUpdate() {
    const { documentId } = this.props.document;

    if (documentId !== "") {
      console.log("constructing document", documentId);
      const baseUrl = `/api/v1/document/${documentId}/editing/`;

      makeRequest("GET", baseUrl + "getAssets").then((data) => {
        const assets: Array<Asset> = JSON.parse(data);
        console.log("assets", assets);

        assets.forEach((asset) => {
          const { id, name, description, previewUrl, duration } = asset;
          this.props.assetActions.addAsset(id, name, description, previewUrl, duration);
        });

        return makeRequest("GET", baseUrl + "getLayout");
      }).then((data) => {
        const layout: Layout = JSON.parse(data);
        console.log("layout", layout);

        layout.devices.forEach((device) => {
          const regions = device.areas.map((area) => {
            const { color, name } = getRegionForArea(area.region, layout);

            return {
              ...area,
              color,
              name
            };
          });

          this.props.screenActions.addDeviceAndPlaceRegions(
            device.type,
            device.name,
            device.orientation,
            regions
          );
        });

        return makeRequest("GET", baseUrl + "getChapters");
      }).then((data) => {
        const chapterTree: ChapterTree = JSON.parse(data);
        console.log("chapter tree", chapterTree);

        this.props.chapterActions.loadChapterTree(chapterTree);
        this.props.timelineActions.loadTimelines(chapterTree);
      }).then(() => {
        navigate("/layout");
      });
    }
  }

  private submitForm(ev: React.FormEvent<HTMLFormElement>) {
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
    }

    this.setState({
      isLoading: true
    });

    makeRequest("POST", submitUrl, formData).then((data) => {
      const { documentId } = JSON.parse(data);
      console.log("document id:", documentId);

      this.setState({ isLoading: false });
      this.props.documentActions.assignDocumentId(documentId, docBaseUrl);
    });
  }

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
              :
                <div className="field">
                  <label className="label">File</label>
                  <div className="control">
                    <input key="upload" className="input is-info" required={true} ref={(e) => this.fileInput = e} type="file" placeholder="File" />
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

function mapStateToProps(state: ApplicationState): Partial<StartPageProps> {
  return {
    document: state.document
  };
}

function mapDispatchToProps(dispatch: Dispatch<DocumentActions>): Partial<StartPageProps> {
  return {
    assetActions: bindActionCreators<AssetActions>(assetActionCreators, dispatch),
    documentActions: bindActionCreators<DocumentActions>(documentActionCreators, dispatch),
    screenActions: bindActionCreators<ScreenActions>(screenActionCreators, dispatch),
    chapterActions: bindActionCreators<ChapterActions>(chapterActionCreators, dispatch),
    timelineActions: bindActionCreators<TimelineActions>(timelineActionCreators, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(StartPage);
