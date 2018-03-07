/// <reference types="jest" />

import { List, Map } from "immutable";
import * as XHRmock from "xhr-mock";

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

  it("should use the last value if multiple keys with the same name are given", () => {
    expect(
      util.parseQueryString("key=ham&key=spam&key=eggs")
    ).toEqual(Map([["key", "eggs"]]));
  });

  it("should strip non-alphanumeric characters in keys", () => {
    expect(
      util.parseQueryString("?key1=value1&$key2@=value2&*^$#=value3")
    ).toEqual(Map([["key1", "value1"], ["key2", "value2"]]));
  });

  it("should not remote hyphens and underscores from keys", () => {
    expect(
      util.parseQueryString("?key-1=value1&k_ey2=value2&k-e_y-3=value3")
    ).toEqual(Map([
      ["key-1", "value1"], ["k_ey2", "value2"], ["k-e_y-3", "value3"]
    ]));
  });
});

describe("Utility function getChapterKeyPath()", () => {
  it("should return an empty list when given an empty access path", () => {
    expect(util.generateChapterKeyPath([])).toEqual(List());
  });

  it("should return the same value when passed an access path with a single value", () => {
    expect(util.generateChapterKeyPath([0])).toEqual(List([0]));
  });

  it("should return a list with a single 'children' element when given an access path with two values", () => {
    expect(
      util.generateChapterKeyPath([0, 0])
    ).toEqual(
      List([0, "children", 0])
    );
  });

  it("should return a list with multiple 'children' elements when given a longer access path", () => {
    expect(
      util.generateChapterKeyPath([0, 0, 1, 2])
    ).toEqual(
      List([0, "children", 0, "children", 1, "children", 2])
    );
  });
});

describe("Utility function between()", () => {
  it("should return true if the given value is within bounds", () => {
    expect(util.between(10, 5, 15)).toBeTruthy();
  });

  it("should return false if the given value is outside the bounds", () => {
    expect(util.between(3, 5, 15)).toBeFalsy();
  });

  it("should return false if the given value is on the lower bound and inclusive set to false", () => {
    expect(util.between(5, 5, 15)).toBeFalsy();
  });

  it("should return false if the given value is on the higher bound and inclusive set to false", () => {
    expect(util.between(15, 5, 15)).toBeFalsy();
  });

  it("should return true if the given value is on the lower bound and inclusive set to true", () => {
    expect(util.between(5, 5, 15, true)).toBeTruthy();
  });

  it("should return true if the given value is on the higher bound and inclusive set to true", () => {
    expect(util.between(15, 5, 15, true)).toBeTruthy();
  });
});

describe("The ActionHandler class", () => {
  it("should return the initial state when no handlers are installed", () => {
    const handler = new util.ActionHandler({key: "value"});
    const reducers = handler.getReducer();

    expect(
      reducers(undefined, {type: "SOME_ACTION"})
    ).toEqual({
      key: "value"
    });
  });

  it("should return the given state when no handlers are installed", () => {
    const handler = new util.ActionHandler({key: "value"});
    const reducers = handler.getReducer();

    expect(
      reducers({key: "some application state"}, {type: "SOME_ACTION"})
    ).toEqual({
      key: "some application state"
    });
  });

  it("should return the state untransformed when an unknown action is passed", () => {
    const handler = new util.ActionHandler({key: "value"});

    handler.addHandler("SOME_ACTION", (state) => {
      return {key: "transformed value"};
    });

    const reducers = handler.getReducer();

    expect(
      reducers({key: "some application state"}, {type: "SOME_OTHER_ACTION"})
    ).toEqual({
      key: "some application state"
    });
  });

  it("should transform the state when an action matching a handler is passed", () => {
    const handler = new util.ActionHandler({key: "value"});

    handler.addHandler("SOME_ACTION", (state) => {
      return {key: "transformed value"};
    });

    const reducers = handler.getReducer();

    expect(
      reducers({key: "some application state"}, {type: "SOME_ACTION"})
    ).toEqual({
      key: "transformed value"
    });
  });

  it("should give the last handler precedence if mulitple handlers for the same action are installed", () => {
    const handler = new util.ActionHandler({key: "value"});

    handler.addHandler("SOME_ACTION", (state) => {
      return {key: "transformed value"};
    });

    handler.addHandler("SOME_ACTION", (state) => {
      return {key: "another transformed value"};
    });

    const reducers = handler.getReducer();

    expect(
      reducers({key: "some application state"}, {type: "SOME_ACTION"})
    ).toEqual({
      key: "another transformed value"
    });
  });
});

