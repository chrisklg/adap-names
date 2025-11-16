import { describe, it, expect } from "vitest";

import { Name } from "../../../src/adap-b02/names/Name";
import { StringName } from "../../../src/adap-b02/names/StringName";
import { StringArrayName } from "../../../src/adap-b02/names/StringArrayName";

describe("Basic StringName function tests", () => {
  it("test insert", () => {
    let n: Name = new StringName("oss.fau.de");
    n.insert(1, "cs");
    expect(n.asString()).toBe("oss.cs.fau.de");
  });
  it("test append", () => {
    let n: Name = new StringName("oss.cs.fau");
    n.append("de");
    expect(n.asString()).toBe("oss.cs.fau.de");
  });
  it("test remove", () => {
    let n: Name = new StringName("oss.cs.fau.de");
    n.remove(0);
    expect(n.asString()).toBe("cs.fau.de");
  });
});

describe("Basic StringArrayName function tests", () => {
  it("test insert", () => {
    let n: Name = new StringArrayName(["oss", "fau", "de"]);
    n.insert(1, "cs");
    expect(n.asString()).toBe("oss.cs.fau.de");
  });
  it("test append", () => {
    let n: Name = new StringArrayName(["oss", "cs", "fau"]);
    n.append("de");
    expect(n.asString()).toBe("oss.cs.fau.de");
  });
  it("test remove", () => {
    let n: Name = new StringArrayName(["oss", "cs", "fau", "de"]);
    n.remove(0);
    expect(n.asString()).toBe("cs.fau.de");
  });
});

describe("Delimiter function tests", () => {
  it("test insert", () => {
    let n: Name = new StringName("oss#fau#de", "#");
    n.insert(1, "cs");
    expect(n.asString()).toBe("oss#cs#fau#de");
  });
});

describe("Escape character extravaganza", () => {
  it("test escape and delimiter boundary conditions", () => {
    let n: Name = new StringName("oss.cs.fau.de", "#");
    expect(n.getNoComponents()).toBe(1);
    expect(n.asString()).toBe("oss.cs.fau.de");
    n.append("people");
    expect(n.asString()).toBe("oss.cs.fau.de#people");
  });
});

describe("StringName - Constructor and Initialization", () => {
  it("should create name with single component", () => {
    const n = new StringName("component");
    expect(n.getNoComponents()).toBe(1);
    expect(n.getComponent(0)).toBe("component");
  });

  it("should create name with multiple components", () => {
    const n = new StringName("a.b.c.d");
    expect(n.getNoComponents()).toBe(4);
    expect(n.getComponent(0)).toBe("a");
    expect(n.getComponent(3)).toBe("d");
  });

  it("should handle custom delimiter", () => {
    const n = new StringName("a/b/c", "/");
    expect(n.getNoComponents()).toBe(3);
    expect(n.getDelimiterCharacter()).toBe("/");
  });

  it("should handle empty components", () => {
    const n = new StringName("...");
    expect(n.getNoComponents()).toBe(4);
    expect(n.getComponent(0)).toBe("");
    expect(n.getComponent(1)).toBe("");
  });

  it("should throw error for empty string", () => {
    expect(() => new StringName("")).toThrow("Components not initialized");
  });

  it("should throw error for invalid delimiter (multiple chars)", () => {
    expect(() => new StringName("a.b", "..")).toThrow(
      "Delimiter must be exactly one character"
    );
  });

  it("should throw error for escape character as delimiter", () => {
    expect(() => new StringName("a.b", "\\")).toThrow(
      "Delimiter cannot be the escape character"
    );
  });
});

describe("StringArrayName - Constructor and Initialization", () => {
  it("should create name with single component", () => {
    const n = new StringArrayName(["component"]);
    expect(n.getNoComponents()).toBe(1);
    expect(n.getComponent(0)).toBe("component");
  });

  it("should create name with multiple components", () => {
    const n = new StringArrayName(["a", "b", "c", "d"]);
    expect(n.getNoComponents()).toBe(4);
    expect(n.getComponent(0)).toBe("a");
    expect(n.getComponent(3)).toBe("d");
  });

  it("should handle custom delimiter", () => {
    const n = new StringArrayName(["a", "b", "c"], "/");
    expect(n.getNoComponents()).toBe(3);
    expect(n.getDelimiterCharacter()).toBe("/");
  });

  it("should throw error for empty array", () => {
    expect(() => new StringArrayName([])).toThrow("Components not initialized");
  });
});

