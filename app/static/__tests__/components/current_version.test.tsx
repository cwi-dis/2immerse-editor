/// <reference types="jest" />

import * as React from "react";
import { mount } from "enzyme";
import { stub } from "sinon";

import * as util from "../../js/editor/util";
import CurrentVersion, { CurrentVersionProps, CurrentVersionState } from "../../js/editor/components/current_version";

function setup() {
  return mount<CurrentVersionProps, CurrentVersionState>(<CurrentVersion />);
}

describe("Component <CurrentVersion/>", () => {
  it("should render a commit hash", () => {
    const promise = Promise.resolve("some_commit_hash");
    const a = stub(util, "makeRequest").callsFake(() => promise);

    const currentVersion = setup();
    expect.assertions(3);

    return promise.then(() => {
      expect(currentVersion.props().commitUrl).toEqual("https://gitlab-ext.irt.de/2-immerse/2immerse-editor/commit/");
      expect(currentVersion.state().hash).toEqual("some_commit_hash");

      expect(
        currentVersion.find("a").first().props().href
      ).toEqual(
        "https://gitlab-ext.irt.de/2-immerse/2immerse-editor/commit/some_commit_hash"
      );

      a.restore();
    });
  });

  it("should render a commit hash", () => {
    const promise = Promise.reject("error");
    const a = stub(util, "makeRequest").callsFake(() => promise);

    const currentVersion = setup();
    expect.assertions(1);

    return promise.catch(() => {
      expect(currentVersion.isEmptyRender()).toBeTruthy();
      a.restore();
    });
  });
});
