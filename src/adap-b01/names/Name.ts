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
    if (delimiter !== undefined) {
      this.assertValidDelimiter(delimiter);
      this.delimiter = delimiter;
    }
    this.components = [...other];
    if (this.getNoComponents() === 0) {
      throw new Error("Components not initialized");
    }
    this.assertComponentsProperlyMasked();
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
    this.assertComponentProperlyMasked(c);
    this.components[i] = c;
  }

  /** Returns number of components in Name instance
   * @methodtype get-method
   */
  public getNoComponents(): number {
    return this.components.length;
  }

  /** Expects that new Name component c is properly masked
   * @methodtype set-method
   */
  public insert(i: number, c: string): void {
    this.assertIsValidIndex(i, true);
    this.assertIsDefined(c);
    this.assertComponentProperlyMasked(c);
    this.components.splice(i, 0, c);
  }

  /** Expects that new Name component c is properly masked
   * @methodtype set-method
   */
  public append(c: string): void {
    this.assertIsDefined(c);
    this.assertComponentProperlyMasked(c);
    this.components.push(c);
  }

  /**
   * Removes component at position i
   * @methodtype set-method
   */
  public remove(i: number): void {
    this.assertIsValidIndex(i);
    this.components.splice(i, 1);
  }

  // ========== Validation Methods ==========

  /**
   * Validates that the delimiter is exactly one character and not the escape character
   * @methodtype assertion-method
   */
  private assertValidDelimiter(delimiter: string): void {
    if (delimiter.length !== 1) {
      throw new Error("Delimiter must be exactly one character");
    }
    if (delimiter === ESCAPE_CHARACTER) {
      throw new Error("Delimiter cannot be the escape character");
    }
  }

  /**
   * Validates that all components in the array are properly masked
   * @methodtype assertion-method
   */
  private assertComponentsProperlyMasked(): void {
    for (let i = 0; i < this.components.length; i++) {
      try {
        this.assertComponentProperlyMasked(this.components[i]);
      } catch (error) {
        throw new Error(
          `Component at index ${i} is not properly masked: ${this.components[i]}`
        );
      }
    }
  }

  /**
   * Validates that a single component is properly masked
   * Checks for:
   * 1. No unescaped delimiters
   * 2. No trailing escape characters
   * 3. Valid escape sequences
   * @methodtype assertion-method
   */
  private assertComponentProperlyMasked(component: string): void {
    let i = 0;
    while (i < component.length) {
      if (component[i] === ESCAPE_CHARACTER) {
        // Escape character must be followed by another character
        if (i + 1 >= component.length) {
          throw new Error(
            "Invalid escape sequence: escape character at end of component"
          );
        }
        // Skip the escaped character
        i += 2;
      } else if (component[i] === this.delimiter) {
        // Found unescaped delimiter
        throw new Error(
          `Component contains unescaped delimiter '${this.delimiter}': ${component}`
        );
      } else {
        // Regular character
        i++;
      }
    }
  }

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

  // ========== Masking Helper Methods ==========

  /**
   * Removes escape characters from a masked component
   * @methodtype primitive-method
   */
  protected doUnmask(component: string): string {
    let result = "";
    let i = 0;

    while (i < component.length) {
      if (component[i] === ESCAPE_CHARACTER && i + 1 < component.length) {
        // Escape sequence ... add only the escaped character
        result += component[i + 1];
        i += 2;
      } else {
        result += component[i];
        i++;
      }
    }

    return result;
  }

  /**
   * Adds escape characters to mask special characters in a component
   * @methodtype primitive-method
   */
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
