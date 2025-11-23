import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import { AbstractName } from "./AbstractName";

export class StringArrayName extends AbstractName {

    protected components: string[] = [];

    constructor(source: string[], delimiter?: string) {
        super();
        this.initialize(source, delimiter);
    }

    public initialize(source: string[], delimiter?: string): void {
        if (delimiter !== undefined) {
            this.assertValidDelimiter(delimiter);
            this.delimiter = delimiter;
        }
        this.components = [...source];
        if (this.getNoComponents() === 0) {
            throw new Error("Components not initialized");
        }
        this.assertComponentsProperlyMasked();
    }

    public clone(): Name {
        return new StringArrayName(this.components, this.delimiter);
    }

    protected doGetNoComponents(): number {
        return this.components.length;
    }

    protected doGetComponent(i: number): string {
        return this.components[i];
    }

    protected doSetComponent(i: number, c: string): void {
        this.components[i] = c;
    }

    protected doInsert(i: number, c: string): void {
        this.components.splice(i, 0, c);
    }

    protected doAppend(c: string): void {
        this.components.push(c);
    }

    protected doRemove(i: number): void {
        this.components.splice(i, 1);
    }

}