/// <reference types="jest" />

import * as React from "react";
import { mount } from "enzyme";
import { stub } from "sinon";

import * as util from "../../js/editor/util";
import CurrentVersion, { CurrentVersionProps, CurrentVersionState } from "../../js/editor/components/current_version";

describe("Component <CurrentVersion/>", () => {
  it("should render a commit hash", () => {
    const promise = Promise.resolve(JSON.stringify(["some_branch", "some_commit_hash"]));
    const stubbedFn = stub(util, "makeRequest").callsFake(() => promise);

    const currentVersion = mount<CurrentVersionProps, CurrentVersionState>(<CurrentVersion />);
    expect.assertions(5);

    return promise.then(() => {
      expect(currentVersion.props().commitUrl).toEqual("https://gitlab-ext.irt.de/2-immerse/2immerse-editor/commit/");
      expect(currentVersion.state().branch).toEqual("some_branch");
      expect(currentVersion.state().revision).toEqual("some_commit_hash");
      expect(currentVersion.state().fetchError).toBeFalsy();

      expect(
        currentVersion.render().find("a").first().prop("href")
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
    expect.assertions(4);

    return promise.catch(() => {
      stubbedFn.restore();
    }).then(() => {
      expect(currentVersion.isEmptyRender()).toBeTruthy();
      expect(currentVersion.state().branch).toEqual("");
      expect(currentVersion.state().revision).toEqual("");
      expect(currentVersion.state().fetchError).toBeTruthy();
    });
  });

  it("should take the commit URL as a prop", () => {
    const promise = Promise.resolve(JSON.stringify(["some_other_branch", "some_other_commit_hash"]));
    const stubbedFn = stub(util, "makeRequest").callsFake(() => promise);

    const currentVersion = mount<CurrentVersionProps, CurrentVersionState>(
      <CurrentVersion commitUrl="http://my-commit-url.com/" />
    );
    expect.assertions(5);

    return promise.then(() => {
      expect(currentVersion.props().commitUrl).toEqual("http://my-commit-url.com/");
      expect(currentVersion.state().branch).toEqual("some_other_branch");
      expect(currentVersion.state().revision).toEqual("some_other_commit_hash");
      expect(currentVersion.state().fetchError).toBeFalsy();

      expect(
        currentVersion.render().find("a").first().prop("href")
      ).toEqual(
        "http://my-commit-url.com/some_other_commit_hash"
      );

      stubbedFn.restore();
    });
  });
});
