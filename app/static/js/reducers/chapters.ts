import { List, Map } from "immutable";
import * as shortid from "shortid";
import { ActionHandler, findById } from "../util";
import { ADD_CHAPTER_BEFORE, ADD_CHAPTER_AFTER, ADD_CHAPTER_CHILD } from "../actions";

const testChapters: List<Chapter> = List([
  Map({id: "a", masterLayouts: List([]), children: List([
    Map({id: "aa", masterLayouts: List([]), children: List([
      Map({id: "aaa", masterLayouts: List([]), children: List([
        Map({id: "aab", masterLayouts: List([]), children: List([
          Map({id: "aaba", masterLayouts: List([]), children: List([])}),
          Map({id: "aabb", masterLayouts: List([]), children: List([])})
        ])})
      ])})
    ])}),
    Map({id: "ab", masterLayouts: List([]), children: List([])})
  ])}),
  Map({id: "b", masterLayouts: List([]), children: List([
    Map({id: "ba", masterLayouts: List([]), children: List([
      Map({id: "baa", masterLayouts: List([]), children: List([])}),
      Map({id: "bab", masterLayouts: List([]), children: List([])})
    ])}),
    Map({id: "bb", masterLayouts: List([]), children: List([])}),
  ])}),
  Map({id: "c", masterLayouts: List([]), children: List([
    Map({id: "ca", masterLayouts: List([]), children: List([
      Map({id: "caa", masterLayouts: List([]), children: List([
        Map({id: "caaa", masterLayouts: List([]), children: List([
          Map({id: "caaaa", masterLayouts: List([]), children: List([
            Map({id: "caaaaa", masterLayouts: List([]), children: List([])})
          ])})
        ])})
      ])})
    ])})
  ])})
]);


type MasterId = string;
export type Chapter = Map<string, string | List<any>>;
export type ChapterState = List<Chapter>;

const actionHandler = new ActionHandler<ChapterState>(testChapters);

actionHandler.addHandler("ADD_CHAPTER_BEFORE", (state, action: ADD_CHAPTER_BEFORE) => {
  const { accessPath } = action.payload;

  const insertIndex = accessPath[accessPath.length - 1];
  let list: List<Chapter> = state;

  accessPath.slice(0, accessPath.length - 1).forEach((i) => {
    list = (list.get(i)!.get("children") as List<Chapter>);
  });

  const updatedChildren = list.insert(insertIndex, Map({
    id: shortid.generate(),
    masterLayouts: List(),
    children: List()
  }));

  const keyPath = List(accessPath.slice(0, accessPath.length - 1).reduce((path: Array<string | number>, i) => {
    return path.concat([i, "children"]);
  }, []));

  return state.updateIn(keyPath, () => updatedChildren);
});

actionHandler.addHandler("ADD_CHAPTER_AFTER", (state, action: ADD_CHAPTER_AFTER) => {
  const { accessPath } = action.payload;

  const insertIndex = accessPath[accessPath.length - 1];
  let list: List<Chapter> = state;

  accessPath.slice(0, accessPath.length - 1).forEach((i) => {
    list = (list.get(i)!.get("children") as List<Chapter>);
  });

  const newChapter = Map({
    id: shortid.generate(),
    masterLayouts: List(),
    children: List()
  });
  const updatedChildren = (insertIndex >= list.count()) ? list.push(newChapter) : list.insert(insertIndex + 1, newChapter);

  const keyPath = List(accessPath.slice(0, accessPath.length - 1).reduce((path: Array<string | number>, i) => {
    return path.concat([i, "children"]);
  }, []));

  return state.updateIn(keyPath, () => updatedChildren);
});

export default actionHandler.getReducer();