describe("Utility function makeRequest()", () => {
  it("should reject with empty response when given a non-existent address", () => {
    XHRmock.setup();

    XHRmock.get("http://does-not.exist", (req, res) => {
      return null;
    });

    expect.assertions(1);

    return expect(
      util.makeRequest("GET", "http://does-not.exist")
    ).rejects.toEqual({
      status: 0,
      statusText: "",
      body: null
    }).then(() => {
      XHRmock.teardown();
    });
  });

  it("should reject with HTTP error and the 'body' property set to the response body", () => {
    XHRmock.setup();

    XHRmock.get("http://triggers-some-other.error", (req, res) => {
      return res.status(400).statusText("Bad Request").body("This is the response body");
    });

    expect.assertions(1);

    return expect(
      util.makeRequest("GET", "http://triggers-some-other.error")
    ).rejects.toEqual({
      status: 400,
      statusText: "Bad Request",
      body: "This is the response body"
    }).then(() => {
      XHRmock.teardown();
    });
  });

  it("should reject with HTTP error and message on error", () => {
    XHRmock.setup();

    XHRmock.get("http://triggers-some.error", (req, res) => {
      return res.status(400).statusText("Bad Request").body("Some error occurred");
    });

    expect.assertions(1);

    return expect(
      util.makeRequest("GET", "http://triggers-some.error")
    ).rejects.toEqual({
      status: 400,
      statusText: "Bad Request",
      body: "Some error occurred"
    }).then(() => {
      XHRmock.teardown();
    });
  });

  it("should resolve with HTTP status and body on HTTP status 200", () => {
    XHRmock.setup();

    XHRmock.get("http://should-return.success", (req, res) => {
      return res.status(200).body("Success");
    });

    expect.assertions(1);

    return expect(
      util.makeRequest("GET", "http://should-return.success")
    ).resolves.toEqual("Success").then(() => {
      XHRmock.teardown();
    });
  });

  it("should resolve with HTTP status and body on HTTP status 200", () => {
    XHRmock.setup();

    XHRmock.get("http://should-return.success", (req, res) => {
      return res.status(204);
    });

    expect.assertions(1);

    return expect(
      util.makeRequest("GET", "http://should-return.success")
    ).resolves.toEqual("").then(() => {
      XHRmock.teardown();
    });
  });

  it("should properly set the Content-Type request header", () => {
    XHRmock.setup();

    XHRmock.post("http://should-return.success", (req, res) => {
      return res.status(200).body(req.header("Content-Type"));
    });

    expect.assertions(1);

    return expect(
      util.makeRequest("POST", "http://should-return.success", "", "image/png")
    ).resolves.toEqual("image/png").then(() => {
      XHRmock.teardown();
    });
  });

  it("should automatically stringify the value when passing an object", () => {
    XHRmock.setup();

    XHRmock.post("http://should-stringify.object", (req, res) => {
      return res.status(200).body(req.body());
    });

    expect.assertions(1);

    return expect(
      util.makeRequest("POST", "http://should-stringify.object", {hello: "world"})
    ).resolves.toEqual(JSON.stringify({hello: "world"})).then(() => {
      XHRmock.teardown();
    });
  });

  it("should ignore contentType parameter if an object is passed in as data", () => {
    XHRmock.setup();

    XHRmock.post("http://should-ignore-content.type", (req, res) => {
      return res.status(200).body(req.header("Content-Type"));
    });

    expect.assertions(1);

    return expect(
      util.makeRequest("POST", "http://should-ignore-content.type", {hello: "world"}, "image/png")
    ).resolves.toEqual("application/json").then(() => {
      XHRmock.teardown();
    });
  });

  it("should automatically set the Content-Type header to application/json when passing an object", () => {
    XHRmock.setup();

    XHRmock.post("http://should-set-content.type", (req, res) => {
      return res.status(200).body(req.header("Content-Type"));
    });

    expect.assertions(1);

    return expect(
      util.makeRequest("POST", "http://should-set-content.type", {hello: "world"})
    ).resolves.toEqual("application/json").then(() => {
      XHRmock.teardown();
    });
  });

  it("should automatically set the Content-Type header to application/json when passing an array", () => {
    XHRmock.setup();

    XHRmock.post("http://should-set-content.type", (req, res) => {
      return res.status(200).body(req.header("Content-Type"));
    });

    expect.assertions(1);

    return expect(
      util.makeRequest("POST", "http://should-set-content.type", [1, 2, 3])
    ).resolves.toEqual("application/json").then(() => {
      XHRmock.teardown();
    });
  });

  it("should not automatically set the Content-Type header to application/json when passing an instance of FormData", () => {
    XHRmock.setup();

    XHRmock.post("http://should-not-set-content.type", (req, res) => {
      return res.status(200).body(req.header("Content-Type"));
    });

    expect.assertions(1);

    return expect(
      util.makeRequest("POST", "http://should-not-set-content.type", new FormData())
    ).resolves.not.toEqual("application/json").then(() => {
      XHRmock.teardown();
    });
  });

  it("should send the given data to the server", () => {
    XHRmock.setup();

    XHRmock.post("http://should-send.data", (req, res) => {
      return res.status(200).body(req.body());
    });

    expect.assertions(1);

    return expect(
      util.makeRequest("POST", "http://should-send.data", "hello world")
    ).resolves.toEqual("hello world").then(() => {
      XHRmock.teardown();
    });
  });
});

