// (c) 2024 Xilytix Pty Ltd / Paul Klink

import { HorizontalAlign } from '@xilytix/revgrid';
import { CommaText, Err, Integer, Ok, Result } from '@xilytix/sysutils';
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
        this.name = RevFieldDefinition.Name.compose(source.name, sourcelessName);
    }
}

export namespace RevFieldDefinition {
    export namespace Name {
        export function compose(sourceName: string, sourcelessName: string) {
            if (sourceName === '') {
                return sourcelessName; // for RowDataArrayGrid
            } else {
                return CommaText.from2Values(sourceName, sourcelessName);
            }
        }

        export type DecomposedArray = [sourceName: string, sourcelessName: string];

        export const enum DecomposeErrorId {
            // eslint-disable-next-line @typescript-eslint/prefer-literal-enum-member
            CommaTextUnexpectedCharAfterQuotedElement = CommaText.ErrorId.UnexpectedCharAfterQuotedElement,
            // eslint-disable-next-line @typescript-eslint/prefer-literal-enum-member
            CommaTextQuotesNotClosedInLastElement = CommaText.ErrorId.QuotesNotClosedInLastElement,
            // eslint-disable-next-line @typescript-eslint/prefer-literal-enum-member
            CommaTextIntegerParseStringArray = CommaText.ErrorId.IntegerParseStringArray,
            // eslint-disable-next-line @typescript-eslint/prefer-literal-enum-member
            CommaTextInvalidIntegerString = CommaText.ErrorId.InvalidIntegerString,
            CommaTextNotHas2Elements
        }

        export interface DecomposeErrorIdPlusExtra {
            readonly errorId: DecomposeErrorId;
            readonly extraInfo: string;
        }

        export function tryDecompose(name: string): Result<DecomposedArray, DecomposeErrorIdPlusExtra> {
            const toResult = CommaText.tryToStringArray(name, true);
            if (toResult.isErr()) {
                const commaTextErrorIdPlusExtra = toResult.error;
                const errorIdPlusExtra: DecomposeErrorIdPlusExtra = {
                    errorId: commaTextErrorIdPlusExtra.errorId as Integer as DecomposeErrorId,
                    extraInfo: commaTextErrorIdPlusExtra.extraInfo,
                }
                return new Err(errorIdPlusExtra);
            } else {
                const result = toResult.value;
                if (result.length !== 2) {
                    return new Err<DecomposedArray, DecomposeErrorIdPlusExtra>({ errorId: DecomposeErrorId.CommaTextNotHas2Elements, extraInfo: name });
                } else {
                    return new Ok(result as DecomposedArray);
                }
            }
        }
    }
}
