/// <reference types="jest" />

import * as configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import { List } from "immutable";

import * as actionTypes from "../../js/editor/actions/chapters";
import { actionCreators } from "../../js/editor/actions/chapters";
import { Chapter } from "../../js/editor/reducers/chapters";

describe("Chapter actions", () => {
  it("should create an ADD_CHAPTER_BEFORE action", () => {
    const expected: actionTypes.ADD_CHAPTER_BEFORE = {
      type: "ADD_CHAPTER_BEFORE",
      payload: {
        accessPath: [0, 1, 0]
      }
    };

    expect(actionCreators.addChapterBefore([0, 1, 0])).toEqual(expected);
  });

  it("should create an ADD_CHAPTER_AFTER action", () => {
    const expected: actionTypes.ADD_CHAPTER_AFTER = {
      type: "ADD_CHAPTER_AFTER",
      payload: {
        accessPath: [0, 1, 0]
      }
    };

    expect(actionCreators.addChapterAfter([0, 1, 0])).toEqual(expected);
  });

  it("should create an ADD_CHAPTER_CHILD action", () => {
    const expected: actionTypes.ADD_CHAPTER_CHILD = {
      type: "ADD_CHAPTER_CHILD",
      payload: {
        accessPath: [0, 1, 0]
      }
    };

    expect(actionCreators.addChapterChild([0, 1, 0])).toEqual(expected);
  });

  it("should create an ASSIGN_MASTER action", () => {
    const expected: actionTypes.ASSIGN_MASTER = {
      type: "ASSIGN_MASTER",
      payload: {
        accessPath: [0, 1, 0],
        masterId: "masterID1"
      }
    };

    expect(actionCreators.assignMaster([0, 1, 0], "masterID1")).toEqual(expected);
  });

  it("should create an REMOVE_CHAPTER action", () => {
    const expected: actionTypes.REMOVE_CHAPTER = {
      type: "REMOVE_CHAPTER",
      payload: {
        accessPath: [0, 1, 0]
      }
    };

    expect(actionCreators.removeChapter([0, 1, 0])).toEqual(expected);
  });

  it("should create an RENAME_CHAPTER action", () => {
    const expected: actionTypes.RENAME_CHAPTER = {
      type: "RENAME_CHAPTER",
      payload: {
        accessPath: [0, 1, 0],
        name: "new chapter name"
      }
    };

    expect(actionCreators.renameChapter([0, 1, 0], "new chapter name")).toEqual(expected);
  });
});

describe("Async chapter actions", () => {
  const mockStore = configureMockStore([thunk]);

  it("should assign the same master ID recursivley to all children", () => {
    const expectedActions = [
      { type: "ASSIGN_MASTER", payload: { masterId: "master1", accessPath: [0, 0] }},
      { type: "ASSIGN_MASTER", payload: { masterId: "master1", accessPath: [0, 0, 0] }},
      { type: "ASSIGN_MASTER", payload: { masterId: "master1", accessPath: [0, 0, 1] }},
      { type: "ASSIGN_MASTER", payload: { masterId: "master1", accessPath: [0, 0, 1, 0] }},
    ];

    const store = mockStore({ chapters: List([
      new Chapter({id: "chapter0", children: List([
        new Chapter({id: "chapter0.0", children: List([
          new Chapter({id: "chapter0.0.0"}),
          new Chapter({id: "chapter0.0.1", children: List([
            new Chapter({id: "chapter0.0.1.0"})
          ])})
        ])}),
        new Chapter({id: "chapter0.1", children: List([
          new Chapter({id: "chapter0.1.0"})
        ])})
      ])})
    ]) });

    store.dispatch(actionCreators.assignMasterToTree([0, 0], "master1"));

    expect(store.getActions()).toEqual(expectedActions);
  });

  it("should assign a master ID to the chapter if the chapter has no children", () => {
    const expectedActions = [
      { type: "ASSIGN_MASTER", payload: { masterId: "master1", accessPath: [0, 0] }},
    ];

    const store = mockStore({ chapters: List([
      new Chapter({id: "chapter0", children: List([
        new Chapter({id: "chapter0.0", children: null}),
        new Chapter({id: "chapter0.1", children: List([
          new Chapter({id: "chapter0.1.0"})
        ])})
      ])})
    ]) });

    store.dispatch(actionCreators.assignMasterToTree([0, 0], "master1"));

    expect(store.getActions()).toEqual(expectedActions);
  });
});