describe("Utility function shortenUrl()", () => {
  it("should return a promise which resolves to the shortened url", () => {
    XHRmock.setup();

    XHRmock.post(/shorturl/, (req, res) => {
      return res.status(200).body(JSON.stringify({
        id: 0
      }));
    });

    expect.assertions(1);

    return expect(
      util.shortenUrl("http://this-is-a-long.url")
    ).resolves.toEqual("about:///shorturl/0").then(() => {
      XHRmock.teardown();
    });
  });

  it("should reject the promise with an error object on failure", () => {
    XHRmock.setup();

    XHRmock.post(/shorturl/, (req, res) => {
      return res.status(500).statusText("Some error").body("Some more details on the error");
    });

    expect.assertions(1);

    return expect(
      util.shortenUrl("http://this-is-a-long.url")
    ).rejects.toEqual({
      status: 500,
      statusText: "Some error",
      body: "Some more details on the error"
    }).then(() => {
      XHRmock.teardown();
    });
  });
});

describe("Utility function padStart()", () => {
  it("should pad the given string with zeroes to the specified length", () => {
    expect(util.padStart("1", 5)).toEqual("00001");
  });

  it("should pad the given number with zeroes to the specified length and return a string", () => {
    expect(util.padStart(2, 5)).toEqual("00002");
  });

  it("should pad the given string with the given pad to the specified length", () => {
    expect(util.padStart("hi", 5, " ")).toEqual("   hi");
  });

  it("return the string unchanged if it is longer than the pad-length", () => {
    expect(util.padStart("hello", 5)).toEqual("hello");
    expect(util.padStart("hello", 4)).toEqual("hello");
  });

  it("return the string unchanged if the pad is longer than one character", () => {
    expect(util.padStart("a", 5, "hello")).toEqual("a");
  });
});

