import { ActionCreatorsMapObject } from "redux";
import { List } from "immutable";
import { AsyncAction, PayloadAction, generateChapterKeyPath } from "../util";

export type ADD_CHAPTER_BEFORE = PayloadAction<"ADD_CHAPTER_BEFORE", {accessPath: Array<number>}>;
function addChapterBefore(accessPath: Array<number>): ADD_CHAPTER_BEFORE {
  return {
    type: "ADD_CHAPTER_BEFORE",
    payload: {
      accessPath
    }
  };
}

export type ADD_CHAPTER_AFTER = PayloadAction<"ADD_CHAPTER_AFTER", {accessPath: Array<number>}>;
function addChapterAfter(accessPath: Array<number>): ADD_CHAPTER_AFTER {
  return {
    type: "ADD_CHAPTER_AFTER",
    payload: {
      accessPath
    }
  };
}

export type ADD_CHAPTER_CHILD = PayloadAction<"ADD_CHAPTER_CHILD", {accessPath: Array<number>}>;
function addChapterChild(accessPath: Array<number>): ADD_CHAPTER_CHILD {
  return {
    type: "ADD_CHAPTER_CHILD",
    payload: {
      accessPath
    }
  };
}

export type RENAME_CHAPTER = PayloadAction<"RENAME_CHAPTER", {accessPath: Array<number>, name: string}>;
function renameChapter(accessPath: Array<number>, name: string): RENAME_CHAPTER {
  return {
    type: "RENAME_CHAPTER",
    payload: {
      accessPath,
      name
    }
  };
}

export type REMOVE_CHAPTER = PayloadAction<"REMOVE_CHAPTER", {accessPath: Array<number>}>;
function removeChapter(accessPath: Array<number>): REMOVE_CHAPTER {
  return {
    type: "REMOVE_CHAPTER",
    payload: {
      accessPath
    }
  };
}

export type ADD_TIMELINE_TRACK_TO_CHAPTER = PayloadAction<"ADD_TIMELINE_TRACK_TO_CHAPTER", {accessPath: Array<number>, regionId: string, locked: boolean}>;
function addTimelineTrackToChapter(accessPath: Array<number>, regionId: string, locked: boolean): ADD_TIMELINE_TRACK_TO_CHAPTER {
  return {
    type: "ADD_TIMELINE_TRACK_TO_CHAPTER",
    payload: {
      accessPath,
      regionId,
      locked
    }
  };
}

function addChapterBeforeAndAddTracks(accessPath: Array<number>): AsyncAction<void> {
  return (dispatch, getState) => {
    dispatch(addChapterBefore(accessPath));

    const { screens: { previewScreens } } = getState();
    const regionIds = previewScreens.reduce((acc, screen) => {
      return acc.concat(screen.get("regions").map((region) => region.id));
    }, List<string>());

    regionIds.forEach((regionId) => {
      dispatch(addTimelineTrackToChapter(accessPath, regionId, false));
    });
  };
}

export interface ChapterActions extends ActionCreatorsMapObject {
  addChapterAfter: (accessPath: Array<number>) => ADD_CHAPTER_AFTER;
  addChapterBefore: (accessPath: Array<number>) => ADD_CHAPTER_BEFORE;
  addChapterBeforeAndAddTracks: (accessPath: Array<number>) => AsyncAction<void>;
  addChapterChild: (accessPath: Array<number>) => ADD_CHAPTER_CHILD;
  renameChapter: (accessPath: Array<number>, name: string) => RENAME_CHAPTER;
  removeChapter: (accessPath: Array<number>) => REMOVE_CHAPTER;
  addTimelineTrackToChapter: (accessPath: Array<number>, regionId: string, locked: boolean) => ADD_TIMELINE_TRACK_TO_CHAPTER;
}

export const actionCreators: ChapterActions = {
  addChapterBefore,
  addChapterBeforeAndAddTracks,
  addChapterAfter,
  addChapterChild,
  renameChapter,
  removeChapter,
  addTimelineTrackToChapter
};
