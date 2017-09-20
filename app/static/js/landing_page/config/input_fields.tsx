import * as React from "react";

interface URLInputFieldProps {
  label: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
}

export const URLInputField: React.SFC<URLInputFieldProps> = (props) => {
  return (
    <div className="field is-horizontal">
      <div className="field-label is-normal">
        <label className="label">{props.label}</label>
      </div>
      <div className="field-body">
        <div className="field">
          <div className="control">
            <input className="input" type="url" value={props.value} onChange={props.onChange.bind(this)} />
          </div>
        </div>
      </div>
    </div>
  );
};

interface CheckboxInputFieldProps {
  label: string;
  value: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  description?: string;
}

export const CheckboxInputField: React.SFC<CheckboxInputFieldProps> = (props) => {
  return (
    <div className="field is-horizontal">
      <div className="field-label">
        <label className="label">{props.label}</label>
      </div>
      <div className="field-body">
        <div className="field">
          <div className="control">
            <label className="checkbox">
              <input type="checkbox" checked={props.value} onChange={props.onChange} />
              &emsp;&emsp;{props.description}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SelectInputFieldProps {
  label: string;
  options: Array<string>;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  value?: string;
}

export const SelectInputField: React.SFC<SelectInputFieldProps> = (props) => {
  return (
    <div className="field is-horizontal">
      <div className="field-label is-normal">
        <label className="label">{props.label}</label>
      </div>
      <div className="field-body">
        <div className="field is-narrow">
          <div className="control">
            <div className="select is-fullwidth">
              <select value={props.value} onChange={props.onChange}>
                {props.options.map((option, i) => {
                  return (<option key={i}>{option}</option>);
                })}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface FileInputFieldProps {
  label: string;
}

export const FileInputField: React.SFC<FileInputFieldProps> = (props) => {
  return (
    <div className="field is-horizontal">
      <div className="field-label is-normal">
        <label className="label">{props.label}</label>
      </div>
      <div className="field-body">
        <div className="field">
          <div className="control">
            <input className="input" type="file" />
          </div>
        </div>
      </div>
    </div>
  );
};
