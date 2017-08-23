import * as React from "react";
import * as QRCode from "qrcode";

interface PreviewLauncherProps {
  documentId: string;
}

class PreviewLauncher extends React.Component<PreviewLauncherProps, {}> {
  private qrCanvas: HTMLCanvasElement;

  private getPreviewUrl(): string {
    return `${location.protocol}//${location.host}/api/v1/document/${this.props.documentId}/preview`;
  }

  public componentDidMount() {
    const previewUrl = this.getPreviewUrl();

    QRCode.toCanvas(this.qrCanvas, previewUrl, (err) => {
      if (err) {
        console.error(err);
      }
    });
  }

  public render() {
    const previewUrl = this.getPreviewUrl();

    return (
      <div>
        <canvas ref={(el) => this.qrCanvas = el}></canvas>
        <a href={previewUrl} target="_blank">Open preview in new tab</a>
      </div>
    );
  }
}

export default PreviewLauncher;
