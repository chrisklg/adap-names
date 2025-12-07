import { Node } from "./Node";
import { IllegalArgumentException } from "../common/IllegalArgumentException";

export class Directory extends Node {
    protected childNodes: Set<Node> = new Set<Node>();

    constructor(bn: string, pn: Directory) {
        super(bn, pn);
    }

    public hasChildNode(cn: Node): boolean {
        return this.childNodes.has(cn);
    }

    public addChildNode(cn: Node): void {
        this.childNodes.add(cn);
    }

    public removeChildNode(cn: Node): void {
        this.childNodes.delete(cn); // Yikes! Should have been called remove
    }

    /**
     * Override findNodes to recursively search this directory and all children
     * @param bn basename of node being searched for
     */
    public override findNodes(bn: string): Set<Node> {
        IllegalArgumentException.assert(
            bn != null && bn != undefined,
            "basename must not be null or undefined"
        );

        // Check if this directory itself matches
        const result: Set<Node> = super.findNodes(bn);

        // recursively search all child nodes
        for (const child of this.childNodes) {
            try {
                const childMatches = child.findNodes(bn);
                // Add all matches from child to result set
                for (const match of childMatches) {
                    result.add(match);
                }
            } catch (ex) {
                throw ex;
            }
        }

        return result;
    }
}
