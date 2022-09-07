import { EditableScan } from '../../lists/lists-internal-api';
import { StringId } from '../../res/res-internal-api';
import {
    IntegerRenderValue,
    LitIvemIdArrayRenderValue,
    MarketIdArrayRenderValue, RenderValue,
    StringRenderValue
} from "../../services/services-internal-api";
import { UnreachableCaseError } from '../../sys/sys-internal-api';
import { GridRecordField } from '../grid-revgrid-types';
import { GridRecordFieldState } from './grid-record-field-state';

export abstract class ScansGridField implements GridRecordField {
    constructor(
        readonly id: ScansGridField.Id,
        readonly name: string,
        readonly fieldStateDefinition: ScansGridField.FieldStateDefinition,
        readonly defaultVisible: boolean,
    ) {
    }

    abstract getValue(record: EditableScan): RenderValue;
}

export namespace ScansGridField {
    export const enum Id {
        Id,
        Index,
        Name,
        Description,
        TargetTypeId,
        Targets,
        TargetMarkets,
        TargetLitIvemIds,
        MatchCount,
        CriteriaTypeId,
        ModifiedStatusId,
    }

    export const allIds = [
        Id.Id,
        Id.Index,
        Id.Name,
        Id.Description,
        Id.TargetTypeId,
        Id.Targets,
        Id.TargetMarkets,
        Id.TargetLitIvemIds,
        Id.MatchCount,
        Id.CriteriaTypeId,
        Id.ModifiedStatusId,
    ];

    export interface FieldStateDefinition extends GridRecordFieldState {
        headerId: StringId;
        alignment: 'right' | 'left' | 'center';
    }

    export function createField(id: Id): ScansGridField {
        switch(id) {
            case Id.Id: return new IdScansGridField();
            case Id.Index: return new IndexScansGridField();
            case Id.Name: return new NameScansGridField();
            case Id.Description: return new DescriptionScansGridField();
            case Id.TargetTypeId: return new TargetTypeIdScansGridField();
            case Id.Targets: return new TargetsScansGridField();
            case Id.TargetMarkets: return new TargetMarketsScansGridField();
            case Id.TargetLitIvemIds: return new TargetLitIvemIdsScansGridField();
            case Id.MatchCount: return new MatchCountScansGridField();
            case Id.CriteriaTypeId: return new CriteriaTypeIdScansGridField();
            case Id.ModifiedStatusId: return new ModifiedStatusIdScansGridField();
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
            EditableScan.Field.idToName(EditableScan.Field.Id.Id),
            IdScansGridField.fieldStateDefinition,
            false,
        )
    }

    override getValue(record: EditableScan): RenderValue {
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
            EditableScan.Field.idToName(EditableScan.Field.Id.Index),
            IndexScansGridField.fieldStateDefinition,
            false,
        )
    }

    override getValue(record: EditableScan): RenderValue {
        return new IntegerRenderValue(record.index);
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
            EditableScan.Field.idToName(EditableScan.Field.Id.Name),
            NameScansGridField.fieldStateDefinition,
            true,
        )
    }

    override getValue(record: EditableScan): RenderValue {
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
            EditableScan.Field.idToName(EditableScan.Field.Id.Description),
            DescriptionScansGridField.fieldStateDefinition,
            false,
        )
    }

    override getValue(record: EditableScan): RenderValue {
        return new StringRenderValue(record.description);
    }
}

export class TargetTypeIdScansGridField extends ScansGridField {
    static readonly fieldStateDefinition: ScansGridField.FieldStateDefinition = {
        headerId: StringId.ScansGridHeading_TargetTypeId,
        alignment: 'left',
    };

    constructor() {
        super(
            ScansGridField.Id.TargetTypeId,
            EditableScan.Field.idToName(EditableScan.Field.Id.TargetTypeId),
            TargetTypeIdScansGridField.fieldStateDefinition,
            false,
        )
    }

    override getValue(record: EditableScan): RenderValue {
        return new EditableScan.TargetTypeIdRenderValue(record.targetTypeId);
    }
}

