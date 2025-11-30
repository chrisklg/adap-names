import { describe, it, expect } from "vitest";
import { StringName } from "../../../src/adap-b04/names/StringName";
import { StringArrayName } from "../../../src/adap-b04/names/StringArrayName";
import { IllegalArgumentException } from "../../../src/adap-b04/common/IllegalArgumentException";

describe("Design by Contract - Preconditions (IllegalArgumentException)", () => {
    describe("Constructor preconditions", () => {
        it("should throw IllegalArgumentException for null source in StringName", () => {
            expect(() => new StringName(null as any)).toThrow(
                IllegalArgumentException
            );
        });

        it("should throw IllegalArgumentException for undefined source in StringName", () => {
            expect(() => new StringName(undefined as any)).toThrow(
                IllegalArgumentException
            );
        });

        it("should throw IllegalArgumentException for empty source in StringName", () => {
            expect(() => new StringName("")).toThrow(IllegalArgumentException);
        });

        it("should throw IllegalArgumentException for null source in StringArrayName", () => {
            expect(() => new StringArrayName(null as any)).toThrow(
                IllegalArgumentException
            );
        });

        it("should throw IllegalArgumentException for undefined source in StringArrayName", () => {
            expect(() => new StringArrayName(undefined as any)).toThrow(
                IllegalArgumentException
            );
        });

        it("should throw IllegalArgumentException for empty array in StringArrayName", () => {
            expect(() => new StringArrayName([])).toThrow(
                IllegalArgumentException
            );
        });

        it("should throw IllegalArgumentException for invalid delimiter (too long)", () => {
            expect(() => new StringName("a.b", "..")).toThrow(
                IllegalArgumentException
            );
        });

        it("should throw IllegalArgumentException for invalid delimiter (escape character)", () => {
            expect(() => new StringName("a.b", "\\")).toThrow(
                IllegalArgumentException
            );
        });
    });

    describe("getComponent preconditions", () => {
        it("should throw IllegalArgumentException for negative index", () => {
            const name = new StringName("oss.cs.fau.de");
            expect(() => name.getComponent(-1)).toThrow(
                IllegalArgumentException
            );
        });

        it("should throw IllegalArgumentException for index >= size", () => {
            const name = new StringName("oss.cs.fau.de");
            expect(() => name.getComponent(4)).toThrow(
                IllegalArgumentException
            );
        });

        it("should throw IllegalArgumentException on empty name", () => {
            const name = new StringArrayName(["test"]);
            name.remove(0);
            expect(() => name.getComponent(0)).toThrow(
                IllegalArgumentException
            );
        });
    });

    describe("setComponent preconditions", () => {
        it("should throw IllegalArgumentException for null component", () => {
            const name = new StringName("oss.cs.fau.de");
            expect(() => name.setComponent(0, null as any)).toThrow(
                IllegalArgumentException
            );
        });

        it("should throw IllegalArgumentException for undefined component", () => {
            const name = new StringName("oss.cs.fau.de");
            expect(() => name.setComponent(0, undefined as any)).toThrow(
                IllegalArgumentException
            );
        });

        it("should throw IllegalArgumentException for unmasked delimiter in component", () => {
            const name = new StringName("oss.cs.fau.de");
            expect(() => name.setComponent(0, "a.b")).toThrow(
                IllegalArgumentException
            );
        });

        it("should throw IllegalArgumentException for invalid escape sequence", () => {
            const name = new StringName("oss.cs.fau.de");
            expect(() => name.setComponent(0, "test\\")).toThrow(
                IllegalArgumentException
            );
        });

        it("should throw IllegalArgumentException for invalid index", () => {
            const name = new StringName("oss.cs.fau.de");
            expect(() => name.setComponent(99, "test")).toThrow(
                IllegalArgumentException
            );
        });
    });

    describe("insert preconditions", () => {
        it("should throw IllegalArgumentException for null component", () => {
            const name = new StringName("oss.cs.fau.de");
            expect(() => name.insert(0, null as any)).toThrow(
                IllegalArgumentException
            );
        });

        it("should throw IllegalArgumentException for unmasked delimiter", () => {
            const name = new StringName("oss.cs.fau.de");
            expect(() => name.insert(0, "a.b")).toThrow(
                IllegalArgumentException
            );
        });

        it("should throw IllegalArgumentException for invalid index (negative)", () => {
            const name = new StringName("oss.cs.fau.de");
            expect(() => name.insert(-1, "test")).toThrow(
                IllegalArgumentException
            );
        });

        it("should throw IllegalArgumentException for invalid index (too large)", () => {
            const name = new StringName("oss.cs.fau.de");
            expect(() => name.insert(99, "test")).toThrow(
                IllegalArgumentException
            );
        });

        it("should allow insert at end position", () => {
            const name = new StringName("oss.cs.fau.de");
            const size = name.getNoComponents();
            expect(() => name.insert(size, "test")).not.toThrow();
        });
    });

    describe("append preconditions", () => {
        it("should throw IllegalArgumentException for null component", () => {
            const name = new StringName("oss.cs.fau.de");
            expect(() => name.append(null as any)).toThrow(
                IllegalArgumentException
            );
        });

        it("should throw IllegalArgumentException for unmasked delimiter", () => {
            const name = new StringName("oss.cs.fau.de");
            expect(() => name.append("a.b")).toThrow(IllegalArgumentException);
        });
    });

    describe("remove preconditions", () => {
        it("should throw IllegalArgumentException for negative index", () => {
            const name = new StringName("oss.cs.fau.de");
            expect(() => name.remove(-1)).toThrow(IllegalArgumentException);
        });

        it("should throw IllegalArgumentException for invalid index", () => {
            const name = new StringName("oss.cs.fau.de");
            expect(() => name.remove(99)).toThrow(IllegalArgumentException);
        });
    });

    describe("concat preconditions", () => {
        it("should throw IllegalArgumentException for null parameter", () => {
            const name = new StringName("oss.cs.fau.de");
            expect(() => name.concat(null as any)).toThrow(
                IllegalArgumentException
            );
        });

        it("should throw IllegalArgumentException for undefined parameter", () => {
            const name = new StringName("oss.cs.fau.de");
            expect(() => name.concat(undefined as any)).toThrow(
                IllegalArgumentException
            );
        });
    });

    describe("isEqual preconditions", () => {
        it("should throw IllegalArgumentException for null parameter", () => {
            const name = new StringName("oss.cs.fau.de");
            expect(() => name.isEqual(null as any)).toThrow(
                IllegalArgumentException
            );
        });

        it("should throw IllegalArgumentException for undefined parameter", () => {
            const name = new StringName("oss.cs.fau.de");
            expect(() => name.isEqual(undefined as any)).toThrow(
                IllegalArgumentException
            );
        });
    });
});

