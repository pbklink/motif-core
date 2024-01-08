/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, CommaText, GridFieldHorizontalAlign, Integer } from '../../sys/sys-internal-api';
import { GridFieldSourceDefinition } from './grid-field-source-definition';

export class GridFieldDefinition {
    readonly name: string;

    constructor(
        readonly source: GridFieldSourceDefinition,
        readonly sourcelessName: string,
        readonly defaultHeading: string,
        readonly defaultTextAlign: GridFieldHorizontalAlign,
        readonly defaultWidth?: Integer,
    ) {
        this.name = GridFieldDefinition.composeName(source.name, sourcelessName);
    }
}

export namespace GridFieldDefinition {
    export function composeName(sourceName: string, sourcelessName: string) {
        if (sourceName === '') {
            return sourcelessName; // for RowDataArrayGrid
        } else {
            return CommaText.from2Values(sourceName, sourcelessName);
        }
    }

    export type DecomposedName = [sourceName: string, sourcelessName: string];
    export function decomposeName(name: string) {
        const toResult = CommaText.tryToStringArray(name, true);
        if (toResult.isErr()) {
            throw new AssertInternalError('GFDDNE30361', toResult.error);
        } else {
            const result = toResult.value;
            if (result.length !== 2) {
                throw new AssertInternalError('GFDDNL30361', result.length.toString());
            } else {
                return result as DecomposedName;
            }
        }
    }
}
