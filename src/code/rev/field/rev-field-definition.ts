// (c) 2024 Xilytix Pty Ltd / Paul Klink

import { HorizontalAlign } from '@xilytix/revgrid';
import { AssertInternalError, CommaText, Integer } from '@xilytix/sysutils';
import { RevFieldSourceDefinition } from './rev-field-source-definition';

export class RevFieldDefinition {
    readonly name: string;

    constructor(
        readonly source: RevFieldSourceDefinition,
        readonly sourcelessName: string,
        readonly defaultHeading: string,
        readonly defaultTextAlign: HorizontalAlign,
        readonly defaultWidth?: Integer,
    ) {
        this.name = RevFieldDefinition.composeName(source.name, sourcelessName);
    }
}

export namespace RevFieldDefinition {
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
            throw new AssertInternalError('GFDDNE30361', CommaText.ErrorIdPlusExtra.toEnglish(toResult.error));
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
