import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";

export class StringName implements Name {
  protected delimiter: string = DEFAULT_DELIMITER;
  protected name: string = "";

  constructor(source: string, delimiter?: string) {
    this.initialize(source, delimiter);
  }

  /**
   * @methodtype initialize-method
   */
  public initialize(source: string, delimiter?: string) {
    this.name = source;
    if (delimiter != undefined) {
      this.assertValidDelimiter(delimiter);
      this.delimiter = delimiter;
    }
    if (this.getNoComponents() === 0) {
      throw new Error("Components not initialized");
    }
    this.assertComponentsProperlyMasked();
  }
  /**
   * @methodtype conversion-method
   */
  public asString(delimiter: string = this.delimiter): string {
    const components = this.parseComponents();
    const unmaskedComponents = components.map((component) =>
      this.doUnmask(component)
    );
    return unmaskedComponents.join(delimiter);
  }
  /**
   * @methodtype conversion-method
   */
  public asDataString(): string {
    if (this.delimiter === DEFAULT_DELIMITER) {
      return this.name;
    }
    // Otherwise, re-mask
    const components = this.parseComponents();
    const remaskedComponents = components.map((component) => {
      const unmasked = this.doUnmask(component);
      return this.doMask(unmasked, DEFAULT_DELIMITER);
    });

    return remaskedComponents.join(DEFAULT_DELIMITER);
  }

  /**
   * @methodtype get-method
   */
  public getDelimiterCharacter(): string {
    this.assertValidDelimiter(this.delimiter);
    return this.doGetDelimiterCharacter();
  }
  /**
   * @methodtype primitive-method
   */
  protected doGetDelimiterCharacter(): string {
    return this.delimiter;
  }

  /**
   * @methodtype boolean-query-method
   */
  public isEmpty(): boolean {
    return this.name.length === 0;
  }

  /**
   * @methodtype get-method
   */
  public getNoComponents(): number {
    return this.doGetNoComponents();
  }
  /**
   * @methodtype primitive-method
   */
  protected doGetNoComponents(): number {
    return this.parseComponents().length;
  }

  /**
   * @methodtype get-method
   */
  public getComponent(i: number): string {
    this.assertIsValidIndex(i);
    return this.doGetComponent(i);
  }
  /**
   * @methodtype primitive-method
   */
  protected doGetComponent(i: number): string {
    const components = this.parseComponents();
    return components[i];
  }

  /**
   * @methodtype set-method
   */
  public setComponent(i: number, c: string): void {
    this.assertIsValidIndex(i);
    this.assertIsDefined(c);
    this.assertComponentProperlyMasked(c);
    this.doSetComponent(i, c);
  }
  /**
   * @methodtype primitive-method
   */
  protected doSetComponent(i: number, c: string): void {
    const components = this.parseComponents();
    components[i] = c;
    this.name = components.join(this.delimiter);
  }

  /**
   * @methodtype command-method
   */
  public insert(i: number, c: string): void {
    this.assertIsValidIndex(i, true);
    this.assertIsDefined(c);
    this.assertComponentProperlyMasked(c);
    const components = this.parseComponents();
    components.splice(i, 0, c);
    this.name = components.join(this.delimiter);
  }

  /**
   * @methodtype command-method
   */
  public append(c: string): void {
    this.assertIsDefined(c);
    this.assertComponentProperlyMasked(c);
    if (this.name.length > 0) {
      this.name = this.name + this.delimiter + c;
    } else {
      this.name = c;
    }
  }

  /**
   * @methodtype command-method
   */
  public remove(i: number): void {
    this.assertIsValidIndex(i);
    const components = this.parseComponents();
    components.splice(i, 1);
    this.name = components.join(this.delimiter);
  }

  /**
   * @methodtype command-method
   */
  public concat(other: Name): void {
    if (other.isEmpty()) {
      return;
    }
    for (let i = 0; i < other.getNoComponents(); i++) {
      this.append(other.getComponent(i));
    }
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
   * Validates that all components in the string are properly masked
   * @methodtype assertion-method
   */
  private assertComponentsProperlyMasked(): void {
    const components = this.parseComponents();
    for (let i = 0; i < components.length; i++) {
      try {
        this.assertComponentProperlyMasked(components[i]);
      } catch (error) {
        throw new Error(
          `Component at index ${i} is not properly masked: ${components[i]}`
        );
      }
    }
  }

  /**
   * Validates that a single component is properly masked
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
   * Asserts that index i is valid for the components
   * @methodtype assertion-method
   */
  protected assertIsValidIndex(i: number, allowEnd: boolean = false): void {
    const componentCount = this.parseComponents().length;
    const max = allowEnd ? componentCount : componentCount - 1;
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

  /**
   * Parses the string and returns an array of component strings
   * Splits by delimiter
   * @methodtype helper-method
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
