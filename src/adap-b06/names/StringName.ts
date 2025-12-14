import { ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import { AbstractName } from "./AbstractName";
import { IllegalArgumentException } from "../common/IllegalArgumentException";

export class StringName extends AbstractName {
    private name: string = "";
    private noComponents: number = 0;

    constructor(source: string, delimiter?: string) {
        super(delimiter);

        this.initialize(source);

        this.assertClassInvariants();
    }

    private initialize(source: string): void {
        // PRECONDITION 1
        IllegalArgumentException.assert(
            source != null && source != undefined,
            "source must not be null or undefined"
        );

        this.name = source;

        this.noComponents = this.parseComponents().length;

        // PRECONDITION 2
        // Special case: empty string is allowed for root node
        IllegalArgumentException.assert(
            this.noComponents > 0 || source === "",
            "source must contain at least one component"
        );

        // PRECONDITION 3
        const components = this.parseComponents();
        for (let i = 0; i < components.length; i++) {
            this.assertComponentProperlyMasked(components[i]);
        }
    }

    /**
     * @returns New StringName that equals this one
     */
    protected doClone(): Name {
        return new StringName(this.name, this.delimiter);
    }

    /**
     * @returns Number of components (always >= 1 after construction)
     */
    public getNoComponents(): number {
        return this.noComponents;
    }

    /**
     * PRECONDITION:
     * - Index must be valid (>= 0 and < component count)
     * @param i - Index of component to retrieve
     * @returns The component string at index i (properly masked)
     */
    protected doGetComponent(i: number): string {
        const components = this.parseComponents();
        return components[i];
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
        const components = this.parseComponents();
        components[i] = c;
        const newName = components.join(this.delimiter);
        return new StringName(newName, this.delimiter);
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
        const components = this.parseComponents();
        components.splice(i, 0, c);
        const newName = components.join(this.delimiter);
        return new StringName(newName, this.delimiter);
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
        let newName: string;
        if (this.noComponents === 0) {
            newName = c;
        } else {
            newName = this.name + this.delimiter + c;
        }
        return new StringName(newName, this.delimiter);
    }

    /**
     * VALUE TYPE
     * PRECONDITION:
     * - Index must be valid
     * @param i - Index of component to remove
     * @returns New Name instance with component at index i removed
     */
    protected doRemove(i: number): Name {
        const components = this.parseComponents();
        components.splice(i, 1);
        const newName = components.join(this.delimiter);
        return new StringName(newName, this.delimiter);
    }

    /**
     * Parses the internal string representation into components
     * @returns Array of component strings
     */
    protected parseComponents(): string[] {
        if (this.name.length === 0) {
            return [];
        }

        const components: string[] = [];
        let currentComponent = "";
        let i = 0;

        while (i < this.name.length) {
            if (this.name[i] === ESCAPE_CHARACTER && i + 1 < this.name.length) {
                currentComponent += this.name[i] + this.name[i + 1];
                i += 2; // Skip both characters
            } else if (this.name[i] === this.delimiter) {
                components.push(currentComponent);
                currentComponent = "";
                i++;
            } else {
                currentComponent += this.name[i];
                i++;
            }
        }
        components.push(currentComponent);
        return components;
    }
}
