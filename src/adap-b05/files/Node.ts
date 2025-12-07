import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { InvalidStateException } from "../common/InvalidStateException";
import { ServiceFailureException } from "../common/ServiceFailureException";

import { Name } from "../names/Name";
import { Directory } from "./Directory";

export class Node {
    protected baseName: string = "";
    protected parentNode: Directory;

    constructor(bn: string, pn: Directory) {
        this.doSetBaseName(bn);
        this.parentNode = pn; // why oh why do I have to set this
        this.initialize(pn);
    }

    protected initialize(pn: Directory): void {
        this.parentNode = pn;
        this.parentNode.addChildNode(this);
    }

    public move(to: Directory): void {
        this.parentNode.removeChildNode(this);
        to.addChildNode(this);
        this.parentNode = to;
    }

    public getFullName(): Name {
        const result: Name = this.parentNode.getFullName();
        result.append(this.getBaseName());
        return result;
    }

    public getBaseName(): string {
        return this.doGetBaseName();
    }

    protected doGetBaseName(): string {
        return this.baseName;
    }

    public rename(bn: string): void {
        this.doSetBaseName(bn);
    }

    protected doSetBaseName(bn: string): void {
        this.baseName = bn;
    }

    public getParentNode(): Directory {
        return this.parentNode;
    }

    /**
     * Returns all nodes in the tree that match bn
     * @param bn basename of node being searched for
     */
    public findNodes(bn: string): Set<Node> {
        // Check parameter validity
        IllegalArgumentException.assert(
            bn != null && bn != undefined,
            "basename must not be null or undefined"
        );

        try {
            // Check if this node matches
            const currentBaseName = this.doGetBaseName();

            const isRootNode = this.constructor.name === "RootNode";
            InvalidStateException.assert(
                currentBaseName !== "" || isRootNode,
                "node has invalid state: basename is empty"
            );

            const result: Set<Node> = new Set<Node>();

            if (currentBaseName === bn) {
                result.add(this);
            }

            return result;
        } catch (ex) {
            // Error handling
            if (ex instanceof InvalidStateException) {
                throw new ServiceFailureException(
                    "findNodes service failed due to invalid node state",
                    ex
                );
            }
            throw ex;
        }
    }
}
