import { Equality } from "../common/Equality";
import { Cloneable } from "../common/Cloneable";
import { Printable } from "../common/Printable";

/**
 * A name is a sequence of string components separated by a delimiter character.
 * Special characters within the string may need masking, if they are to appear verbatim.
 * There are only two special characters, the delimiter character and the escape character.
 * The escape character can't be set, the delimiter character can.
 *
 * Homogenous name examples
 *
 * "oss.cs.fau.de" is a name with four name components and the delimiter character '.'.
 * "///" is a name with four empty components and the delimiter character '/'.
 * "Oh\.\.\." is a name with one component, if the delimiter character is '.'.
 *
 * VALUE TYPE: Name is immutable. All modification operations return new Name instances.
 */
export interface Name extends Cloneable, Printable, Equality {

    /**
     * Returns true, if number of components == 0; else false
     */
    isEmpty(): boolean;

    /**
     * Returns number of components in Name instance
     */
    getNoComponents(): number;

    getComponent(i: number): string;

    /**
     * Expects that new Name component c is properly masked
     * Returns a new Name instance with the component at index i set to c
     */
    setComponent(i: number, c: string): Name;

    /**
     * Expects that new Name component c is properly masked
     * Returns a new Name instance with component c inserted at index i
     */
    insert(i: number, c: string): Name;

    /**
     * Expects that new Name component c is properly masked
     * Returns a new Name instance with component c appended at the end
     */
    append(c: string): Name;

    /**
     * Returns a new Name instance with the component at index i removed
     */
    remove(i: number): Name;

    /**
     * Returns a new Name instance with other's components concatenated to this
     */
    concat(other: Name): Name;

}
