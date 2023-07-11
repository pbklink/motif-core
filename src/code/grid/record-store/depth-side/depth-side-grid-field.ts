/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RenderValue } from '../../../services/services-internal-api';
import { CorrectnessId, GridFieldHorizontalAlign, GridRevRecordField } from '../../../sys/sys-internal-api';
import { GridField, GridFieldDefinition, GridFieldSourceDefinition } from '../../field/grid-field-internal-api';
import { DepthRecord } from './depth-record';

/** @public */
export abstract class DepthSideGridField extends GridField implements GridRevRecordField {
    constructor(
        name: string,
        defaultHeading: string,
        defaultTextAlign: GridFieldHorizontalAlign,
    ) {
        const definition = new GridFieldDefinition(
            name,
            DepthSideGridField.sourceDefinition,
            defaultHeading,
            defaultTextAlign,
        );
        // add support for custom headings here in future
        super(definition);
    }

    abstract override getViewValue(record: DepthRecord): RenderValue;
}

/** @public */
export namespace DepthSideGridField {
    export type GetDataItemCorrectnessIdEventHandler = (this: void) => CorrectnessId;
    // export interface AllFieldsAndDefaults {
    //     fields: DepthSideGridField[];
    //     defaultStates: GridRecordFieldState[];
    //     defaultVisibles: boolean[];
    // }

    export const sourceDefinition = new GridFieldSourceDefinition('DepthSide');
}
