/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RenderValue } from '../../services/services-internal-api';
import { CorrectnessId, GridFieldHAlign, GridRevRecordField } from '../../sys/sys-internal-api';
import { GridField, GridFieldDefinition, GridFieldSourceDefinition } from '../field/grid-field-internal-api';
import { DepthRecord } from './depth-record';

export abstract class DepthSideGridField extends GridField implements GridRevRecordField {
    constructor(
        name: string,
        defaultHeading: string,
        defaultHAlign: GridFieldHAlign,
    ) {
        const definition = new GridFieldDefinition(
            name,
            DepthSideGridField.sourceDefinition,
            defaultHeading,
            defaultHAlign,
        );
        // add support for custom headings here in future
        super(definition);
    }

    abstract override getValue(record: DepthRecord): RenderValue;
}

export namespace DepthSideGridField {
    export type GetDataItemCorrectnessIdEventHandler = (this: void) => CorrectnessId;
    // export interface AllFieldsAndDefaults {
    //     fields: DepthSideGridField[];
    //     defaultStates: GridRecordFieldState[];
    //     defaultVisibles: boolean[];
    // }

    export class SourceDefinition extends GridFieldSourceDefinition {
    }

    export const sourceDefinition = new SourceDefinition('DepthSide');
}
