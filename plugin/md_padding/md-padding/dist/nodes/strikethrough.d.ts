import { NodeKind } from './node-kind';
import { Node } from './node';
import { Delimited } from './delimited';
export declare class Strikethrough extends Delimited implements Node {
    readonly children: Node[];
    readonly kind: NodeKind;
    constructor(children: Node[]);
}
