/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from '../../res/res-internal-api';
import { RenderValue } from '../../services/services-internal-api';
import {
    AssertInternalError,
    EnumInfoOutOfOrderError,
    FieldDataTypeId,
    GridDataEditValue,
    GridRevRecordField,
    IndexedRecord,
    Integer
} from '../../sys/internal-api';
import { GridFieldCustomHeadingsService } from './grid-field-custom-headings-service';
import { GridFieldDefinition } from './grid-field-definition';

export abstract class GridField implements GridRevRecordField {
    readonly name: string;
    index: Integer;
    heading: string;

    getEditValueEventer: GridField.GetEditValueEventer | undefined;
    setEditValueEventer: GridField.SetEditValueEventer | undefined;

    constructor(readonly definition: GridFieldDefinition, heading?: string) {
        this.name = definition.name;
        this.heading = heading ?? definition.defaultHeading;
    }

    getEditValue(record: IndexedRecord): GridDataEditValue {
        if (this.getEditValueEventer === undefined) {
            throw new AssertInternalError('GFGEV20814');
        } else {
            return this.getEditValueEventer(record);
        }
    }

    setEditValue(record: IndexedRecord, value: GridDataEditValue) {
        if (this.setEditValueEventer === undefined) {
            throw new AssertInternalError('GFSEV20814');
        } else {
            this.setEditValueEventer(record, value);
        }
    }

    abstract getViewValue(record: IndexedRecord): RenderValue;
}

export namespace GridField {
    export type GetEditValueEventer = (this: void, record: IndexedRecord) => GridDataEditValue;
    export type SetEditValueEventer = (this: void, record: IndexedRecord, value: GridDataEditValue) => void;

    export const enum FieldId {
        Name,
        Heading,
        SourceName,
        DefaultHeading,
        DefaultTextAlign,
        DefaultWidth,
    }

    export namespace Field {
        export type Id = FieldId;

        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly dataTypeId: FieldDataTypeId;
            readonly headingId: StringId;
        }

        type InfosObject = { [id in keyof typeof FieldId]: Info };

        const infosObject: InfosObject = {
            Name: {
                id: FieldId.Name,
                name: 'Name',
                dataTypeId: FieldDataTypeId.String,
                headingId: StringId.GridFieldFieldHeading_Name,
            },
            Heading: {
                id: FieldId.Heading,
                name: 'Heading',
                dataTypeId: FieldDataTypeId.String,
                headingId: StringId.GridFieldFieldHeading_Heading,
            },
            SourceName: {
                id: FieldId.SourceName,
                name: 'SourceName',
                dataTypeId: FieldDataTypeId.String,
                headingId: StringId.GridFieldFieldHeading_SourceName,
            },
            DefaultHeading: {
                id: FieldId.DefaultHeading,
                name: 'DefaultHeading',
                dataTypeId: FieldDataTypeId.String,
                headingId: StringId.GridFieldFieldHeading_DefaultHeading,
            },
            DefaultTextAlign: {
                id: FieldId.DefaultTextAlign,
                name: 'DefaultTextAlign',
                dataTypeId: FieldDataTypeId.Enumeration,
                headingId: StringId.GridFieldFieldHeading_DefaultTextAlign,
            },
            DefaultWidth: {
                id: FieldId.DefaultWidth,
                name: 'DefaultWidth',
                dataTypeId: FieldDataTypeId.Integer,
                headingId: StringId.GridFieldFieldHeading_DefaultWidth,
            },
        } as const;

        const infos = Object.values(infosObject);
        export const idCount = infos.length;

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: number) => info.id !== index as FieldId);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('GridField.FieldId', outOfOrderIdx, `${idToName(outOfOrderIdx)}`);
            }
        }

        export function idToName(id: Id) {
            return infos[id].name;
        }

        export function idToFieldDataTypeId(id: Id) {
            return infos[id].dataTypeId;
        }

        export function idToHeadingId(id: Id) {
            return infos[id].headingId;
        }

        export function idToHeading(id: Id) {
            return Strings[idToHeadingId(id)];
        }
    }

    export function generateHeading(customHeadingsService: GridFieldCustomHeadingsService, fieldDefinition: GridFieldDefinition) {
        const customHeading = customHeadingsService.tryGetFieldHeading(fieldDefinition.name, fieldDefinition.sourcelessName);
        if (customHeading !== undefined) {
            return customHeading;
        } else {
            return fieldDefinition.defaultHeading;
        }
    }
}

export namespace GridFieldModule {
    export function initialiseStatic() {
        GridField.Field.initialise();
    }
}