describe("getComponent and setComponent", () => {
  it("StringName: should get and set components", () => {
    const n = new StringName("a.b.c");
    expect(n.getComponent(1)).toBe("b");
    n.setComponent(1, "x");
    expect(n.getComponent(1)).toBe("x");
    expect(n.asString()).toBe("a.x.c");
  });

  it("StringArrayName: should get and set components", () => {
    const n = new StringArrayName(["a", "b", "c"]);
    expect(n.getComponent(1)).toBe("b");
    n.setComponent(1, "x");
    expect(n.getComponent(1)).toBe("x");
    expect(n.asString()).toBe("a.x.c");
  });

  it("should throw error for invalid index on get", () => {
    const n = new StringName("a.b.c");
    expect(() => n.getComponent(-1)).toThrow("Index -1 out of bounds");
    expect(() => n.getComponent(3)).toThrow("Index 3 out of bounds");
  });

  it("should throw error for invalid index on set", () => {
    const n = new StringName("a.b.c");
    expect(() => n.setComponent(-1, "x")).toThrow("Index -1 out of bounds");
    expect(() => n.setComponent(3, "x")).toThrow("Index 3 out of bounds");
  });
});

describe("insert", () => {
  it("StringName: should insert at beginning", () => {
    const n = new StringName("b.c.d");
    n.insert(0, "a");
    expect(n.asString()).toBe("a.b.c.d");
    expect(n.getNoComponents()).toBe(4);
  });

  it("StringName: should insert in middle", () => {
    const n = new StringName("a.c.d");
    n.insert(1, "b");
    expect(n.asString()).toBe("a.b.c.d");
  });

  it("StringName: should insert at end", () => {
    const n = new StringName("a.b.c");
    n.insert(3, "d");
    expect(n.asString()).toBe("a.b.c.d");
  });

  it("StringArrayName: should insert at various positions", () => {
    const n = new StringArrayName(["b", "d"]);
    n.insert(1, "c");
    expect(n.asString()).toBe("b.c.d");
    n.insert(0, "a");
    expect(n.asString()).toBe("a.b.c.d");
  });

  it("should throw error for invalid insert index", () => {
    const n = new StringName("a.b.c");
    expect(() => n.insert(-1, "x")).toThrow("Index -1 out of bounds");
    expect(() => n.insert(4, "x")).toThrow("Index 4 out of bounds");
  });
});

describe("append", () => {
  it("StringName: should append multiple components", () => {
    const n = new StringName("a");
    n.append("b");
    n.append("c");
    expect(n.asString()).toBe("a.b.c");
    expect(n.getNoComponents()).toBe(3);
  });

  it("StringArrayName: should append multiple components", () => {
    const n = new StringArrayName(["a"]);
    n.append("b");
    n.append("c");
    expect(n.asString()).toBe("a.b.c");
  });

  it("should handle appending empty strings", () => {
    const n = new StringName("a.b");
    n.append("");
    expect(n.asString()).toBe("a.b.");
    expect(n.getComponent(2)).toBe("");
  });
});

describe("remove", () => {
  it("StringName: should remove first component", () => {
    const n = new StringName("a.b.c.d");
    n.remove(0);
    expect(n.asString()).toBe("b.c.d");
    expect(n.getNoComponents()).toBe(3);
  });

  it("StringName: should remove middle component", () => {
    const n = new StringName("a.b.c.d");
    n.remove(2);
    expect(n.asString()).toBe("a.b.d");
  });

  it("StringName: should remove last component", () => {
    const n = new StringName("a.b.c.d");
    n.remove(3);
    expect(n.asString()).toBe("a.b.c");
  });

  it("StringArrayName: should remove components", () => {
    const n = new StringArrayName(["a", "b", "c"]);
    n.remove(1);
    expect(n.asString()).toBe("a.c");
  });

  it("should throw error for invalid remove index", () => {
    const n = new StringName("a.b.c");
    expect(() => n.remove(-1)).toThrow("Index -1 out of bounds");
    expect(() => n.remove(3)).toThrow("Index 3 out of bounds");
  });
});

