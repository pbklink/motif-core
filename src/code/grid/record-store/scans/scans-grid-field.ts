/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from '../../../res/res-internal-api';
import { Scan } from '../../../scan/scan-internal-api';
import {
    DateTimeRenderValue,
    IntegerRenderValue,
    ReadonlyRenderValue,
    RenderValue,
    ScanStatusIdRenderValue,
    StringRenderValue
} from "../../../services/services-internal-api";
import { GridFieldHorizontalAlign, GridRevRecordField, UnreachableCaseError } from '../../../sys/sys-internal-api';
import { GridField, GridFieldDefinition, GridFieldSourceDefinition } from '../../field/grid-field-internal-api';

/** @internal */
export abstract class ScansGridField extends GridField implements GridRevRecordField {
    constructor(
        readonly id: ScansGridField.Id,
        definition: GridFieldDefinition,
    ) {
        super(definition);
    }

    abstract override getViewValue(record: Scan): RenderValue;
}

/** @internal */
export namespace ScansGridField {
    export const enum Id {
        Id,
        Index,
        Readonly,
        Name,
        Description,
        StatusId,
        Version,
        LastSavedTime,
    }

    export const allIds = [
        Id.Id,
        Id.Index,
        Id.Readonly,
        Id.Name,
        Id.Description,
        Id.StatusId,
        Id.Version,
        Id.LastSavedTime,
    ];

    export const sourceDefinition = new GridFieldSourceDefinition('Scans');

    export function createField(id: Id): ScansGridField {
        switch(id) {
            case Id.Id: return new IdScansGridField();
            case Id.Index: return new IndexScansGridField();
            case Id.Readonly: return new ReadonlyScansGridField();
            case Id.Name: return new NameScansGridField();
            case Id.Description: return new DescriptionScansGridField();
            case Id.StatusId: return new StatusIdScansGridField();
            case Id.Version: return new VersionScansGridField();
            case Id.LastSavedTime: return new LastSavedTimeScansGridField();
            default:
                throw new UnreachableCaseError('SGFCF97133', id);
        }
    }
}

/** @internal */
export class IdScansGridField extends ScansGridField {
    constructor() {
        const definition = new GridFieldDefinition(
            ScansGridField.sourceDefinition,
            Scan.Field.idToName(Scan.FieldId.Id),
            Strings[StringId.ScansGridHeading_Id],
            GridFieldHorizontalAlign.left,
        );
        super(ScansGridField.Id.Id, definition);
    }

    override getViewValue(record: Scan): RenderValue {
        return new StringRenderValue(record.mapKey);
    }
}

/** @internal */
export class IndexScansGridField extends ScansGridField {
    constructor() {
        const definition = new GridFieldDefinition(
            ScansGridField.sourceDefinition,
            Scan.Field.idToName(Scan.FieldId.Index),
            Strings[StringId.ScansGridHeading_Index],
            GridFieldHorizontalAlign.left,
        );
        super(ScansGridField.Id.Index, definition);
    }

    override getViewValue(record: Scan): RenderValue {
        return new IntegerRenderValue(record.index);
    }
}

/** @internal */
export class ReadonlyScansGridField extends ScansGridField {
    constructor() {
        const definition = new GridFieldDefinition(
            ScansGridField.sourceDefinition,
            Scan.Field.idToName(Scan.FieldId.Readonly),
            Strings[StringId.ScansGridHeading_Readonly],
            GridFieldHorizontalAlign.left,
        );
        super(ScansGridField.Id.Readonly, definition);
    }

    override getViewValue(record: Scan): RenderValue {
        return new ReadonlyRenderValue(record.readonly);
    }
}

/** @internal */
export class NameScansGridField extends ScansGridField {
    constructor() {
        const definition = new GridFieldDefinition(
            ScansGridField.sourceDefinition,
            Scan.Field.idToName(Scan.FieldId.Name),
            Strings[StringId.ScansGridHeading_Name],
            GridFieldHorizontalAlign.left,
        );
        super(ScansGridField.Id.Name, definition);
    }

    override getViewValue(record: Scan): RenderValue {
        return new StringRenderValue(record.name);
    }
}

/** @internal */
export class DescriptionScansGridField extends ScansGridField {
    constructor() {
        const definition = new GridFieldDefinition(
            ScansGridField.sourceDefinition,
            Scan.Field.idToName(Scan.FieldId.Description),
            Strings[StringId.ScansGridHeading_Description],
            GridFieldHorizontalAlign.left,
        );
        super(ScansGridField.Id.Description, definition);
    }

    override getViewValue(record: Scan): RenderValue {
        return new StringRenderValue(record.description);
    }
}

/** @internal */
export class StatusIdScansGridField extends ScansGridField {
    constructor() {
        const definition = new GridFieldDefinition(
            ScansGridField.sourceDefinition,
            Scan.Field.idToName(Scan.FieldId.StatusId),
            Strings[StringId.ScansGridHeading_StatusId],
            GridFieldHorizontalAlign.left,
        );
        super(ScansGridField.Id.StatusId, definition);
    }

    override getViewValue(record: Scan): RenderValue {
        return new ScanStatusIdRenderValue(record.statusId);
    }
}

/** @internal */
export class VersionScansGridField extends ScansGridField {
    constructor() {
        const definition = new GridFieldDefinition(
            ScansGridField.sourceDefinition,
            Scan.Field.idToName(Scan.FieldId.Version),
            Strings[StringId.ScansGridHeading_Version],
            GridFieldHorizontalAlign.left,
        );
        super(ScansGridField.Id.Version, definition);
    }

    override getViewValue(record: Scan): StringRenderValue {
        return new StringRenderValue(record.version);
    }
}

/** @internal */
export class LastSavedTimeScansGridField extends ScansGridField {
    constructor() {
        const definition = new GridFieldDefinition(
            ScansGridField.sourceDefinition,
            Scan.Field.idToName(Scan.FieldId.LastSavedTime),
            Strings[StringId.ScansGridHeading_LastSavedTime],
            GridFieldHorizontalAlign.right,
        );
        super(ScansGridField.Id.LastSavedTime, definition);
    }

    override getViewValue(record: Scan): RenderValue {
        return new DateTimeRenderValue(record.lastSavedTime);
    }
}
