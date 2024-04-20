/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevSourcedField } from '@xilytix/revgrid';
import { StringId, Strings } from '../../res/internal-api';
import { RenderValue } from '../../services/internal-api';
import { UnreachableCaseError } from '../../sys/internal-api';

export abstract class GridField extends RevSourcedField<RenderValue.TypeId, RenderValue.Attribute.TypeId> {

}

export namespace GridField {
    export function idToHeading(id: RevSourcedField.FieldId) {
        const stringId = idToHeadingStringId(id);
        return Strings[stringId];
    }

    function idToHeadingStringId(id: RevSourcedField.FieldId) {
        switch (id) {
            case RevSourcedField.FieldId.Name: return StringId.GridFieldFieldHeading_Name;
            case RevSourcedField.FieldId.Heading: return StringId.GridFieldFieldHeading_Heading;
            case RevSourcedField.FieldId.SourceName: return StringId.GridFieldFieldHeading_SourceName;
            case RevSourcedField.FieldId.DefaultHeading: return StringId.GridFieldFieldHeading_DefaultHeading;
            case RevSourcedField.FieldId.DefaultTextAlign: return StringId.GridFieldFieldHeading_DefaultTextAlign;
            case RevSourcedField.FieldId.DefaultWidth: return StringId.GridFieldFieldHeading_DefaultWidth;
            default:
                throw new UnreachableCaseError('GFITHSI50912', id);
        }
    }

}
