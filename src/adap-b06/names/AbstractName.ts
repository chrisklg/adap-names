import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { MethodFailedException } from "../common/MethodFailedException";
import { InvalidStateException } from "../common/InvalidStateException";

export abstract class AbstractName implements Name {
    protected readonly delimiter: string = DEFAULT_DELIMITER;

    /**
     * Constructor
     *
     * CONTRACT: Preconditions only (no previous state to check)
     * - Delimiter must be exactly one character
     * - Delimiter cannot be the escape character
     */
    constructor(delimiter: string = DEFAULT_DELIMITER) {
        // PRECONDITION: Validate delimiter parameter
        this.assertValidDelimiter(delimiter);
        this.delimiter = delimiter;
    }

    /**
     * CONTRACT:
     * - Postcondition: Cloned object must be equal to original
     * - Class Invariant: Both objects maintain valid state
     */
    public clone(): Name {
        // Perform the actual cloning
        const cloned = this.doClone();

        // POSTCONDITION: Cloned object must equal the original
        this.assertClassInvariants();
        MethodFailedException.assert(
            cloned.isEqual(this),
            "cloned object must be equal to original"
        );

        return cloned;
    }

    protected abstract doClone(): Name;

    /**
     * CONTRACT:
     * Precondition: Delimiter must be valid (one character, not escape char)
     */
    public asString(delimiter: string = this.delimiter): string {
        // CLASS INVARIANT: Ensure object is in valid state
        this.assertClassInvariants();

        // PRECONDITION: Validate delimiter parameter
        this.assertValidDelimiter(delimiter);

        // Unmask all components and join with delimiter
        const unmaskedComponents: string[] = [];
        for (let i = 0; i < this.getNoComponents(); i++) {
            const component = this.doGetComponent(i);
            unmaskedComponents.push(this.doUnmask(component));
        }
        return unmaskedComponents.join(delimiter);
    }

    public toString(): string {
        return this.asDataString();
    }

    public asDataString(): string {
        // CLASS INVARIANT: Ensure object is in valid state
        this.assertClassInvariants();

        if (this.delimiter === DEFAULT_DELIMITER) {
            let result = "";
            const noComponents = this.getNoComponents();
            for (let i = 0; i < noComponents; i++) {
                if (i > 0) {
                    result += this.delimiter;
                }
                result += this.doGetComponent(i);
            }
            return result;
        }

        // re-mask components for default delimiter
        const remaskedComponents: string[] = [];
        for (let i = 0; i < this.getNoComponents(); i++) {
            const component = this.doGetComponent(i);
            const unmasked = this.doUnmask(component);
            const remasked = this.doMask(unmasked, DEFAULT_DELIMITER);
            remaskedComponents.push(remasked);
        }
        return remaskedComponents.join(DEFAULT_DELIMITER);
    }

    /**
     * CONTRACT:
     * - Precondition: Other name must not be null or undefined
     */
    public isEqual(other: Name): boolean {
        // CLASS INVARIANT: Ensure this object is in valid state
        this.assertClassInvariants();

        // PRECONDITION: Other name must not be null or undefined
        IllegalArgumentException.assert(
            other != null && other != undefined,
            "other name must not be null or undefined"
        );

        // Check equality
        if (this.getNoComponents() !== other.getNoComponents()) {
            return false;
        }
        if (this.delimiter !== other.getDelimiterCharacter()) {
            return false;
        }
        for (let i = 0; i < this.getNoComponents(); i++) {
            if (this.doGetComponent(i) !== other.getComponent(i)) {
                return false;
            }
        }
        return true;
    }

    public getHashCode(): number {
        // CLASS INVARIANT
        this.assertClassInvariants();

        let hashCode: number = 0;
        const s: string = this.asDataString();
        for (let i: number = 0; i < s.length; i++) {
            let c: number = s.charCodeAt(i);
            hashCode = (hashCode << 5) - hashCode + c;
            hashCode |= 0;
        }
        return hashCode;
    }

    public isEmpty(): boolean {
        // CLASS INVARIANT
        this.assertClassInvariants();
        return this.getNoComponents() === 0;
    }

    public getDelimiterCharacter(): string {
        this.assertClassInvariants();
        return this.delimiter;
    }

    public abstract getNoComponents(): number;

    /**
     * CONTRACT:
     * Precondition: Index must be valid (>= 0 and < component count)
     */
    public getComponent(i: number): string {
        // CLASS INVARIANT
        this.assertClassInvariants();

        // PRECONDITION
        this.assertIsValidIndex(i);

        const component = this.doGetComponent(i);

        this.assertClassInvariants();
        return component;
    }

