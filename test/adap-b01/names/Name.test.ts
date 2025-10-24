import { describe, it, expect } from "vitest";
import { Name, ESCAPE_CHARACTER } from "../../../src/adap-b01/names/Name";

// ============================================================
// BASIC INITIALIZATION TESTS
// ============================================================

describe("Basic initialization tests", () => {
  it("should create name with default delimiter", () => {
    let n: Name = new Name(["oss", "cs", "fau", "de"]);
    expect(n.asString()).toBe("oss.cs.fau.de");
    expect(n.getNoComponents()).toBe(4);
  });

  it("should create name with custom delimiter", () => {
    let n: Name = new Name(["oss", "cs", "fau", "de"], "#");
    expect(n.asString()).toBe("oss#cs#fau#de");
    expect(n.getNoComponents()).toBe(4);
  });

  it("should create name with single component", () => {
    let n: Name = new Name(["single"]);
    expect(n.asString()).toBe("single");
    expect(n.getNoComponents()).toBe(1);
  });

  it("should reject empty components array", () => {
    expect(() => new Name([])).toThrow("Components not initialized");
  });

  it("should handle empty string components", () => {
    let n: Name = new Name(["", "", ""]);
    expect(n.getNoComponents()).toBe(3);
    expect(n.asString()).toBe("..");
  });
});

// ============================================================
// DELIMITER VALIDATION TESTS
// ============================================================

describe("Delimiter validation tests", () => {
  it("should reject empty string as delimiter", () => {
    expect(() => new Name(["a"], "")).toThrow(
      "Delimiter must be exactly one character"
    );
  });

  it("should reject multi-character delimiter", () => {
    expect(() => new Name(["a"], "..")).toThrow(
      "Delimiter must be exactly one character"
    );
    expect(() => new Name(["a"], "abc")).toThrow(
      "Delimiter must be exactly one character"
    );
  });

  it("should reject escape character as delimiter", () => {
    expect(() => new Name(["a"], ESCAPE_CHARACTER)).toThrow(
      "Delimiter cannot be the escape character"
    );
  });

  it("should accept various single-character delimiters", () => {
    expect(() => new Name(["a"], ".")).not.toThrow();
    expect(() => new Name(["a"], "#")).not.toThrow();
    expect(() => new Name(["a"], "/")).not.toThrow();
    expect(() => new Name(["a"], "-")).not.toThrow();
    expect(() => new Name(["a"], "_")).not.toThrow();
  });
});

// ============================================================
// COMPONENT MASKING VALIDATION TESTS
// ============================================================

describe("Constructor validation for properly masked components", () => {
  it("should reject component with unmasked default delimiter", () => {
    expect(() => new Name(["a.b"])).toThrow("not properly masked");
  });

  it("should accept component with masked default delimiter", () => {
    let n: Name = new Name(["a\\.b"]);
    expect(n.asString()).toBe("a.b");
    expect(n.getNoComponents()).toBe(1);
  });

  it("should reject component with unmasked custom delimiter", () => {
    expect(() => new Name(["a#b"], "#")).toThrow("not properly masked");
  });

  it("should accept component with masked custom delimiter", () => {
    let n: Name = new Name(["a\\#b"], "#");
    expect(n.asString()).toBe("a#b");
    expect(n.getNoComponents()).toBe(1);
  });

  it("should accept component with non-delimiter special chars unmasked", () => {
    // a.b is OK when delimiter is '#' (because '.' is not a special char)
    let n: Name = new Name(["a.b"], "#");
    expect(n.asString()).toBe("a.b");
  });

  it("should handle mixed escaped and unescaped chars", () => {
    expect(() => new Name(["a\\.b.c"])).toThrow("not properly masked");
  });

  it("should reject trailing escape character", () => {
    expect(() => new Name(["test\\"])).toThrow(
      "not properly masked"
    );
  });

  it("should reject multiple trailing escape characters (odd number)", () => {
    expect(() => new Name(["test\\\\\\"])).toThrow(
      "not properly masked"
    );
  });

  it("should accept escaped escape character", () => {
    let n: Name = new Name(["test\\\\"]);
    expect(n.asString()).toBe("test\\");
  });
});

// ============================================================
// ESCAPE CHARACTER TESTS
// ============================================================

describe("Escape character masking tests", () => {
  it("should handle escaped delimiter in component", () => {
    let n: Name = new Name(["a\\.b"]);
    expect(n.getNoComponents()).toBe(1);
    expect(n.asString()).toBe("a.b");
  });

  it("should handle escaped escape character", () => {
    let n: Name = new Name(["a\\\\b"]);
    expect(n.asString()).toBe("a\\b");
  });

  it("should handle multiple escaped delimiters", () => {
    let n: Name = new Name(["a\\.b\\.c"]);
    expect(n.asString()).toBe("a.b.c");
    expect(n.getNoComponents()).toBe(1);
  });

  it("should handle only escape characters", () => {
    let n: Name = new Name(["\\\\\\\\"]);
    expect(n.asString()).toBe("\\\\");
  });

  it("should handle escaped delimiter at start", () => {
    let n: Name = new Name(["\\.test"]);
    expect(n.asString()).toBe(".test");
  });

  it("should handle escaped delimiter at end", () => {
    let n: Name = new Name(["test\\."]);
    expect(n.asString()).toBe("test.");
  });
});

