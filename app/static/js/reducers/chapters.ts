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
  return state;
});

export default actionHandler.getReducer();