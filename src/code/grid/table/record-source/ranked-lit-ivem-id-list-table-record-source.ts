/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, RankedLitIvemId } from '../../../adi/adi-internal-api';
import {
    LitIvemIdArrayRankedLitIvemIdListDefinition,
    LitIvemIdExecuteScanRankedLitIvemIdListDefinition,
    RankedLitIvemIdList,
    RankedLitIvemIdListDefinition,
    RankedLitIvemIdListFactoryService,
    ScanIdRankedLitIvemIdListDefinition
} from "../../../ranked-lit-ivem-id-list/ranked-lit-ivem-id-list-internal-api";
import { SymbolDetailCacheService } from '../../../services/symbol-detail-cache-service';
import { AssertInternalError, CorrectnessBadness, ErrorCode, Integer, LockOpenListItem, NotImplementedError, Ok, Result, UnreachableCaseError } from '../../../sys/internal-api';
import { TextFormatterService } from '../../../text-format/text-format-internal-api';
import { GridFieldCustomHeadingsService } from '../../field/grid-field-internal-api';
import {
    TypedTableFieldSourceDefinition, TypedTableFieldSourceDefinitionCachingFactoryService
} from "../field-source/grid-table-field-source-internal-api";
import { RankedLitIvemIdTableRecordDefinition } from '../record-definition/grid-table-record-definition-internal-api';
import { TableRecord } from '../record/grid-table-record-internal-api';
import { LitIvemBaseDetailTableValueSource, RankedLitIvemIdTableValueSource, SecurityDataItemTableValueSource } from '../value-source/internal-api';
import { RankedLitIvemIdListTableRecordSourceDefinition, ScanTestTableRecordSourceDefinition, WatchlistTableRecordSourceDefinition } from './definition/grid-table-record-source-definition-internal-api';
import { PromisedLitIvemBaseDetail } from './promised-lit-ivem-base-detail';
import { SubscribeBadnessListTableRecordSource } from './subscribe-badness-list-table-record-source';

export class RankedLitIvemIdListTableRecordSource extends SubscribeBadnessListTableRecordSource<RankedLitIvemId, RankedLitIvemIdList> {
    readonly declare definition: RankedLitIvemIdListTableRecordSourceDefinition;
    private _lockedRankedLitIvemIdList: RankedLitIvemIdList;

    constructor(
        private readonly _adiService: AdiService,
        private readonly _symbolDetailCacheService: SymbolDetailCacheService,
        private readonly _rankedLitIvemIdListFactoryService: RankedLitIvemIdListFactoryService,
        textFormatterService: TextFormatterService,
        gridFieldCustomHeadingsService: GridFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachingFactoryService: TypedTableFieldSourceDefinitionCachingFactoryService,
        correctnessBadness: CorrectnessBadness,
        definition: RankedLitIvemIdListTableRecordSourceDefinition,
    ) {
        super(
            textFormatterService,
            gridFieldCustomHeadingsService,
            tableFieldSourceDefinitionCachingFactoryService,
            correctnessBadness,
            definition,
            definition.allowedFieldSourceDefinitionTypeIds,
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

            switch (listDefinition.typeId) {
                case RankedLitIvemIdListDefinition.TypeId.LitIvemIdExecuteScan:
                    if (listDefinition instanceof LitIvemIdExecuteScanRankedLitIvemIdListDefinition) {
                        return new ScanTestTableRecordSourceDefinition(
                            this._gridFieldCustomHeadingsService,
                            this._tableFieldSourceDefinitionCachingFactoryService,
                            listDefinition,
                        );
                    } else {
                        throw new AssertInternalError('RLIILTRSCDLIIES44456', listDefinition.typeId.toString());
                    }
                case RankedLitIvemIdListDefinition.TypeId.ScanId:
                case RankedLitIvemIdListDefinition.TypeId.LitIvemIdArray:
                    return new WatchlistTableRecordSourceDefinition(
                        this._gridFieldCustomHeadingsService,
                        this._tableFieldSourceDefinitionCachingFactoryService,
                        listDefinition as (LitIvemIdArrayRankedLitIvemIdListDefinition | ScanIdRankedLitIvemIdListDefinition),
                    );
                case RankedLitIvemIdListDefinition.TypeId.WatchmakerListId:
                    throw new NotImplementedError('RLIILTRSCDWLI44456');
                default:
                    throw new UnreachableCaseError('RLIILTRSCDD44456', listDefinition.typeId);
            }
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
        return {
            typeId: TypedTableFieldSourceDefinition.TypeId.RankedLitIvemId,
            mapKey: RankedLitIvemIdTableRecordDefinition.createMapKey(rankedLitIvemId),
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
            const fieldSourceDefinitionTypeId = fieldSourceDefinition.typeId as RankedLitIvemIdListTableRecordSourceDefinition.FieldSourceDefinitionTypeId;
            if (this.allowedFieldSourceDefinitionTypeIds.includes(fieldSourceDefinitionTypeId)) {
                switch (fieldSourceDefinitionTypeId) {
                    case TypedTableFieldSourceDefinition.TypeId.LitIvemBaseDetail: {
                        const litIvemBaseDetail = new PromisedLitIvemBaseDetail(this._symbolDetailCacheService, rankedLitIvemId.litIvemId);
                        const valueSource = new LitIvemBaseDetailTableValueSource(
                            result.fieldCount,
                            litIvemBaseDetail,
                            rankedLitIvemId,
                        );
                        result.addSource(valueSource);
                        break;
                    }

                    case TypedTableFieldSourceDefinition.TypeId.SecurityDataItem: {
                        const valueSource = new SecurityDataItemTableValueSource(result.fieldCount, rankedLitIvemId.litIvemId, this._adiService);
                        result.addSource(valueSource);
                        break;
                    }
                    case TypedTableFieldSourceDefinition.TypeId.RankedLitIvemId: {
                        const valueSource = new RankedLitIvemIdTableValueSource(result.fieldCount, rankedLitIvemId);
                        result.addSource(valueSource);
                        break;
                    }
                    default:
                        throw new UnreachableCaseError('LIITRSCTVK19909', fieldSourceDefinitionTypeId);
                }
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
        return this.definition.defaultFieldSourceDefinitionTypeIds;
    }
}