// ============================================================
// BASIC FUNCTION TESTS
// ============================================================

describe("Basic function tests", () => {
  it("should insert component at beginning", () => {
    let n: Name = new Name(["cs", "fau", "de"]);
    n.insert(0, "oss");
    expect(n.asString()).toBe("oss.cs.fau.de");
  });

  it("should insert component in middle", () => {
    let n: Name = new Name(["oss", "fau", "de"]);
    n.insert(1, "cs");
    expect(n.asString()).toBe("oss.cs.fau.de");
  });

  it("should insert component at end", () => {
    let n: Name = new Name(["oss", "cs", "fau"]);
    n.insert(3, "de");
    expect(n.asString()).toBe("oss.cs.fau.de");
  });

  it("should append component", () => {
    let n: Name = new Name(["oss", "cs", "fau"]);
    n.append("de");
    expect(n.asString()).toBe("oss.cs.fau.de");
  });

  it("should remove component from beginning", () => {
    let n: Name = new Name(["oss", "cs", "fau", "de"]);
    n.remove(0);
    expect(n.asString()).toBe("cs.fau.de");
  });

  it("should remove component from middle", () => {
    let n: Name = new Name(["oss", "cs", "fau", "de"]);
    n.remove(1);
    expect(n.asString()).toBe("oss.fau.de");
  });

  it("should remove component from end", () => {
    let n: Name = new Name(["oss", "cs", "fau", "de"]);
    n.remove(3);
    expect(n.asString()).toBe("oss.cs.fau");
  });

  it("should get component", () => {
    let n: Name = new Name(["oss", "cs", "fau", "de"]);
    expect(n.getComponent(0)).toBe("oss");
    expect(n.getComponent(1)).toBe("cs");
    expect(n.getComponent(2)).toBe("fau");
    expect(n.getComponent(3)).toBe("de");
  });

  it("should set component", () => {
    let n: Name = new Name(["oss", "cs", "fau", "de"]);
    n.setComponent(1, "it");
    expect(n.asString()).toBe("oss.it.fau.de");
  });
});

// ============================================================
// DELIMITER FUNCTION TESTS
// ============================================================

describe("Delimiter function tests", () => {
  it("should insert with custom delimiter", () => {
    let n: Name = new Name(["oss", "fau", "de"], "#");
    n.insert(1, "cs");
    expect(n.asString()).toBe("oss#cs#fau#de");
  });

  it("should append with custom delimiter", () => {
    let n: Name = new Name(["oss", "cs", "fau"], "#");
    n.append("de");
    expect(n.asString()).toBe("oss#cs#fau#de");
  });

  it("should use custom delimiter in asString", () => {
    let n: Name = new Name(["a", "b", "c"]);
    expect(n.asString("/")).toBe("a/b/c");
    expect(n.asString("#")).toBe("a#b#c");
    expect(n.asString("-")).toBe("a-b-c");
  });

  it("should handle switching delimiter with escaped characters", () => {
    let n: Name = new Name(["a\\.b", "c"], ".");
    expect(n.asString("#")).toBe("a.b#c");
  });
});

// ============================================================
// INSERT/APPEND/REMOVE WITH MASKING TESTS
// ============================================================

describe("Insert/Append/Remove with masking validation", () => {
  it("should insert properly masked component", () => {
    let n: Name = new Name(["a", "c"]);
    n.insert(1, "b\\.d");
    expect(n.asString()).toBe("a.b.d.c");
  });

  it("should append properly masked component", () => {
    let n: Name = new Name(["a"]);
    n.append("b\\.c");
    expect(n.asString()).toBe("a.b.c");
  });

  it("should reject setComponent with improperly masked component", () => {
    let n: Name = new Name(["a", "b"]);
    expect(() => n.setComponent(0, "c.d")).toThrow("unescaped delimiter");
  });

  it("should reject append with trailing escape", () => {
    let n: Name = new Name(["a"]);
    expect(() => n.append("test\\")).toThrow("escape character at end");
  });

  it("should insert component with escaped escape character", () => {
    let n: Name = new Name(["a"]);
    n.insert(0, "b\\\\c");
    expect(n.asString()).toBe("b\\c.a");
  });
});

// ============================================================
// INDEX BOUNDARY TESTS
// ============================================================

