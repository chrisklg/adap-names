import { describe, it, expect } from "vitest";

import { Name } from "../../../src/adap-b06/names/Name";
import { StringName } from "../../../src/adap-b06/names/StringName";
import { StringArrayName } from "../../../src/adap-b06/names/StringArrayName";
import { ESCAPE_CHARACTER } from "../../../src/adap-b06/common/Printable";

describe("Value Type Immutability Tests", () => {
  it("setComponent returns new instance (StringName)", () => {
    const n1: Name = new StringName("oss.cs.fau.de");
    const n2: Name = n1.setComponent(0, "www");

    // Original should be unchanged
    expect(n1.getComponent(0)).toBe("oss");
    // New instance should have the change
    expect(n2.getComponent(0)).toBe("www");
    // They should be different instances
    expect(n1).not.toBe(n2);
  });

  it("setComponent returns new instance (StringArrayName)", () => {
    const n1: Name = new StringArrayName(["oss", "cs", "fau", "de"]);
    const n2: Name = n1.setComponent(0, "www");

    // Original should be unchanged
    expect(n1.getComponent(0)).toBe("oss");
    // New instance should have the change
    expect(n2.getComponent(0)).toBe("www");
    // They should be different instances
    expect(n1).not.toBe(n2);
  });

  it("append returns new instance", () => {
    const n1: Name = new StringName("oss.cs.fau");
    const n2: Name = n1.append("de");

    expect(n1.getNoComponents()).toBe(3);
    expect(n2.getNoComponents()).toBe(4);
    expect(n2.getComponent(3)).toBe("de");
    expect(n1).not.toBe(n2);
  });

  it("insert returns new instance", () => {
    const n1: Name = new StringName("oss.fau.de");
    const n2: Name = n1.insert(1, "cs");

    expect(n1.getNoComponents()).toBe(3);
    expect(n1.getComponent(1)).toBe("fau");
    expect(n2.getNoComponents()).toBe(4);
    expect(n2.getComponent(1)).toBe("cs");
    expect(n1).not.toBe(n2);
  });

  it("remove returns new instance", () => {
    const n1: Name = new StringName("oss.cs.fau.de");
    const n2: Name = n1.remove(1);

    expect(n1.getNoComponents()).toBe(4);
    expect(n2.getNoComponents()).toBe(3);
    expect(n2.getComponent(1)).toBe("fau");
    expect(n1).not.toBe(n2);
  });

  it("concat returns new instance", () => {
    const n1: Name = new StringName("oss.cs");
    const n2: Name = new StringName("fau.de");
    const n3: Name = n1.concat(n2);

    expect(n1.getNoComponents()).toBe(2);
    expect(n2.getNoComponents()).toBe(2);
    expect(n3.getNoComponents()).toBe(4);
    expect(n3.asDataString()).toBe("oss.cs.fau.de");
    expect(n1).not.toBe(n3);
  });

  it("chaining operations creates new instances", () => {
    const n1: Name = new StringName("a.b.c");
    const n2: Name = n1.setComponent(0, "x");
    const n3: Name = n2.append("d");
    const n4: Name = n3.remove(1);

    expect(n1.asDataString()).toBe("a.b.c");
    expect(n2.asDataString()).toBe("x.b.c");
    expect(n3.asDataString()).toBe("x.b.c.d");
    expect(n4.asDataString()).toBe("x.c.d");
  });
});