export class TargetsScansGridField extends ScansGridField {
    static readonly fieldStateDefinition: ScansGridField.FieldStateDefinition = {
        headerId: StringId.ScansGridHeading_Targets,
        alignment: 'left',
    };

    constructor() {
        super(
            ScansGridField.Id.Targets,
            'Targets',
            TargetsScansGridField.fieldStateDefinition,
            true,
        )
    }

    override getValue(record: EditableScan): RenderValue {
        if (record.targetLitIvemIds !== undefined) {
            return new LitIvemIdArrayRenderValue(record.targetLitIvemIds);
        } else {
            if (record.targetMarketIds !== undefined) {
                return new MarketIdArrayRenderValue(record.targetMarketIds);
            } else {
                return new StringRenderValue(undefined);
            }
        }
    }
}

export class TargetMarketsScansGridField extends ScansGridField {
    static readonly fieldStateDefinition: ScansGridField.FieldStateDefinition = {
        headerId: StringId.ScansGridHeading_TargetMarkets,
        alignment: 'left',
    };

    constructor() {
        super(
            ScansGridField.Id.TargetMarkets,
            EditableScan.Field.idToName(EditableScan.Field.Id.TargetMarkets),
            TargetMarketsScansGridField.fieldStateDefinition,
            false,
        )
    }

    override getValue(record: EditableScan): RenderValue {
        return new MarketIdArrayRenderValue(record.targetMarketIds);
    }
}

export class TargetLitIvemIdsScansGridField extends ScansGridField {
    static readonly fieldStateDefinition: ScansGridField.FieldStateDefinition = {
        headerId: StringId.ScansGridHeading_TargetLitIvemIds,
        alignment: 'left',
    };

    constructor() {
        super(
            ScansGridField.Id.TargetLitIvemIds,
            EditableScan.Field.idToName(EditableScan.Field.Id.TargetLitIvemIds),
            TargetLitIvemIdsScansGridField.fieldStateDefinition,
            false,
        )
    }

    override getValue(record: EditableScan): RenderValue {
        return new LitIvemIdArrayRenderValue(record.targetLitIvemIds);
    }
}

export class MatchCountScansGridField extends ScansGridField {
    static readonly fieldStateDefinition: ScansGridField.FieldStateDefinition = {
        headerId: StringId.ScansGridHeading_MatchCount,
        alignment: 'left',
    };

    constructor() {
        super(
            ScansGridField.Id.MatchCount,
            EditableScan.Field.idToName(EditableScan.Field.Id.MatchCount),
            MatchCountScansGridField.fieldStateDefinition,
            true,
        )
    }

    override getValue(record: EditableScan): RenderValue {
        return new IntegerRenderValue(record.matchCount);
    }
}

export class CriteriaTypeIdScansGridField extends ScansGridField {
    static readonly fieldStateDefinition: ScansGridField.FieldStateDefinition = {
        headerId: StringId.ScansGridHeading_CriteriaTypeId,
        alignment: 'left',
    };

    constructor() {
        super(
            ScansGridField.Id.CriteriaTypeId,
            EditableScan.Field.idToName(EditableScan.Field.Id.CriteriaTypeId),
            CriteriaTypeIdScansGridField.fieldStateDefinition,
            true,
        )
    }

    override getValue(record: EditableScan): RenderValue {
        return new EditableScan.CriteriaTypeIdRenderValue(record.criteriaTypeId);
    }
}

export class ModifiedStatusIdScansGridField extends ScansGridField {
    static readonly fieldStateDefinition: ScansGridField.FieldStateDefinition = {
        headerId: StringId.ScansGridHeading_ModifiedStatusId,
        alignment: 'left',
    };

    constructor() {
        super(
            ScansGridField.Id.ModifiedStatusId,
            EditableScan.Field.idToName(EditableScan.Field.Id.ModifiedStatusId),
            ModifiedStatusIdScansGridField.fieldStateDefinition,
            false,
        )
    }

    override getValue(record: EditableScan): RenderValue {
        return new EditableScan.ModifiedStatusIdRenderValue(record.modifiedStatusId);
    }
}