describe("Index boundary tests", () => {
  it("should reject negative indices for getComponent", () => {
    let n: Name = new Name(["a", "b"]);
    expect(() => n.getComponent(-1)).toThrow("out of bounds");
  });

  it("should reject negative indices for setComponent", () => {
    let n: Name = new Name(["a", "b"]);
    expect(() => n.setComponent(-1, "x")).toThrow("out of bounds");
  });

  it("should reject negative indices for remove", () => {
    let n: Name = new Name(["a", "b"]);
    expect(() => n.remove(-1)).toThrow("out of bounds");
  });

  it("should reject negative indices for insert", () => {
    let n: Name = new Name(["a", "b"]);
    expect(() => n.insert(-1, "x")).toThrow("out of bounds");
  });

  it("should reject out of bounds indices for getComponent", () => {
    let n: Name = new Name(["a", "b"]);
    expect(() => n.getComponent(2)).toThrow("out of bounds");
    expect(() => n.getComponent(10)).toThrow("out of bounds");
  });

  it("should reject out of bounds indices for setComponent", () => {
    let n: Name = new Name(["a", "b"]);
    expect(() => n.setComponent(2, "x")).toThrow("out of bounds");
  });

  it("should reject out of bounds indices for remove", () => {
    let n: Name = new Name(["a", "b"]);
    expect(() => n.remove(2)).toThrow("out of bounds");
  });

  it("should allow insert at length position (end)", () => {
    let n: Name = new Name(["a", "b"]);
    n.insert(2, "c");
    expect(n.getNoComponents()).toBe(3);
    expect(n.asString()).toBe("a.b.c");
  });

  it("should reject insert beyond length position", () => {
    let n: Name = new Name(["a", "b"]);
    expect(() => n.insert(3, "c")).toThrow("out of bounds");
  });

  it("should handle valid boundary indices", () => {
    let n: Name = new Name(["a", "b", "c"]);
    expect(n.getComponent(0)).toBe("a");
    expect(n.getComponent(2)).toBe("c");
    n.setComponent(0, "x");
    n.setComponent(2, "z");
    expect(n.asString()).toBe("x.b.z");
  });
});

// ============================================================
// asDataString CONVERSION TESTS
// ============================================================

describe("asDataString conversion tests", () => {
  it("should handle component with default delimiter and custom delimiter", () => {
    let n: Name = new Name(["a.b\\#c"], "#");
    expect(n.asString()).toBe("a.b#c");
    expect(n.asDataString()).toBe("a\\.b#c");
  });

  it("should handle complex escaping scenario", () => {
    let n: Name = new Name(["a\\.b\\#c"], "#");
    expect(n.asString()).toBe("a.b#c");
    expect(n.asDataString()).toBe("a\\.b#c");
  });

  it("should handle multiple components with mixed escaping", () => {
    let n: Name = new Name(["a\\#b", "c.d", "e\\\\f"], "#");
    expect(n.asDataString()).toBe("a#b.c\\.d.e\\\\f");
  });
});

// ============================================================
// INTEGRATION AND COMPLEX SCENARIOS
// ============================================================

describe("Integration tests for full workflow", () => {
  it("should handle delimiter change correctly", () => {
    let n: Name = new Name(["a\\.b", "c"], ".");
    expect(n.asString("#")).toBe("a.b#c");
    expect(n.asDataString()).toBe("a\\.b.c");
  });

  it("should handle complex modification sequence", () => {
    let n: Name = new Name(["a"]);
    n.append("b");
    n.insert(1, "x");
    n.setComponent(2, "c");
    n.remove(1);
    expect(n.asString()).toBe("a.c");
  });
});

// ============================================================
// REAL-WORLD SCENARIOS
// ============================================================

describe("Real-world name examples", () => {
  it("should handle domain name with escaped dot", () => {
    let n: Name = new Name(["my\\.file", "example", "com"]);
    expect(n.asString()).toBe("my.file.example.com");
    expect(n.getNoComponents()).toBe(3);
  });

  it("should handle file path with different delimiter", () => {
    let n: Name = new Name(["home", "user", "my\\/file", "document"], "/");
    expect(n.asString()).toBe("home/user/my/file/document");
    expect(n.getNoComponents()).toBe(4);
  });
});

// ============================================================
// EDGE CASES
// ============================================================

describe("Edge cases", () => {
  it("should handle very long component names", () => {
    let longComponent = "a".repeat(1000);
    let n: Name = new Name([longComponent]);
    expect(n.getComponent(0)).toBe(longComponent);
  });

  it("should handle many components", () => {
    let components = Array(100).fill("component");
    let n: Name = new Name(components);
    expect(n.getNoComponents()).toBe(100);
  });

  it("should handle component with only delimiters", () => {
    let n: Name = new Name(["\\.\\.\\."], ".");
    expect(n.asString()).toBe("...");
    expect(n.getNoComponents()).toBe(1);
  });

  it("should handle special characters as components", () => {
    let n: Name = new Name(["@", "\\#", "\\$", "\\%"], ".");
    expect(n.asString()).toBe("@.#.$.%");
  });

  it("should handle unicode characters", () => {
    let n: Name = new Name(["hello", "世界", "🌍"]);
    expect(n.asString()).toBe("hello.世界.🌍");
    expect(n.getNoComponents()).toBe(3);
  });

  it("should handle whitespace in components", () => {
    let n: Name = new Name(["hello world", "foo bar"]);
    expect(n.asString()).toBe("hello world.foo bar");
  });

  it("should handle tabs and newlines", () => {
    let n: Name = new Name(["line1\nline2", "tab\there"]);
    expect(n.getNoComponents()).toBe(2);
  });
});
