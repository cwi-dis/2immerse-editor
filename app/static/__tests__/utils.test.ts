/// <reference types="jest" />

import { List, Map } from "immutable";
import * as util from "../js/editor/util";
import { Chapter } from "../js/editor/reducers/chapters";

describe("Utility function findById()", () => {
  it("finds an element in a list given by ID", () => {
    const lst = List([{id: "a"}, {id: "b"}, {id: "c"}]);

    const [i, element] = util.findById(lst, "a");
    expect(i).toBe(0);
    expect(element).toEqual({id: "a"});
  });

  it("returns undefined on a non-existent ID", () => {
    const lst = List([{id: "a"}, {id: "b"}, {id: "c"}]);

    expect(util.findById(lst, "notfound")).toBeUndefined();
  });

  it("returns undefined on an empty list", () => {
    expect(util.findById(List(), "notfound")).toBeUndefined();
  });
});

describe("Utility function getTreeHeight()", () => {
  it("returns 0 on an empty list", () => {
    expect(util.getTreeHeight(List())).toBe(0);
  });

  it("returns 1 on a tree with a single node", () => {
    const tree = List(
      [new Chapter({id: "chapter0"})]
    );

    expect(util.getTreeHeight(tree)).toBe(1);
  });

  it("returns 2 on a tree with two nodes", () => {
    const tree = List([
      new Chapter({id: "chapter0", children: List([
        new Chapter({id: "chapter1"})
      ])})
    ]);

    expect(util.getTreeHeight(tree)).toBe(2);
  });

  it("returns the length of the longest branch", () => {
    const tree = List([
      new Chapter({id: "chapter1", children: List([
        new Chapter({id: "chapter1.1", children: List([
          new Chapter({id: "chapter1.1.1"})
        ])}),
        new Chapter({id: "chapter1.2", children: List([
          new Chapter({id: "chapter1.2.1", children: List([
            new Chapter({id: "chapter1.2.1.1"})
          ])})
        ])})
      ])})
    ]);

    expect(util.getTreeHeight(tree)).toBe(4);
  });
});

describe("Utility function countLeafNodes()", () => {
  it("should return 1 on a single node", () => {
    const tree = new Chapter({id: "chapter0"});
    expect(util.countLeafNodes(tree)).toBe(1);
  });

  it("should return 1 on a tree with a single branch", () => {
    const tree = new Chapter({id: "chapter1", children: List([
      new Chapter({id: "chapter1.1", children: List([
        new Chapter({id: "chapter1.1.1", children: List([
          new Chapter({id: "chapter1.1.1.1"})
        ])})
      ])})
    ])});

    expect(util.countLeafNodes(tree)).toBe(1);
  });

  it("should return the number of leaf nodes with branches of the same length", () => {
    const tree = new Chapter({id: "chapter1", children: List([
      new Chapter({id: "chapter1.1", children: List([
        new Chapter({id: "chapter1.1.1"}),
        new Chapter({id: "chapter1.1.2"})
      ])})
    ])});

    expect(util.countLeafNodes(tree)).toBe(2);
  });

  it("should return the number of leaf nodes with branches of different length", () => {
    const tree = new Chapter({id: "chapter1", children: List([
      new Chapter({id: "chapter1.1", children: List([
        new Chapter({id: "chapter1.1.1", children: List([
          new Chapter({id: "chapter1.1.1.1", children: List([
            new Chapter({id: "chapter1.1.1.1.1", children: List([
              new Chapter({id: "chapter1.1.1.1.1.1"}),
              new Chapter({id: "chapter1.1.1.1.1.2"}),
            ])})
          ])}),
          new Chapter({id: "chapter1.1.1.2"})
        ])}),
        new Chapter({id: "chapter1.1.2"})
      ])})
    ])});

    expect(util.countLeafNodes(tree)).toBe(4);
  });
});

describe("Utility function parseQueryString()", () => {
  it("should return an empty map on empty string", () => {
    expect(util.parseQueryString("")).toEqual(Map());
  });

  it("should parse a single key-value pair", () => {
    const expected = Map<string, string>([["key", "value"]]);

    expect(
      util.parseQueryString("key=value")
    ).toEqual(expected);
  });

  it("should parse multiple key-value pairs", () => {
    const expected = Map<string, string>([
      ["key1", "value1"],
      ["key2", "value2"],
      ["key3", "value3"],
    ]);

    expect(
      util.parseQueryString("key1=value1&key2=value2&key3=value3")
    ).toEqual(expected);
  });

  it("should parse all values as strings", () => {
    const expected = Map<string, string>([
      ["key1", "value1"],
      ["key2", "42"],
      ["key3", "0.123"],
    ]);

    expect(
      util.parseQueryString("key1=value1&key2=42&key3=0.123")
    ).toEqual(expected);
  });

  it("should decode URI-encoded values", () => {
    const expected = Map<string, string>([
      ["key1", "spam&eggs"],
      ["key2", "ham, spam & eggs"],
      ["key3", "answer=42"],
    ]);

    expect(
      util.parseQueryString("key1=spam%26eggs&key2=ham%2C%20spam%20%26%20eggs&key3=answer%3D42")
    ).toEqual(expected);
  });

  it("should ignore values with empty keys", () => {
    expect(util.parseQueryString("=value")).toEqual(Map());
    expect(util.parseQueryString("=value1&=value2")).toEqual(Map());

    expect(
      util.parseQueryString("=value1&key2=value2&=value3")
    ).toEqual(
      Map<string, string>([["key2", "value2"]])
      );
  });

  it("should assign undefined to keys without value", () => {
    expect(
      util.parseQueryString("key")
    ).toEqual(Map([["key", undefined]]));

    expect(
      util.parseQueryString("key1&key2")
    ).toEqual(Map([["key1", undefined], ["key2", undefined]]));
  });

  it("should assign empty string to keys with empty value", () => {
    expect(
      util.parseQueryString("key=")
    ).toEqual(Map([["key", ""]]));

    expect(
      util.parseQueryString("key1=&key2=")
    ).toEqual(Map([["key1", ""], ["key2", ""]]));
  });
});
