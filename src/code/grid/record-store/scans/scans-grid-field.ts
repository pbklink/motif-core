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
import { GridFieldHAlign, GridRevRecordField, UnreachableCaseError } from '../../../sys/sys-internal-api';
import { GridField, GridFieldDefinition, GridFieldSourceDefinition } from '../../field/grid-field-internal-api';

/** @internal */
export abstract class ScansGridField extends GridField implements GridRevRecordField {
    constructor(
        readonly id: ScansGridField.Id,
        name: string,
        heading: string,
        hAlign: GridFieldHAlign,
    ) {
        const definition = new GridFieldDefinition(
            name,
            ScansGridField.sourceDefinition,
            heading,
            hAlign,
        );
        super(definition);
    }

    abstract override getValue(record: Scan): RenderValue;
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

    export class SourceDefinition extends GridFieldSourceDefinition {
    }

    export const sourceDefinition = new SourceDefinition('Scans');

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
        super(
            ScansGridField.Id.Id,
            Scan.Field.idToName(Scan.FieldId.Id),
            Strings[StringId.ScansGridHeading_Id],
            GridFieldHAlign.left
        );
    }

    override getValue(record: Scan): RenderValue {
        return new StringRenderValue(record.mapKey);
    }
}

/** @internal */
export class IndexScansGridField extends ScansGridField {
    constructor() {
        super(
            ScansGridField.Id.Index,
            Scan.Field.idToName(Scan.FieldId.Index),
            Strings[StringId.ScansGridHeading_Index],
            GridFieldHAlign.left
        );
    }

    override getValue(record: Scan): RenderValue {
        return new IntegerRenderValue(record.index);
    }
}

/** @internal */
export class EnabledScansGridField extends ScansGridField {
    constructor() {
        super(
            ScansGridField.Id.Enabled,
            Scan.Field.idToName(Scan.FieldId.Enabled),
            Strings[StringId.ScansGridHeading_Enabled],
            GridFieldHAlign.left
        );
    }

    override getValue(record: Scan): RenderValue {
        return new EnabledRenderValue(record.enabled);
    }
}

/** @internal */
export class NameScansGridField extends ScansGridField {
    constructor() {
        super(
            ScansGridField.Id.Name,
            Scan.Field.idToName(Scan.FieldId.Name),
            Strings[StringId.ScansGridHeading_Name],
            GridFieldHAlign.left
        );
    }

    override getValue(record: Scan): RenderValue {
        return new StringRenderValue(record.name);
    }
}

/** @internal */
export class DescriptionScansGridField extends ScansGridField {
    constructor() {
        super(
            ScansGridField.Id.Description,
            Scan.Field.idToName(Scan.FieldId.Description),
            Strings[StringId.ScansGridHeading_Description],
            GridFieldHAlign.left
        );
    }

    override getValue(record: Scan): RenderValue {
        return new StringRenderValue(record.description);
    }
}

/** @internal */
export class SyncStatusIdScansGridField extends ScansGridField {
    constructor() {
        super(
            ScansGridField.Id.SyncStatusId,
            Scan.Field.idToName(Scan.FieldId.SyncStatusId),
            Strings[StringId.ScansGridHeading_SyncStatusId],
            GridFieldHAlign.left
        );
    }

    override getValue(record: Scan): RenderValue {
        return new Scan.SyncStatusIdRenderValue(record.syncStatusId);
    }
}

/** @internal */
export class ConfigModifiedScansGridField extends ScansGridField {
    constructor() {
        super(
            ScansGridField.Id.ConfigModified,
            Scan.Field.idToName(Scan.FieldId.ConfigModified),
            Strings[StringId.ScansGridHeading_ConfigModified],
            GridFieldHAlign.left
        );
    }

    override getValue(record: Scan): RenderValue {
        return new ModifiedRenderValue(record.configModified);
    }
}

/** @internal */
export class LastSavedTimeScansGridField extends ScansGridField {
    constructor() {
        super(
            ScansGridField.Id.LastSavedTime,
            Scan.Field.idToName(Scan.FieldId.LastSavedTime),
            Strings[StringId.ScansGridHeading_LastSavedTime],
            GridFieldHAlign.right
        );
    }

    override getValue(record: Scan): RenderValue {
        return new DateTimeRenderValue(record.lastSavedTime);
    }
}
