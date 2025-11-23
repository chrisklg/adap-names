import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";

export abstract class AbstractName implements Name {
    protected delimiter: string = DEFAULT_DELIMITER;

    public toString(): string {
        return this.asDataString();
    }

    public asDataString(): string {
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

        // Re-mask components for default delimiter
        const remaskedComponents: string[] = [];
        for (let i = 0; i < this.getNoComponents(); i++) {
            const component = this.doGetComponent(i);
            const unmasked = this.doUnmask(component);
            const remasked = this.doMask(unmasked, DEFAULT_DELIMITER);
            remaskedComponents.push(remasked);
        }
        return remaskedComponents.join(DEFAULT_DELIMITER);
    }

    public asString(delimiter: string = this.delimiter): string {
        const unmaskedComponents: string[] = [];
        for (let i = 0; i < this.getNoComponents(); i++) {
            const component = this.doGetComponent(i);
            unmaskedComponents.push(this.doUnmask(component));
        }
        return unmaskedComponents.join(delimiter);
    }

    public isEqual(other: Name): boolean {
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
        return this.getNoComponents() === 0;
    }

    public getDelimiterCharacter(): string {
        return this.delimiter;
    }

    public getNoComponents(): number {
        return this.doGetNoComponents();
    }

    public getComponent(i: number): string {
        this.assertIsValidIndex(i);
        return this.doGetComponent(i);
    }

    public setComponent(i: number, c: string): void {
        this.assertIsValidIndex(i);
        this.assertIsNotNullOrUndefined(c);
        this.assertComponentProperlyMasked(c);
        this.doSetComponent(i, c);
    }

    public insert(i: number, c: string): void {
        this.assertIsValidIndex(i, true);
        this.assertIsNotNullOrUndefined(c);
        this.assertComponentProperlyMasked(c);
        this.doInsert(i, c);
    }

    public append(c: string): void {
        this.assertIsNotNullOrUndefined(c);
        this.assertComponentProperlyMasked(c);
        this.doAppend(c);
    }

    public remove(i: number): void {
        this.assertIsValidIndex(i);
        this.doRemove(i);
    }

    public concat(other: Name): void {
        this.assertIsNotNullOrUndefined(other);
        if (other.isEmpty()) {
            return;
        }
        for (let i = 0; i < other.getNoComponents(); i++) {
            this.doAppend(other.getComponent(i));
        }
    }

    public abstract clone(): Name;

    protected abstract doGetNoComponents(): number;
    protected abstract doGetComponent(i: number): string;
    protected abstract doSetComponent(i: number, c: string): void;
    protected abstract doInsert(i: number, c: string): void;
    protected abstract doAppend(c: string): void;
    protected abstract doRemove(i: number): void;

    // ========== Validation Methods ==========

    protected assertIsNotNullOrUndefined(other: Object): void {
        if (other == null || other == undefined) {
            throw new Error("Value is null or undefined");
        }
    }

    protected assertValidDelimiter(delimiter: string): void {
        if (delimiter.length !== 1) {
            throw new Error("Delimiter must be exactly one character");
        }
        if (delimiter === ESCAPE_CHARACTER) {
            throw new Error("Delimiter cannot be the escape character");
        }
    }

    protected assertComponentProperlyMasked(component: string): void {
        let i = 0;
        while (i < component.length) {
            if (component[i] === ESCAPE_CHARACTER) {
                if (i + 1 >= component.length) {
                    throw new Error(
                        "Invalid escape sequence: escape character at end of component"
                    );
                }
                i += 2;
            } else if (component[i] === this.delimiter) {
                throw new Error(
                    `Component contains unescaped delimiter '${this.delimiter}': ${component}`
                );
            } else {
                i++;
            }
        }
    }

    protected assertIsValidIndex(i: number, allowEnd: boolean = false): void {
        const count = this.getNoComponents();
        if (count === 0 && !allowEnd) {
            throw new Error(`Index ${i} out of bounds: collection is empty`);
        }
        const max = allowEnd
            ? count
            : count - 1;
        if (i < 0 || i > max) {
            throw new Error(`Index ${i} out of bounds [0, ${max}]`);
        }
    }

    protected assertComponentsProperlyMasked(): void {
        for (let i = 0; i < this.getNoComponents(); i++) {
            try {
                this.assertComponentProperlyMasked(this.doGetComponent(i));
            } catch (error) {
                throw new Error(
                    `Component at index ${i} is not properly masked: ${this.doGetComponent(i)}`
                );
            }
        }
    }

    // ========== Masking Helper Methods ==========

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

    protected doMask(component: string, delimiter: string = this.delimiter): string {
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
