import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import { AbstractName } from "./AbstractName";

export class StringName extends AbstractName {
    protected name: string = "";
    protected noComponents: number = 0;

    constructor(source: string, delimiter?: string) {
        super();
        this.initialize(source, delimiter);
    }

    public initialize(source: string, delimiter?: string): void {
        this.name = source;
        if (delimiter !== undefined) {
            this.assertValidDelimiter(delimiter);
            this.delimiter = delimiter;
        }
        this.noComponents = this.parseComponents().length;
        if (this.getNoComponents() === 0) {
            throw new Error("Components not initialized");
        }
        this.assertComponentsProperlyMasked();
    }

    public clone(): Name {
        return new StringName(this.name, this.delimiter);
    }

    protected doGetNoComponents(): number {
        return this.noComponents;
    }

    protected doGetComponent(i: number): string {
        const components = this.parseComponents();
        return components[i];
    }

    protected doSetComponent(i: number, c: string): void {
        const components = this.parseComponents();
        components[i] = c;
        this.name = components.join(this.delimiter);
    }

    protected doInsert(i: number, c: string): void {
        const components = this.parseComponents();
        components.splice(i, 0, c);
        this.name = components.join(this.delimiter);
        this.noComponents = components.length;
    }

    protected doAppend(c: string): void {
        if (this.noComponents === 0) {
            this.name = c;
        } else {
            this.name += this.delimiter + c;
        }
        this.noComponents++;
    }

    protected doRemove(i: number): void {
        const components = this.parseComponents();
        components.splice(i, 1);
        this.name = components.join(this.delimiter);
        this.noComponents = components.length;
    }

    protected parseComponents(): string[] {
        if (this.name.length === 0) {
            return [];
        }

        const components: string[] = [];
        let currentComponent = "";
        let i = 0;

        while (i < this.name.length) {
            if (this.name[i] === ESCAPE_CHARACTER && i + 1 < this.name.length) {
                // Escape sequence - add both escape char and next char to component
                currentComponent += this.name[i] + this.name[i + 1];
                i += 2;
            } else if (this.name[i] === this.delimiter) {
                // Unescaped delimiter - end current component
                components.push(currentComponent);
                currentComponent = "";
                i++;
            } else {
                // Regular character
                currentComponent += this.name[i];
                i++;
            }
        }

        // Add the last component
        components.push(currentComponent);
        return components;
    }
}