    protected abstract doGetComponent(i: number): string;

    /**
     * VALUE TYPE
     * CONTRACT:
     * - Preconditions:
     *   1. Index must be valid (>= 0 and < component count)
     *   2. Component must not be null or undefined
     *   3. Component must be properly masked (no unescaped delimiters)
     * - Postcondition: Returned Name has component at index i equal to c
     * - Postcondition: This object is unchanged (immutable)
     */
    public setComponent(i: number, c: string): Name {
        this.assertClassInvariants();

        // PRECONDITIONS
        this.assertIsValidIndex(i);
        this.assertIsNotNullOrUndefined(c);
        this.assertComponentProperlyMasked(c);

        const newName = this.doSetComponent(i, c);

        // CLASS INVARIANT on new object
        this.assertClassInvariants();

        // POSTCONDITION
        MethodFailedException.assert(
            newName.getComponent(i) === c,
            "component was not set correctly in new instance"
        );
        MethodFailedException.assert(
            newName.getNoComponents() === this.getNoComponents(),
            "component count should not change"
        );

        return newName;
    }

    protected abstract doSetComponent(i: number, c: string): Name;

    /**
     * VALUE TYPE
     * CONTRACT:
     * - Preconditions:
     *   1. Index must be valid (>= 0 and <= component count) - note: can insert at end
     *   2. Component must not be null or undefined
     *   3. Component must be properly masked
     * - Postconditions:
     *   1. Returned Name has component count increased by exactly 1
     *   2. Returned Name has component at index i equal to c
     *   3. This object is unchanged (immutable)
     */
    public insert(i: number, c: string): Name {
        // CLASS INVARIANT
        this.assertClassInvariants();

        const oldSize = this.getNoComponents();

        // PRECONDITIONS
        this.assertIsValidIndex(i, true);
        this.assertIsNotNullOrUndefined(c);
        this.assertComponentProperlyMasked(c);

        const newName = this.doInsert(i, c);

        this.assertClassInvariants();

        // POSTCONDITIONS
        MethodFailedException.assert(
            newName.getNoComponents() === oldSize + 1,
            "component count must increase by 1"
        );
        MethodFailedException.assert(
            newName.getComponent(i) === c,
            "component was not inserted correctly"
        );

        return newName;
    }

    protected abstract doInsert(i: number, c: string): Name;

    /**
     * VALUE TYPE
     * CONTRACT:
     * - Preconditions:
     *   1. Component must not be null or undefined
     *   2. Component must be properly masked
     * - Postconditions:
     *   1. Returned Name has component count increased by exactly 1
     *   2. New component is at the end (at old size index)
     *   3. This object is unchanged (immutable)
     */
    public append(c: string): Name {
        this.assertClassInvariants();

        const oldSize = this.getNoComponents();

        // PRECONDITIONS
        this.assertIsNotNullOrUndefined(c);
        this.assertComponentProperlyMasked(c);

        const newName = this.doAppend(c);

        // CLASS INVARIANT
        this.assertClassInvariants();

        // POSTCONDITIONS
        MethodFailedException.assert(
            newName.getNoComponents() === oldSize + 1,
            "component count must increase by 1"
        );
        MethodFailedException.assert(
            newName.getComponent(oldSize) === c,
            "component was not appended correctly"
        );

        return newName;
    }

    protected abstract doAppend(c: string): Name;

    /**
     * VALUE TYPE
     * CONTRACT:
     * - Precondition: Index must be valid (>= 0 and < component count)
     * - Postcondition: Returned Name has component count decreased by exactly 1
     * - Postcondition: This object is unchanged (immutable)
     */
    public remove(i: number): Name {
        // CLASS INVARIANT
        this.assertClassInvariants();

        const oldSize = this.getNoComponents();

        // PRECONDITION
        this.assertIsValidIndex(i);

        const newName = this.doRemove(i);

        // CLASS INVARIANT
        this.assertClassInvariants();

        // POSTCONDITION
        MethodFailedException.assert(
            newName.getNoComponents() === oldSize - 1,
            "component count must decrease by 1"
        );

        return newName;
    }

    protected abstract doRemove(i: number): Name;

    /**
     * VALUE TYPE
     * CONTRACT:
     * - Precondition: Other name must not be null or undefined
     * - Postcondition: Returned Name has component count equal to this + other's count
     * - Postcondition: This object is unchanged (immutable)
     */
    public concat(other: Name): Name {
        // CLASS INVARIANT
        this.assertClassInvariants();

        const oldSize = this.getNoComponents();

        // PRECONDITION
        this.assertIsNotNullOrUndefined(other);

        if (other.isEmpty()) {
            return this.clone();
        }

        let newName: Name = this.clone();
        for (let i = 0; i < other.getNoComponents(); i++) {
            newName = newName.append(other.getComponent(i));
        }

        // CLASS INVARIANT
        this.assertClassInvariants();

        // POSTCONDITION
        MethodFailedException.assert(
            newName.getNoComponents() === oldSize + other.getNoComponents(),
            "component count must increase by other's component count"
        );

        return newName;
    }

