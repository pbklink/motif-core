/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from '../../res/internal-api';
import { RevField } from '../../rev/internal-api';
import { RenderValue } from '../../services/internal-api';
import {
    EnumInfoOutOfOrderError,
    FieldDataTypeId,
} from '../../sys/internal-api';

export abstract class GridField extends RevField<RenderValue.TypeId, RenderValue.Attribute.TypeId> {

}

export namespace GridField {
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
                throw new EnumInfoOutOfOrderError('GridField.FieldId', outOfOrderIdx, idToName(outOfOrderIdx));
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
}

export namespace GridFieldModule {
    export function initialiseStatic() {
        GridField.Field.initialise();
    }
}