describe("Utility function getRandomInt()", () => {
  it("should always return the same number if min is equal to max", () => {
    expect(util.getRandomInt(5, 5)).toEqual(5);
  });

  it("should throw an error if min is greater than max", () => {
    expect(util.getRandomInt.bind(null, 10, 5)).toThrow();
  });

  it("should return values between 0 and 9 by default", () => {
    const originalRandom = Math.random;

    Math.random = () => 0;
    expect(util.getRandomInt()).toEqual(0);

    Math.random = () => 0.999999999999;
    expect(util.getRandomInt()).toEqual(9);

    Math.random = originalRandom;

    const rand = util.getRandomInt();
    expect(rand).toBeGreaterThanOrEqual(0);
    expect(rand).toBeLessThan(10);
  });

  it("should throw an error if the given minimum is larger than 10 without a maximum given", () => {
    expect(util.getRandomInt.bind(null, 20)).toThrow();
  });

  it("should always return 10 with a minimum of 10 without a maximum given", () => {
    expect(util.getRandomInt(10)).toEqual(10);
  });

  it("should return values in the given range", () => {
    const [min, max] = [10, 50];
    const originalRandom = Math.random;

    Math.random = () => 0;
    expect(util.getRandomInt(min, max)).toEqual(min);

    Math.random = () => 0.999999999999;
    expect(util.getRandomInt(min, max)).toEqual(max - 1);

    Math.random = originalRandom;

    const rand = util.getRandomInt(min, max);
    expect(rand).toBeGreaterThanOrEqual(min);
    expect(rand).toBeLessThan(max);
  });

  it("should return values between the given min and 9 with only a minimum given which is < 10", () => {
    const min = 5;
    const originalRandom = Math.random;

    Math.random = () => 0;
    expect(util.getRandomInt(min)).toEqual(min);

    Math.random = () => 0.999999999999;
    expect(util.getRandomInt(min)).toEqual(9);

    Math.random = originalRandom;

    const rand = util.getRandomInt(min);
    expect(rand).toBeGreaterThanOrEqual(min);
    expect(rand).toBeLessThan(10);
  });
});

describe("Utility function capitalize()", () => {
  it("should capitalise a lowercase string", () => {
    expect(util.capitalize("hello")).toEqual("Hello");
  });

  it("should should return an already capitalised string unchanged", () => {
    expect(util.capitalize("Hello")).toEqual("Hello");
  });

  it("should not change an all-caps string", () => {
    expect(util.capitalize("HELLO")).toEqual("HELLO");
  });

  it("should capitalise a single letter", () => {
    expect(util.capitalize("a")).toEqual("A");
  });

  it("should simply return an empty string", () => {
    expect(util.capitalize("")).toEqual("");
  });
});

describe("Utility function pluck()", () => {
  it("should return a new object with only the specified keys from the original object", () => {
    const original = {
      a: 1, b: 2,
      c: 3, d: 4
    };
    const result = util.pluck(original, ["a", "d"]);

    expect(result).toEqual({a: 1, d: 4});
    expect(result.b).toBeUndefined();
    expect(result.c).toBeUndefined();
  });

  it("should return an empty object if no keys are selected", () => {
    const original = {
      a: 1, b: 2,
      c: 3, d: 4
    };

    expect(util.pluck(original, [])).toEqual({});
  });
});

describe("Utility function validateLayout()", () => {
  it("should resolve if the schema matches the data", () => {
    XHRmock.setup();

    XHRmock.get("/static/dist/v4-document-schema.json", (req, res) => {
      return res.body(JSON.stringify({
        type: "number"
      }));
    });

    expect.assertions(1);

    return expect(
      util.validateLayout(1)
    ).resolves.toBeUndefined().then(() => {
      XHRmock.teardown();
    });
  });

  it("should reject with error if the schema does not match the data", () => {
    XHRmock.setup();

    XHRmock.get("/static/dist/v4-document-schema.json", (req, res) => {
      return res.body(JSON.stringify({
        type: "string"
      }));
    });

    expect.assertions(1);

    return expect(
      util.validateLayout(1)
    ).rejects.not.toBeUndefined().then(() => {
      XHRmock.teardown();
    });
  });
});
