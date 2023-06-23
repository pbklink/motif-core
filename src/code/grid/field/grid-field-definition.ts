/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { GridFieldHorizontalAlign, Integer } from '../../sys/sys-internal-api';
import { GridFieldSourceDefinition } from './grid-field-source-definition';

export class GridFieldDefinition {
    constructor(
        readonly name: string,
        readonly source: GridFieldSourceDefinition,
        readonly defaultHeading: string,
        readonly defaultTextAlign: GridFieldHorizontalAlign,
        readonly defaultWidth?: Integer,
    ) {

    }
}