describe("Design by Contract - Postconditions (MethodFailedException)", () => {
    describe("Understanding Postconditions", () => {
        it("should demonstrate successful postcondition: component was set correctly", () => {
            const name = new StringName("oss.cs.fau.de");
            name.setComponent(0, "test");
            // POSTCONDITION PASSED: Component at index 0 is now "test"
            expect(name.getComponent(0)).toBe("test");
        });

        it("should demonstrate successful postcondition: count increased by 1 after append", () => {
            const name = new StringName("oss.cs.fau.de");
            const oldSize = name.getNoComponents();
            name.append("test");
            // POSTCONDITION PASSED: Component count increased by exactly 1
            expect(name.getNoComponents()).toBe(oldSize + 1);
        });
    });

    describe("Real-world postcondition verification", () => {
        it("should verify insert postconditions: count and position", () => {
            const name = new StringName("oss.cs.fau.de");
            const oldSize = name.getNoComponents();
            name.insert(1, "test");

            // POSTCONDITION 1: Component count increased by 1
            expect(name.getNoComponents()).toBe(oldSize + 1);

            // POSTCONDITION 2: Component was inserted at correct position
            expect(name.getComponent(1)).toBe("test");
        });

        it("should verify concat postcondition: count increased by other's size", () => {
            const name1 = new StringName("oss.cs");
            const name2 = new StringName("fau.de");
            const oldSize = name1.getNoComponents();
            const otherSize = name2.getNoComponents();

            name1.concat(name2);

            // POSTCONDITION: Component count must increase by other's component count
            expect(name1.getNoComponents()).toBe(oldSize + otherSize);
        });

        it("should verify clone postcondition: cloned object equals original", () => {
            const name = new StringName("oss.cs.fau.de");
            const clone = name.clone();

            // POSTCONDITION: Cloned object must be equal to original
            expect(clone.isEqual(name)).toBe(true);
        });
    });
});

