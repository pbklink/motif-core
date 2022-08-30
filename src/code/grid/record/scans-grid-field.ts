import { StringId } from '../../res/res-internal-api';
import { Scan } from '../../scans/scans-internal-api';
import {
    IntegerRenderValue,
    LitIvemIdArrayRenderValue,
    MarketIdArrayRenderValue,
    MatchedRenderValue,
    RenderValue,
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

    abstract getValue(record: Scan): RenderValue;
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
        Matched,
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
        Id.Matched,
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
            case Id.Matched: return new MatchedScansGridField();
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
            Scan.Field.idToName(Scan.Field.Id.Id),
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
            Scan.Field.idToName(Scan.Field.Id.Index),
            IndexScansGridField.fieldStateDefinition,
            false,
        )
    }

    override getValue(record: Scan): RenderValue {
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
            Scan.Field.idToName(Scan.Field.Id.Name),
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
            Scan.Field.idToName(Scan.Field.Id.Description),
            DescriptionScansGridField.fieldStateDefinition,
            false,
        )
    }

    override getValue(record: Scan): RenderValue {
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
            Scan.Field.idToName(Scan.Field.Id.TargetTypeId),
            TargetTypeIdScansGridField.fieldStateDefinition,
            false,
        )
    }

    override getValue(record: Scan): RenderValue {
        return new Scan.TargetTypeIdRenderValue(record.targetTypeId);
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

    override getValue(record: Scan): RenderValue {
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
            Scan.Field.idToName(Scan.Field.Id.TargetMarkets),
            TargetMarketsScansGridField.fieldStateDefinition,
            false,
        )
    }

    override getValue(record: Scan): RenderValue {
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
            Scan.Field.idToName(Scan.Field.Id.TargetLitIvemIds),
            TargetLitIvemIdsScansGridField.fieldStateDefinition,
            false,
        )
    }

    override getValue(record: Scan): RenderValue {
        return new LitIvemIdArrayRenderValue(record.targetLitIvemIds);
    }
}

export class MatchedScansGridField extends ScansGridField {
    static readonly fieldStateDefinition: ScansGridField.FieldStateDefinition = {
        headerId: StringId.ScansGridHeading_Matched,
        alignment: 'left',
    };

    constructor() {
        super(
            ScansGridField.Id.Matched,
            Scan.Field.idToName(Scan.Field.Id.Matched),
            MatchedScansGridField.fieldStateDefinition,
            true,
        )
    }

    override getValue(record: Scan): RenderValue {
        return new MatchedRenderValue(record.matched);
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
            Scan.Field.idToName(Scan.Field.Id.CriteriaTypeId),
            CriteriaTypeIdScansGridField.fieldStateDefinition,
            true,
        )
    }

    override getValue(record: Scan): RenderValue {
        return new Scan.CriteriaTypeIdRenderValue(record.criteriaTypeId);
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
            Scan.Field.idToName(Scan.Field.Id.ModifiedStatusId),
            ModifiedStatusIdScansGridField.fieldStateDefinition,
            false,
        )
    }

    override getValue(record: Scan): RenderValue {
        return new Scan.ModifiedStatusIdRenderValue(record.modifiedStatusId);
    }
}
