import { Name } from "./Name";
import { AbstractName } from "./AbstractName";
import { IllegalArgumentException } from "../common/IllegalArgumentException";

export class StringArrayName extends AbstractName {
    private components: string[] = [];

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

        // Create defensive copy to ensure immutability
        this.components = [...source];

        // PRECONDITION 3: All components must be properly masked
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
     * VALUE TYPE
     * PRECONDITIONS:
     * - Index must be valid
     * - Component must not be null/undefined
     * - Component must be properly masked
     * @param i - Index where to set the component
     * @param c - The new component value (properly masked)
     * @returns New Name instance with component at index i set to c
     */
    protected doSetComponent(i: number, c: string): Name {
        const newComponents = [...this.components];
        newComponents[i] = c;
        return new StringArrayName(newComponents, this.delimiter);
    }

    /**
     * VALUE TYPE
     * PRECONDITIONS:
     * - Index must be valid (can be == length for append)
     * - Component must not be null/undefined
     * - Component must be properly masked
     * @param i - Index where to insert
     * @param c - Component to insert
     * @returns New Name instance with component inserted at index i
     */
    protected doInsert(i: number, c: string): Name {
        const newComponents = [...this.components];
        newComponents.splice(i, 0, c);
        return new StringArrayName(newComponents, this.delimiter);
    }

    /**
     * VALUE TYPE
     * PRECONDITIONS:
     * - Component must not be null/undefined
     * - Component must be properly masked
     * @param c - Component to append
     * @returns New Name instance with component appended
     */
    protected doAppend(c: string): Name {
        const newComponents = [...this.components, c];
        return new StringArrayName(newComponents, this.delimiter);
    }

    /**
     * VALUE TYPE
     * PRECONDITION:
     * - Index must be valid
     * @param i - Index of component to remove
     * @returns New Name instance with component at index i removed
     */
    protected doRemove(i: number): Name {
        const newComponents = [...this.components];
        newComponents.splice(i, 1);
        return new StringArrayName(newComponents, this.delimiter);
    }
}
