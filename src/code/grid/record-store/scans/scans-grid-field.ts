import { StringId, Strings } from '../../../res/res-internal-api';
import { Scan } from '../../../scan/scan-internal-api';
import {
    DateTimeRenderValue,
    EnabledRenderValue,
    IntegerRenderValue,
    ModifiedRenderValue,
    RenderValue,
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
        Enabled,
        Name,
        Description,
        SyncStatusId,
        ConfigModified,
        LastSavedTime,
    }

    export const allIds = [
        Id.Id,
        Id.Index,
        Id.Enabled,
        Id.Name,
        Id.Description,
        Id.SyncStatusId,
        Id.ConfigModified,
        Id.LastSavedTime,
    ];

    export const sourceDefinition = new GridFieldSourceDefinition('Scans');

    export function createField(id: Id): ScansGridField {
        switch(id) {
            case Id.Id: return new IdScansGridField();
            case Id.Index: return new IndexScansGridField();
            case Id.Enabled: return new EnabledScansGridField();
            case Id.Name: return new NameScansGridField();
            case Id.Description: return new DescriptionScansGridField();
            case Id.SyncStatusId: return new SyncStatusIdScansGridField();
            case Id.ConfigModified: return new ConfigModifiedScansGridField();
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
export class EnabledScansGridField extends ScansGridField {
    constructor() {
        const definition = new GridFieldDefinition(
            ScansGridField.sourceDefinition,
            Scan.Field.idToName(Scan.FieldId.Enabled),
            Strings[StringId.ScansGridHeading_Enabled],
            GridFieldHorizontalAlign.left,
        );
        super(ScansGridField.Id.Enabled, definition);
    }

    override getViewValue(record: Scan): RenderValue {
        return new EnabledRenderValue(record.enabled);
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
export class SyncStatusIdScansGridField extends ScansGridField {
    constructor() {
        const definition = new GridFieldDefinition(
            ScansGridField.sourceDefinition,
            Scan.Field.idToName(Scan.FieldId.SyncStatusId),
            Strings[StringId.ScansGridHeading_SyncStatusId],
            GridFieldHorizontalAlign.left,
        );
        super(ScansGridField.Id.SyncStatusId, definition);
    }

    override getViewValue(record: Scan): RenderValue {
        return new Scan.SyncStatusIdRenderValue(record.syncStatusId);
    }
}

/** @internal */
export class ConfigModifiedScansGridField extends ScansGridField {
    constructor() {
        const definition = new GridFieldDefinition(
            ScansGridField.sourceDefinition,
            Scan.Field.idToName(Scan.FieldId.ConfigModified),
            Strings[StringId.ScansGridHeading_ConfigModified],
            GridFieldHorizontalAlign.left,
        );
        super(ScansGridField.Id.ConfigModified, definition);
    }

    override getViewValue(record: Scan): RenderValue {
        return new ModifiedRenderValue(record.configModified);
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
