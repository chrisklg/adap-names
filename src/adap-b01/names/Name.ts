export const DEFAULT_DELIMITER: string = ".";
export const ESCAPE_CHARACTER = "\\";

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
 */
export class Name {
  private delimiter: string = DEFAULT_DELIMITER;
  private components: string[] = [];

  /** Expects that all Name components are properly masked
   * @methodtype initialization-method
   */
  constructor(other: string[], delimiter?: string) {
    this.components = [...other];
    if (delimiter) {
      this.delimiter = delimiter;
    }
    if (this.getNoComponents() === 0) {
      throw new Error("Components not initialized");
    }
  }

  /**
   * Returns a human-readable representation of the Name instance using user-set control characters
   * Control characters are not escaped (creating a human-readable string)
   * Users can vary the delimiter character to be used
   * @methodtype conversion-method
   */
  public asString(delimiter: string = this.delimiter): string {
    const unmaskedComponents = this.components.map((component) =>
      this.doUnmask(component)
    );
    return unmaskedComponents.join(delimiter);
  }

  /**
   * Returns a machine-readable representation of Name instance using default control characters
   * Machine-readable means that from a data string, a Name can be parsed back in
   * The control characters in the data string are the default characters
   * @methodtype conversion-method
   */
  public asDataString(): string {
    // If the current delimiter is already the default delimiter, just join
    if (this.delimiter === DEFAULT_DELIMITER) {
      return this.components.join(DEFAULT_DELIMITER);
    }

    // Otherwise, we need to re-mask for the default delimiter
    const remaskedComponents = this.components.map((component) => {
      // First unmask the current masking
      const unmasked = this.doUnmask(component);
      // Then mask for the default delimiter
      return this.doMask(unmasked, DEFAULT_DELIMITER);
    });

    return remaskedComponents.join(DEFAULT_DELIMITER);
  }

  /**
   * Returns string at specific position of components array
   * @methodtype get-method
   */
  public getComponent(i: number): string {
    this.assertIsValidIndex(i);
    return this.components[i];
  }

  /** Expects that new Name component c is properly masked
   * @methodtype set-method
   */
  public setComponent(i: number, c: string): void {
    this.assertIsValidIndex(i);
    this.assertIsDefined(c);
    this.components[i] = c;
  }

  /** Returns number of components in Name instance
   * @methodtype get-method
   */
  public getNoComponents(): number {
    return this.components.length;
  }

  /** Expects that new Name component c is properly masked
   * @methodtype command-method
   */
  public insert(i: number, c: string): void {
    this.assertIsValidIndex(i, true); // allowEnd = true for insert
    this.assertIsDefined(c);
    this.components.splice(i, 0, c);
  }

  /** Expects that new Name component c is properly masked
   * @methodtype command-method
   */
  public append(c: string): void {
    this.assertIsDefined(c);
    this.components.push(c);
  }

  /**
   * Removes component at position i
   * @methodtype command-method
   */
  public remove(i: number): void {
    this.assertIsValidIndex(i);
    this.components.splice(i, 1);
  }

  // ========== Additional Helper Methods ==========

  /**
   * Asserts that index i is valid for the components array
   * @methodtype assertion-method
   */
  protected assertIsValidIndex(i: number, allowEnd: boolean = false): void {
    const max = allowEnd ? this.components.length : this.components.length - 1;
    if (i < 0 || i > max) {
      throw new Error(`Index ${i} out of bounds [0, ${max}]`);
    }
  }

  /**
   * Asserts that component is not null or undefined
   * @methodtype assertion-method
   */
  protected assertIsDefined(component: string): void {
    if (component === undefined || component === null) {
      throw new Error("Component cannot be null or undefined");
    }
  }

  /**
   * Removes escape characters from a masked component
   * @methodtype helper-method
   */
  protected doUnmask(component: string): string {
    return component.replace(new RegExp(`\\${ESCAPE_CHARACTER}(.)`, "g"), "$1");
  }

  /**
   * Adds escape characters to mask special characters in a component
   * @methodtype helper-method
   */
  protected doMask(
    component: string,
    delimiter: string = DEFAULT_DELIMITER
  ): string {
    return component.replace(
      new RegExp(`[\\${ESCAPE_CHARACTER}\\${delimiter}]`, "g"),
      `${ESCAPE_CHARACTER}$&`
    );
  }
}
