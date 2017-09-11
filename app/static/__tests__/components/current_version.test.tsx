/// <reference types="jest" />

import * as React from "react";
import { mount } from "enzyme";
import { stub } from "sinon";

import * as util from "../../js/editor/util";
import CurrentVersion, { CurrentVersionProps, CurrentVersionState } from "../../js/editor/components/current_version";

describe("Component <CurrentVersion/>", () => {
  it("should render a commit hash", () => {
    const promise = Promise.resolve("some_commit_hash");
    const stubbedFn = stub(util, "makeRequest").callsFake(() => promise);

    const currentVersion = mount<CurrentVersionProps, CurrentVersionState>(<CurrentVersion />);
    expect.assertions(4);

    return promise.then(() => {
      expect(currentVersion.props().commitUrl).toEqual("https://gitlab-ext.irt.de/2-immerse/2immerse-editor/commit/");
      expect(currentVersion.state().hash).toEqual("some_commit_hash");
      expect(currentVersion.state().fetchError).toBeFalsy();

      expect(
        currentVersion.find("a").first().props().href
      ).toEqual(
        "https://gitlab-ext.irt.de/2-immerse/2immerse-editor/commit/some_commit_hash"
      );

      stubbedFn.restore();
    });
  });

  it("should render an empty component if request to /version fails", () => {
    const promise = Promise.reject("error");
    const stubbedFn = stub(util, "makeRequest").callsFake(() => promise);

    const currentVersion = mount<CurrentVersionProps, CurrentVersionState>(<CurrentVersion />);
    expect.assertions(3);

    return promise.catch(() => {
      stubbedFn.restore();
    }).then(() => {
      expect(currentVersion.isEmptyRender()).toBeTruthy();
      expect(currentVersion.state("hash")).toEqual("");
      expect(currentVersion.state().fetchError).toBeTruthy();
    });
  });

  it("should take the commit URL as a prop", () => {
    const promise = Promise.resolve("some_other_commit_hash");
    const stubbedFn = stub(util, "makeRequest").callsFake(() => promise);

    const currentVersion = mount<CurrentVersionProps, CurrentVersionState>(
      <CurrentVersion commitUrl="http://my-commit-url.com/" />
    );
    expect.assertions(4);

    return promise.then(() => {
      expect(currentVersion.props().commitUrl).toEqual("http://my-commit-url.com/");
      expect(currentVersion.state().hash).toEqual("some_other_commit_hash");
      expect(currentVersion.state().fetchError).toBeFalsy();

      expect(
        currentVersion.find("a").first().props().href
      ).toEqual(
        "http://my-commit-url.com/some_other_commit_hash"
      );

      stubbedFn.restore();
    });
  });
});
