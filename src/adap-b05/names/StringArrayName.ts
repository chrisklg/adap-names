import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import { AbstractName } from "./AbstractName";
import { IllegalArgumentException } from "../common/IllegalArgumentException";

export class StringArrayName extends AbstractName {
    protected components: string[] = [];

    constructor(source: string[], delimiter?: string) {
        super(delimiter);

        this.initialize(source);

        this.assertClassInvariants();
    }

    private initialize(source: string[]): void {
        // PRECONDITION 1: Source must not be null or undefined
        IllegalArgumentException.assert(
            source != null && source != undefined,
            "source must not be null or undefined"
        );

        // PRECONDITION 2: Source must have at least one component
        IllegalArgumentException.assert(
            source.length > 0,
            "source must contain at least one component"
        );

        this.components = [...source];

        // PRECONDITION
        for (let i = 0; i < this.components.length; i++) {
            this.assertComponentProperlyMasked(this.components[i]);
        }
    }

    /**
     * @returns New StringArrayName that equals this one
     */
    protected doClone(): Name {
        return new StringArrayName(this.components, this.delimiter);
    }

    /**
     * @returns Number of components (always >= 0)
     */
    public getNoComponents(): number {
        return this.components.length;
    }

    /**
     * PRECONDITION:
     * - Index must be valid (>= 0 and < component count)
     * @param i - Index of component to retrieve
     * @returns The component string at index i
     */
    protected doGetComponent(i: number): string {
        return this.components[i];
    }

    /**
     * PRECONDITIONS:
     * - Index must be valid
     * - Component must not be null/undefined
     * - Component must be properly masked
     * @param i - Index where to set the component
     * @param c - The new component value (properly masked)
     */
    protected doSetComponent(i: number, c: string): void {
        this.components[i] = c;
    }

    /**
     * PRECONDITIONS:
     * - Index must be valid (can be == length for append)
     * - Component must not be null/undefined
     * - Component must be properly masked
     * @param i - Index where to insert
     * @param c - Component to insert
     */
    protected doInsert(i: number, c: string): void {
        this.components.splice(i, 0, c);
    }

    /**
     * PRECONDITIONS:
     * - Component must not be null/undefined
     * - Component must be properly masked
     * @param c - Component to append
     */
    protected doAppend(c: string): void {
        this.components.push(c);
    }

    /**
     * PRECONDITION:
     * - Index must be valid
     * @param i - Index of component to remove
     */
    protected doRemove(i: number): void {
        this.components.splice(i, 1);
    }
}
