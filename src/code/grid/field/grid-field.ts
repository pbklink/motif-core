/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevField } from '@xilytix/rev-data-source';
import { StringId, Strings } from '../../res/internal-api';
import { RenderValue } from '../../services/internal-api';
import { UnreachableCaseError } from '../../sys/xilytix-sysutils';

export abstract class GridField extends RevField<RenderValue.TypeId, RenderValue.Attribute.TypeId> {

}

export namespace GridField {
    export type FieldId = RevField.FieldId;

    export function idToHeading(id: FieldId) {
        const stringId = idToHeadingStringId(id);
        return Strings[stringId];
    }

    function idToHeadingStringId(id: FieldId) {
        switch (id) {
            case RevField.FieldId.Name: return StringId.GridFieldFieldHeading_Name;
            case RevField.FieldId.Heading: return StringId.GridFieldFieldHeading_Heading;
            case RevField.FieldId.SourceName: return StringId.GridFieldFieldHeading_SourceName;
            case RevField.FieldId.DefaultHeading: return StringId.GridFieldFieldHeading_DefaultHeading;
            case RevField.FieldId.DefaultTextAlign: return StringId.GridFieldFieldHeading_DefaultTextAlign;
            case RevField.FieldId.DefaultWidth: return StringId.GridFieldFieldHeading_DefaultWidth;
            default:
                throw new UnreachableCaseError('GFITHSI50912', id);
        }
    }

}