describe("Equality Contract Tests", () => {
  it("equal names have same hash code (StringName)", () => {
    const n1: Name = new StringName("oss.cs.fau.de");
    const n2: Name = new StringName("oss.cs.fau.de");

    expect(n1.isEqual(n2)).toBe(true);
    expect(n1.getHashCode()).toBe(n2.getHashCode());
  });

  it("equal names have same hash code (StringArrayName)", () => {
    const n1: Name = new StringArrayName(["oss", "cs", "fau", "de"]);
    const n2: Name = new StringArrayName(["oss", "cs", "fau", "de"]);

    expect(n1.isEqual(n2)).toBe(true);
    expect(n1.getHashCode()).toBe(n2.getHashCode());
  });

  it("StringName and StringArrayName with same components are equal", () => {
    const n1: Name = new StringName("oss.cs.fau.de");
    const n2: Name = new StringArrayName(["oss", "cs", "fau", "de"]);

    expect(n1.isEqual(n2)).toBe(true);
    expect(n1.getHashCode()).toBe(n2.getHashCode());
  });

  it("different names have different hash codes", () => {
    const n1: Name = new StringName("oss.cs.fau.de");
    const n2: Name = new StringName("www.cs.fau.de");

    expect(n1.isEqual(n2)).toBe(false);
    expect(n1.getHashCode()).not.toBe(n2.getHashCode());
  });

  it("cloned names are equal", () => {
    const n1: Name = new StringName("oss.cs.fau.de");
    const n2: Name = n1.clone();

    expect(n1.isEqual(n2)).toBe(true);
    expect(n1.getHashCode()).toBe(n2.getHashCode());
    expect(n1).not.toBe(n2); // Different instances
  });

  it("modified copy is not equal to original", () => {
    const n1: Name = new StringName("oss.cs.fau.de");
    const n2: Name = n1.setComponent(0, "www");

    expect(n1.isEqual(n2)).toBe(false);
    expect(n1.getHashCode()).not.toBe(n2.getHashCode());
  });
});

describe("Basic Name Functionality", () => {
  it("getName returns properly masked string", () => {
    const n: Name = new StringName("oss.cs.fau.de");
    expect(n.asDataString()).toBe("oss.cs.fau.de");
    expect(n.getNoComponents()).toBe(4);
  });

  it("test escaped delimiter", () => {
    const delimiter = ".";
    const escapedDelimiter = ESCAPE_CHARACTER + delimiter;
    const n: Name = new StringName("oss" + escapedDelimiter + "cs.fau.de");

    expect(n.getNoComponents()).toBe(3);
    expect(n.getComponent(0)).toBe("oss" + escapedDelimiter + "cs");
  });

  it("test masked components work with immutable operations", () => {
    const maskedComponent = "a" + ESCAPE_CHARACTER + ".b";
    const n1: Name = new StringName("x");
    const n2: Name = n1.setComponent(0, maskedComponent);

    expect(n2.getComponent(0)).toBe(maskedComponent);
    expect(n2.getNoComponents()).toBe(1);
  });
});

describe("Cross-implementation Tests", () => {
  it("operations on StringName produce correct results", () => {
    let n: Name = new StringName("a.b.c");
    n = n.append("d");
    n = n.insert(0, "start");
    n = n.remove(2); // removes "b"

    expect(n.asDataString()).toBe("start.a.c.d");
  });

  it("operations on StringArrayName produce correct results", () => {
    let n: Name = new StringArrayName(["a", "b", "c"]);
    n = n.append("d");
    n = n.insert(0, "start");
    n = n.remove(2); // removes "b"

    expect(n.asDataString()).toBe("start.a.c.d");
  });

  it("concat works between different implementations", () => {
    const n1: Name = new StringName("a.b");
    const n2: Name = new StringArrayName(["c", "d"]);
    const n3: Name = n1.concat(n2);

    expect(n3.asDataString()).toBe("a.b.c.d");
  });
});

describe("Delimiter Tests", () => {
  it("custom delimiter works with immutable operations", () => {
    const n1: Name = new StringName("a#b#c", "#");
    const n2: Name = n1.append("d");

    expect(n2.getNoComponents()).toBe(4);
    expect(n2.getDelimiterCharacter()).toBe("#");
    expect(n2.asDataString()).toBe("a.b.c.d"); // normalized to default delimiter
  });

  it("asString with custom delimiter", () => {
    const n: Name = new StringName("oss.cs.fau.de");
    expect(n.asString("/")).toBe("oss/cs/fau/de");
  });
});