describe("concat", () => {
  it("StringName: should concat two names", () => {
    const n1 = new StringName("a.b");
    const n2 = new StringName("c.d");
    n1.concat(n2);
    expect(n1.asString()).toBe("a.b.c.d");
    expect(n1.getNoComponents()).toBe(4);
  });

  it("StringName: should handle empty name concat", () => {
    const n1 = new StringName("a.b");
    const n2 = new StringName("c");
    n2.remove(0);
    n1.concat(n2);
    expect(n1.asString()).toBe("a.b");
  });

  it("StringName: should concat names with different delimiters", () => {
    const n1 = new StringName("a.b", ".");
    const n2 = new StringName("c#d", "#");
    n1.concat(n2);
    expect(n1.getNoComponents()).toBe(4);
  });
});

describe("isEmpty", () => {
  it("StringName: should not be empty with components", () => {
    const n = new StringName("a.b.c");
    expect(n.isEmpty()).toBe(false);
  });

  it("StringName: single component should not be empty", () => {
    const n = new StringName("a");
    expect(n.isEmpty()).toBe(false);
  });
});

describe("Escape sequences and masking", () => {
  it("StringName: should handle escaped delimiter in component", () => {
    const n = new StringName("a\\.b.c");
    expect(n.getNoComponents()).toBe(2);
    expect(n.getComponent(0)).toBe("a\\.b");
    expect(n.asString()).toBe("a.b.c");
  });

  it("StringName: should handle escaped escape character", () => {
    const n = new StringName("a\\\\b.c");
    expect(n.getNoComponents()).toBe(2);
    expect(n.getComponent(0)).toBe("a\\\\b");
    expect(n.asString()).toBe("a\\b.c");
  });

  it("StringName: should handle multiple escape sequences", () => {
    const n = new StringName("a\\.b\\.c.d");
    expect(n.getNoComponents()).toBe(2);
    expect(n.asString()).toBe("a.b.c.d");
  });

  it("StringArrayName: should handle escaped delimiter in component", () => {
    const n = new StringArrayName(["a\\.b", "c"]);
    expect(n.getComponent(0)).toBe("a\\.b");
    expect(n.asString()).toBe("a.b.c");
  });

  it("should handle setting component with escaped characters", () => {
    const n = new StringName("a.b.c");
    n.setComponent(1, "x\\.y");
    expect(n.asString()).toBe("a.x.y.c");
  });

  it("should handle inserting component with escaped characters", () => {
    const n = new StringName("a.c");
    n.insert(1, "b\\.x");
    expect(n.asString()).toBe("a.b.x.c");
  });

  it("should handle appending component with escaped characters", () => {
    const n = new StringName("a.b");
    n.append("c\\.d");
    expect(n.asString()).toBe("a.b.c.d");
  });
});

describe("asString with custom delimiter", () => {
  it("StringName: should output with custom delimiter", () => {
    const n = new StringName("a.b.c");
    expect(n.asString("/")).toBe("a/b/c");
    expect(n.asString("-")).toBe("a-b-c");
  });

  it("StringArrayName: should output with custom delimiter", () => {
    const n = new StringArrayName(["a", "b", "c"]);
    expect(n.asString("/")).toBe("a/b/c");
    expect(n.asString("#")).toBe("a#b#c");
  });

  it("should maintain internal delimiter while outputting differently", () => {
    const n = new StringName("a.b.c");
    expect(n.asString("/")).toBe("a/b/c");
    expect(n.getDelimiterCharacter()).toBe(".");
    expect(n.asString()).toBe("a.b.c");
  });
});

describe("asDataString", () => {
  it("StringName: should return data string with default delimiter", () => {
    const n = new StringName("a.b.c");
    expect(n.asDataString()).toBe("a.b.c");
  });

  it("StringName: should convert custom delimiter to default", () => {
    const n = new StringName("a#b#c", "#");
    expect(n.asDataString()).toBe("a.b.c");
  });

  it("StringArrayName: should return data string with default delimiter", () => {
    const n = new StringArrayName(["a", "b", "c"]);
    expect(n.asDataString()).toBe("a.b.c");
  });

  it("StringArrayName: should handle custom delimiter", () => {
    const n = new StringArrayName(["a", "b", "c"], "#");
    expect(n.asDataString()).toBe("a.b.c");
  });
});
