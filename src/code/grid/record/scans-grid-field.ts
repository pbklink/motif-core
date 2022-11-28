import { StringId, Strings } from '../../res/res-internal-api';
import { Scan } from '../../scan/scan-internal-api';
import {
    DateTimeRenderValue,
    EnabledRenderValue,
    IntegerRenderValue,
    ModifiedRenderValue,
    RenderValue,
    StringRenderValue
} from "../../services/services-internal-api";
import { GridHalign, GridHalignEnum, GridRecordField } from '../../sys/grid-revgrid-types';
import { UnreachableCaseError } from '../../sys/sys-internal-api';

/** @internal */
export abstract class ScansGridField implements GridRecordField {
    constructor(
        readonly id: ScansGridField.Id,
        readonly name: string,
        readonly initialHeading: string,
        readonly initialTextAlign: GridHalign,
    ) {
    }

    abstract getValue(record: Scan): RenderValue;
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
            GridHalignEnum.Left
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
            GridHalignEnum.Left
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
            GridHalignEnum.Left
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
            GridHalignEnum.Left
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
            GridHalignEnum.Left
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
            GridHalignEnum.Left
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
            GridHalignEnum.Left
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
            GridHalignEnum.Right
        );
    }

    override getValue(record: Scan): RenderValue {
        return new DateTimeRenderValue(record.lastSavedTime);
    }
}