    // ========================================================================
    // PRECONDITION ASSERTION METHODS
    // ========================================================================

    protected assertIsNotNullOrUndefined(other: Object): void {
        IllegalArgumentException.assert(
            other != null && other != undefined,
            "value must not be null or undefined"
        );
    }

    protected assertValidDelimiter(delimiter: string): void {
        IllegalArgumentException.assert(
            delimiter != null && delimiter != undefined,
            "delimiter must not be null or undefined"
        );
        IllegalArgumentException.assert(
            delimiter.length === 1,
            "delimiter must be exactly one character"
        );
        IllegalArgumentException.assert(
            delimiter !== ESCAPE_CHARACTER,
            "delimiter cannot be the escape character"
        );
    }

    protected assertComponentProperlyMasked(component: string): void {
        let i = 0;
        while (i < component.length) {
            if (component[i] === ESCAPE_CHARACTER) {
                IllegalArgumentException.assert(
                    i + 1 < component.length,
                    "invalid escape sequence: escape character at end of component"
                );
                i += 2;
            } else if (component[i] === this.delimiter) {
                throw new IllegalArgumentException(
                    `component contains unescaped delimiter '${this.delimiter}': ${component}`
                );
            } else {
                i++;
            }
        }
    }

    /**
     * @param i - The index to check
     * @param allowEnd - If true, allows i == component count (for insert operations)
     */
    protected assertIsValidIndex(i: number, allowEnd: boolean = false): void {
        const count = this.getNoComponents();
        if (count === 0 && !allowEnd) {
            throw new IllegalArgumentException(
                `index ${i} out of bounds: collection is empty`
            );
        }
        const max = allowEnd ? count : count - 1;
        IllegalArgumentException.assert(
            i >= 0 && i <= max,
            `index ${i} out of bounds [0, ${max}]`
        );
    }

    // ========================================================================
    // CLASS INVARIANT ASSERTION METHODS
    // ========================================================================

    protected assertClassInvariants(): void {
        // INVARIANT 1 & 2: Delimiter must be valid
        InvalidStateException.assert(
            this.delimiter != null && this.delimiter != undefined,
            "delimiter must not be null or undefined"
        );
        InvalidStateException.assert(
            this.delimiter.length === 1,
            "delimiter must be exactly one character"
        );
        InvalidStateException.assert(
            this.delimiter !== ESCAPE_CHARACTER,
            "delimiter cannot be the escape character"
        );

        // INVARIANT 3: Component count must be non-negative
        const noComponents = this.getNoComponents();
        InvalidStateException.assert(
            noComponents >= 0,
            "number of components must be non-negative"
        );

        // INVARIANT 4: All components must be properly masked
        for (let i = 0; i < noComponents; i++) {
            this.assertComponentProperlyMaskedAsInvariant(
                this.doGetComponent(i)
            );
        }
    }

    protected assertComponentProperlyMaskedAsInvariant(
        component: string
    ): void {
        let i = 0;
        while (i < component.length) {
            if (component[i] === ESCAPE_CHARACTER) {
                InvalidStateException.assert(
                    i + 1 < component.length,
                    "invalid escape sequence: escape character at end of component"
                );
                i += 2;
            } else if (component[i] === this.delimiter) {
                throw new InvalidStateException(
                    `component contains unescaped delimiter '${this.delimiter}': ${component}`
                );
            } else {
                i++;
            }
        }
    }

    // ========================================================================
    // MASKING HELPER METHODS
    // ========================================================================

    protected doUnmask(component: string): string {
        let result = "";
        let i = 0;

        while (i < component.length) {
            if (component[i] === ESCAPE_CHARACTER && i + 1 < component.length) {
                // Escape sequence - add only the escaped character
                result += component[i + 1];
                i += 2;
            } else {
                result += component[i];
                i++;
            }
        }

        return result;
    }

    protected doMask(
        component: string,
        delimiter: string = this.delimiter
    ): string {
        let result = "";

        for (let i = 0; i < component.length; i++) {
            const char = component[i];
            // Escape the delimiter or the escape character itself
            if (char === delimiter || char === ESCAPE_CHARACTER) {
                result += ESCAPE_CHARACTER + char;
            } else {
                result += char;
            }
        }

        return result;
    }
}
