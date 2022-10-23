import { Scan } from '../../lists/lists-internal-api';
import { StringId } from '../../res/res-internal-api';
import {
    DateTimeRenderValue,
    EnabledRenderValue,
    IntegerRenderValue,
    ModifiedRenderValue,
    RenderValue,
    StringRenderValue
} from "../../services/services-internal-api";
import { GridRecordField } from '../../sys/grid-revgrid-types';
import { UnreachableCaseError } from '../../sys/sys-internal-api';
import { GridRecordFieldState } from './grid-record-field-state';

export abstract class ScansGridField implements GridRecordField {
    constructor(
        readonly id: ScansGridField.Id,
        readonly name: string,
        readonly fieldStateDefinition: ScansGridField.FieldStateDefinition,
        readonly defaultVisible: boolean,
    ) {
    }

    abstract getValue(record: Scan): RenderValue;
}

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

    export interface FieldStateDefinition extends GridRecordFieldState {
        headerId: StringId;
        alignment: 'right' | 'left' | 'center';
    }

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

export class IdScansGridField extends ScansGridField {
    static readonly fieldStateDefinition: ScansGridField.FieldStateDefinition = {
        headerId: StringId.ScansGridHeading_Id,
        alignment: 'left',
    };

    constructor() {
        super(
            ScansGridField.Id.Id,
            Scan.Field.idToName(Scan.FieldId.Id),
            IdScansGridField.fieldStateDefinition,
            false,
        )
    }

    override getValue(record: Scan): RenderValue {
        return new StringRenderValue(record.id);
    }
}

export class IndexScansGridField extends ScansGridField {
    static readonly fieldStateDefinition: ScansGridField.FieldStateDefinition = {
        headerId: StringId.ScansGridHeading_Index,
        alignment: 'left',
    };

    constructor() {
        super(
            ScansGridField.Id.Index,
            Scan.Field.idToName(Scan.FieldId.Index),
            IndexScansGridField.fieldStateDefinition,
            false,
        )
    }

    override getValue(record: Scan): RenderValue {
        return new IntegerRenderValue(record.index);
    }
}

export class EnabledScansGridField extends ScansGridField {
    static readonly fieldStateDefinition: ScansGridField.FieldStateDefinition = {
        headerId: StringId.ScansGridHeading_Enabled,
        alignment: 'left',
    };

    constructor() {
        super(
            ScansGridField.Id.Enabled,
            Scan.Field.idToName(Scan.FieldId.Enabled),
            EnabledScansGridField.fieldStateDefinition,
            true,
        )
    }

    override getValue(record: Scan): RenderValue {
        return new EnabledRenderValue(record.enabled);
    }
}

export class NameScansGridField extends ScansGridField {
    static readonly fieldStateDefinition: ScansGridField.FieldStateDefinition = {
        headerId: StringId.ScansGridHeading_Name,
        alignment: 'left',
    };

    constructor() {
        super(
            ScansGridField.Id.Name,
            Scan.Field.idToName(Scan.FieldId.Name),
            NameScansGridField.fieldStateDefinition,
            true,
        )
    }

    override getValue(record: Scan): RenderValue {
        return new StringRenderValue(record.name);
    }
}

export class DescriptionScansGridField extends ScansGridField {
    static readonly fieldStateDefinition: ScansGridField.FieldStateDefinition = {
        headerId: StringId.ScansGridHeading_Description,
        alignment: 'left',
    };

    constructor() {
        super(
            ScansGridField.Id.Description,
            Scan.Field.idToName(Scan.FieldId.Description),
            DescriptionScansGridField.fieldStateDefinition,
            false,
        )
    }

    override getValue(record: Scan): RenderValue {
        return new StringRenderValue(record.description);
    }
}

export class SyncStatusIdScansGridField extends ScansGridField {
    static readonly fieldStateDefinition: ScansGridField.FieldStateDefinition = {
        headerId: StringId.ScansGridHeading_SyncStatusId,
        alignment: 'left',
    };

    constructor() {
        super(
            ScansGridField.Id.SyncStatusId,
            Scan.Field.idToName(Scan.FieldId.SyncStatusId),
            SyncStatusIdScansGridField.fieldStateDefinition,
            false,
        )
    }

    override getValue(record: Scan): RenderValue {
        return new Scan.SyncStatusIdRenderValue(record.syncStatusId);
    }
}

export class ConfigModifiedScansGridField extends ScansGridField {
    static readonly fieldStateDefinition: ScansGridField.FieldStateDefinition = {
        headerId: StringId.ScansGridHeading_ConfigModified,
        alignment: 'left',
    };

    constructor() {
        super(
            ScansGridField.Id.ConfigModified,
            Scan.Field.idToName(Scan.FieldId.ConfigModified),
            EnabledScansGridField.fieldStateDefinition,
            false,
        )
    }

    override getValue(record: Scan): RenderValue {
        return new ModifiedRenderValue(record.configModified);
    }
}

export class LastSavedTimeScansGridField extends ScansGridField {
    static readonly fieldStateDefinition: ScansGridField.FieldStateDefinition = {
        headerId: StringId.ScansGridHeading_LastSavedTime,
        alignment: 'right',
    };

    constructor() {
        super(
            ScansGridField.Id.LastSavedTime,
            Scan.Field.idToName(Scan.FieldId.LastSavedTime),
            LastSavedTimeScansGridField.fieldStateDefinition,
            false,
        )
    }

    override getValue(record: Scan): RenderValue {
        return new DateTimeRenderValue(record.lastSavedTime);
    }
}