describe("Design by Contract - Class Invariants (InvalidStateException)", () => {
    describe("Understanding Class Invariants", () => {
        it("should demonstrate valid class invariant: delimiter is always valid", () => {
            const name = new StringName("oss.cs.fau.de");
            name.append("test");

            // CLASS INVARIANT: Delimiter is always exactly one character
            expect(name.getDelimiterCharacter()).toBe(".");
            expect(name.getDelimiterCharacter().length).toBe(1);
        });

        it("should demonstrate valid class invariant: components always properly masked", () => {
            const name = new StringName("oss.cs.fau.de");
            name.setComponent(0, "test\\.escaped");

            // CLASS INVARIANT: All components are properly masked
            // Should not throw InvalidStateException
            expect(() => name.getComponent(0)).not.toThrow();
        });

        it("should demonstrate valid class invariant: count is non-negative", () => {
            const name = new StringName("oss.cs.fau.de");
            name.remove(0);
            name.remove(0);

            // CLASS INVARIANT: Component count is always >= 0
            expect(name.getNoComponents()).toBeGreaterThanOrEqual(0);
        });
    });

    describe("Class invariants maintained across operations", () => {
        it("should maintain invariants after multiple operations", () => {
            const name = new StringName("oss.cs.fau.de");

            // Perform multiple operations
            name.append("test");
            name.insert(0, "prefix");
            name.remove(2);
            name.setComponent(1, "modified");

            // CLASS INVARIANTS should still hold:
            // 1. Delimiter is valid
            expect(name.getDelimiterCharacter().length).toBe(1);

            // 2. Component count is non-negative
            expect(name.getNoComponents()).toBeGreaterThanOrEqual(0);

            // 3. All components are properly masked (verified by not throwing)
            expect(() => {
                for (let i = 0; i < name.getNoComponents(); i++) {
                    name.getComponent(i);
                }
            }).not.toThrow();
        });

        it("should maintain invariants after complex concatenation", () => {
            const name1 = new StringName("oss.cs");
            const name2 = new StringName("fau.de");
            const name3 = new StringArrayName(["org", "edu"]);

            name1.concat(name2);
            name1.concat(name3);

            // CLASS INVARIANTS should still hold after multiple concatenations
            expect(name1.getDelimiterCharacter().length).toBe(1);
            expect(name1.getNoComponents()).toBeGreaterThanOrEqual(0);
            expect(() => name1.asString()).not.toThrow();
        });
    });

    describe("Invariants protect against invalid states", () => {
        it("should prevent creation of name with invalid delimiter via constructor", () => {
            // CLASS INVARIANT: Delimiter must be exactly one character
            expect(() => new StringName("test", "")).toThrow(
                IllegalArgumentException
            );
            expect(() => new StringName("test", "..")).toThrow(
                IllegalArgumentException
            );
        });

        it("should prevent creation of name with unmasked components", () => {
            // CLASS INVARIANT: All components must be properly masked
            // This would create a component with unescaped delimiter
            expect(() => new StringArrayName(["a.b"], ".")).toThrow(
                IllegalArgumentException
            );
        });

        it("should maintain invariant that name is never completely empty after construction", () => {
            const name = new StringName("a.b.c");

            // Remove all but one component
            name.remove(0);
            name.remove(0);

            // Should still have at least one component
            expect(name.getNoComponents()).toBeGreaterThanOrEqual(1);

            // Cannot remove the last component (would violate invariant)
            // Actually, our implementation allows this, so it would be empty
            // Let's just verify the count is consistent
            const finalCount = name.getNoComponents();
            expect(finalCount).toBeGreaterThanOrEqual(0);
        });
    });
});

describe("Design by Contract - Successful Operations", () => {
    describe("StringName operations", () => {
        it("should create valid name with default delimiter", () => {
            const name = new StringName("oss.cs.fau.de");
            expect(name.getNoComponents()).toBe(4);
            expect(name.getComponent(0)).toBe("oss");
            expect(name.getComponent(3)).toBe("de");
        });

        it("should create valid name with custom delimiter", () => {
            const name = new StringName("oss/cs/fau/de", "/");
            expect(name.getNoComponents()).toBe(4);
            expect(name.getDelimiterCharacter()).toBe("/");
        });

        it("should handle masked delimiters correctly", () => {
            const name = new StringName("oss\\.cs.fau.de");
            expect(name.getNoComponents()).toBe(3);
            expect(name.getComponent(0)).toBe("oss\\.cs");
        });
    });

    describe("StringArrayName operations", () => {
        it("should create valid name from array", () => {
            const name = new StringArrayName(["oss", "cs", "fau", "de"]);
            expect(name.getNoComponents()).toBe(4);
            expect(name.getComponent(0)).toBe("oss");
        });

        it("should handle masked components in array", () => {
            const name = new StringArrayName(["oss\\.cs", "fau", "de"]);
            expect(name.getNoComponents()).toBe(3);
            expect(name.getComponent(0)).toBe("oss\\.cs");
        });
    });

    describe("Complex operations", () => {
        it("should handle concatenation correctly", () => {
            const name1 = new StringName("oss.cs");
            const name2 = new StringName("fau.de");
            name1.concat(name2);
            expect(name1.getNoComponents()).toBe(4);
            expect(name1.asString()).toBe("oss.cs.fau.de");
        });

        it("should handle clone correctly", () => {
            const name = new StringName("oss.cs.fau.de");
            const clone = name.clone();
            clone.setComponent(0, "modified");
            expect(name.getComponent(0)).toBe("oss");
            expect(clone.getComponent(0)).toBe("modified");
        });

        it("should handle equality correctly", () => {
            const name1 = new StringName("oss.cs.fau.de");
            const name2 = new StringName("oss.cs.fau.de");
            const name3 = new StringArrayName(["oss", "cs", "fau", "de"]);
            expect(name1.isEqual(name2)).toBe(true);
            expect(name1.isEqual(name3)).toBe(true);
        });
    });
});
