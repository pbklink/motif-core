/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService } from '../../../adi/adi-internal-api';
import {
    RankedLitIvemId,
    RankedLitIvemIdList,
    RankedLitIvemIdListFactoryService
} from "../../../ranked-lit-ivem-id-list/ranked-lit-ivem-id-list-internal-api";
import { AssertInternalError, ErrorCode, Integer, LockOpenListItem, Ok, Result, UnreachableCaseError } from '../../../sys/sys-internal-api';
import { TextFormatterService } from '../../../text-format/text-format-internal-api';
import {
    TableFieldSourceDefinition
} from "../field-source/grid-table-field-source-internal-api";
import { RankedLitIvemIdTableRecordDefinition, TableRecordDefinition } from '../record-definition/grid-table-record-definition-internal-api';
import { TableRecord } from '../record/grid-table-record-internal-api';
import { RankedLitIvemIdTableValueSource, SecurityDataItemTableValueSource } from '../value-source/grid-table-value-source-internal-api';
import { BadnessListTableRecordSource } from './badness-list-table-record-source';
import { RankedLitIvemIdListTableRecordSourceDefinition, TableRecordSourceDefinitionFactoryService } from './definition/grid-table-record-source-definition-internal-api';

export class RankedLitIvemIdListTableRecordSource extends BadnessListTableRecordSource<RankedLitIvemId, RankedLitIvemIdList> {
    readonly declare definition: RankedLitIvemIdListTableRecordSourceDefinition;
    private _lockedRankedLitIvemIdList: RankedLitIvemIdList;

    constructor(
        private readonly _adiService: AdiService,
        private readonly _rankedLitIvemIdListFactoryService: RankedLitIvemIdListFactoryService,
        textFormatterService: TextFormatterService,
        tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        definition: RankedLitIvemIdListTableRecordSourceDefinition,
    ) {
        super(
            textFormatterService,
            tableRecordSourceDefinitionFactoryService,
            definition,
            RankedLitIvemIdListTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
        );
    }

    get lockedRankedLitIvemIdList() { return this._lockedRankedLitIvemIdList; }

    override createDefinition(): RankedLitIvemIdListTableRecordSourceDefinition {
        const list = this._lockedRankedLitIvemIdList;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (list === undefined) {
            throw new AssertInternalError('RLIILORCD50091');
        } else {
            const listDefinition = list.createDefinition();
            return this.tableRecordSourceDefinitionFactoryService.createRankedLitIvemIdList(listDefinition);
        }
    }

    override async tryLock(locker: LockOpenListItem.Locker): Promise<Result<void>> {
        const rankedLitIvemIdList = this._rankedLitIvemIdListFactoryService.createFromDefinition(this.definition.rankedLitIvemIdListDefinition);
        const lockResult = await rankedLitIvemIdList.tryLock(locker);
        if (lockResult.isErr()) {
            return lockResult.createOuterResolvedPromise(ErrorCode.RankedLitIvemIdListTableRecordSource_TryLock);
        } else {
            this._lockedRankedLitIvemIdList = rankedLitIvemIdList;
            return new Ok(undefined);
        }
    }

    override unlock(locker: LockOpenListItem.Locker) {
        this._lockedRankedLitIvemIdList.unlock(locker);
        this._lockedRankedLitIvemIdList = undefined as unknown as RankedLitIvemIdList;
    }

    override createRecordDefinition(idx: Integer): RankedLitIvemIdTableRecordDefinition {
        const rankedLitIvemId = this._lockedRankedLitIvemIdList.getAt(idx);
        const litIvemId = rankedLitIvemId.litIvemId;
        return {
            typeId: TableRecordDefinition.TypeId.RankedLitIvemId,
            mapKey: litIvemId.mapKey,
            rankedLitIvemId,
        };
    }

    override createTableRecord(recordIndex: Integer, eventHandlers: TableRecord.EventHandlers): TableRecord {
        const result = new TableRecord(recordIndex, eventHandlers);
        const rankedLitIvemId = this._lockedRankedLitIvemIdList.getAt(recordIndex);

        const fieldSources = this.activeFieldSources;
        const sourceCount = fieldSources.length;
        for (let i = 0; i < sourceCount; i++) {
            const fieldSource = fieldSources[i];
            const fieldSourceDefinition = fieldSource.definition;
            const fieldSourceDefinitionTypeId =
                fieldSourceDefinition.typeId as RankedLitIvemIdListTableRecordSourceDefinition.FieldSourceDefinitionTypeId;
            switch (fieldSourceDefinitionTypeId) {
                case TableFieldSourceDefinition.TypeId.SecurityDataItem: {
                    const valueSource = new SecurityDataItemTableValueSource(result.fieldCount, rankedLitIvemId.litIvemId, this._adiService);
                    result.addSource(valueSource);
                    break;
                }
                case TableFieldSourceDefinition.TypeId.RankedLitIvemId: {
                    const valueSource = new RankedLitIvemIdTableValueSource(result.fieldCount, rankedLitIvemId);
                    result.addSource(valueSource);
                    break;
                }
                default:
                    throw new UnreachableCaseError('LIITRSCTVK19909', fieldSourceDefinitionTypeId);
            }
        }

        return result;
    }

    // override userCanAdd() {
    //     return this._lockedRankedLitIvemIdList.userCanAdd;
    // }

    // override userCanRemove() {
    //     return this._lockedRankedLitIvemIdList.userCanRemove;
    // }

    // override userCanMove() {
    //     return this._lockedRankedLitIvemIdList.userCanMove;
    // }

    // override userAdd(recordDefinition: RankedLitIvemIdTableRecordDefinition) {
    //     return this._lockedRankedLitIvemIdList.userAdd(recordDefinition.rankedLitIvemId.litIvemId);
    // }

    // override userAddArray(recordDefinitions: RankedLitIvemIdTableRecordDefinition[]) {
    //     const litIvemIds = recordDefinitions.map((definition) => definition.rankedLitIvemId.litIvemId);
    //     this._lockedRankedLitIvemIdList.userAddArray(litIvemIds);
    // }

    // override userRemoveAt(recordIndex: Integer, removeCount: Integer) {
    //     this._lockedRankedLitIvemIdList.userRemoveAt(recordIndex, removeCount);
    // }

    // override userMoveAt(fromIndex: Integer, moveCount: Integer, toIndex: Integer) {
    //     this._lockedRankedLitIvemIdList.userMoveAt(fromIndex, moveCount, toIndex);
    // }

    protected override getCount() { return this._lockedRankedLitIvemIdList.count; }

    protected override subscribeList(opener: LockOpenListItem.Opener) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._lockedRankedLitIvemIdList === undefined) {
            throw new AssertInternalError('RLIILTRSOL75429')
        } else {
            this._lockedRankedLitIvemIdList.openLocked(opener);
            return this._lockedRankedLitIvemIdList;
        }
    }

    protected override unsubscribeList(opener: LockOpenListItem.Opener) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._lockedRankedLitIvemIdList === undefined) {
            throw new AssertInternalError('RLIILTRSCL75429')
        } else {
            this._lockedRankedLitIvemIdList.closeLocked(opener);
        }
    }

    protected override getDefaultFieldSourceDefinitionTypeIds() {
        return RankedLitIvemIdListTableRecordSourceDefinition.defaultFieldSourceDefinitionTypeIds;
    }
}
