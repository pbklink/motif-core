/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService } from '../../../adi/adi-internal-api';
import { NamedJsonRankedLitIvemIdListsService } from '../../../ranked-lit-ivem-id-list/named-json-ranked-lit-ivem-id-lists-service';
import {
    NamedRankedLitIvemIdList,
    RankedLitIvemId,
    RankedLitIvemIdList,
    RankedLitIvemIdListFactoryService,
    RankedLitIvemIdListOrNamedReference,
    RankedLitIvemIdListOrNamedReferenceDefinition
} from "../../../ranked-lit-ivem-id-list/ranked-lit-ivem-id-list-internal-api";
import { AssertInternalError, ErrorCode, Integer, LockOpenListItem, Ok, Result, UnreachableCaseError } from '../../../sys/sys-internal-api';
import { TextFormatterService } from '../../../text-format/text-format-internal-api';
import {
    TableFieldSourceDefinition, TableFieldSourceDefinitionRegistryService
} from "../field-source/definition/grid-table-field-source-definition-internal-api";
import { RankedLitIvemIdTableRecordDefinition, TableRecordDefinition } from '../record-definition/grid-table-record-definition-internal-api';
import { TableRecord } from '../record/grid-table-record-internal-api';
import { RankedLitIvemIdTableValueSource, SecurityDataItemTableValueSource } from '../value-source/grid-table-value-source-internal-api';
import { BadnessListTableRecordSource } from './badness-list-table-record-source';
import { RankedLitIvemIdListTableRecordSourceDefinition } from './definition/grid-table-record-source-definition-internal-api';

export class RankedLitIvemIdListTableRecordSource extends BadnessListTableRecordSource<RankedLitIvemId, RankedLitIvemIdList> {
    private readonly _rankedLitIvemIdListOrNamedReference: RankedLitIvemIdListOrNamedReference

    private _lockedRankedLitIvemIdList: RankedLitIvemIdList;
    private _rankedLitIvemIdListLocked = false;
    private _lockedNamedRankedLitIvemIdList: NamedRankedLitIvemIdList | undefined;
    get lockedRankedLitIvemIdList() { return this._lockedRankedLitIvemIdList; }

    constructor(
        private readonly _adiService: AdiService,
        private readonly _litIvemIdListFactoryService: RankedLitIvemIdListFactoryService,
        private readonly _namedJsonRankedLitIvemIdListsService: NamedJsonRankedLitIvemIdListsService,
        textFormatterService: TextFormatterService,
        tableFieldSourceDefinitionRegistryService: TableFieldSourceDefinitionRegistryService,
        definition: RankedLitIvemIdListTableRecordSourceDefinition,
    ) {
        super(
            textFormatterService,
            tableFieldSourceDefinitionRegistryService,
            definition.typeId,
            RankedLitIvemIdListTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
        );

        this._rankedLitIvemIdListOrNamedReference = new RankedLitIvemIdListOrNamedReference(
            this._litIvemIdListFactoryService,
            this._namedJsonRankedLitIvemIdListsService,
            definition.rankedLitIvemIdListOrNamedReferenceDefinition,
        );
    }

    override createDefinition(): RankedLitIvemIdListTableRecordSourceDefinition {
        let rankedLitIvemIdListOrNamedReferenceDefinition: RankedLitIvemIdListOrNamedReferenceDefinition;
        if (this._lockedNamedRankedLitIvemIdList !== undefined ) {
            const id = this._lockedNamedRankedLitIvemIdList.id;
            rankedLitIvemIdListOrNamedReferenceDefinition = new RankedLitIvemIdListOrNamedReferenceDefinition(id);
        } else {
            if (this._rankedLitIvemIdListLocked) {
                const rankedLitIvemIdListDefinition = this.lockedRankedLitIvemIdList.createDefinition();
                rankedLitIvemIdListOrNamedReferenceDefinition = new RankedLitIvemIdListOrNamedReferenceDefinition(rankedLitIvemIdListDefinition);
            } else {
                throw new AssertInternalError('RLIILTRSCD75429');
            }
        }
        return new RankedLitIvemIdListTableRecordSourceDefinition(
            this.tableFieldSourceDefinitionRegistryService,
            rankedLitIvemIdListOrNamedReferenceDefinition,
        )
    }

    override tryLock(locker: LockOpenListItem.Locker): Result<void> {
        const lockResult = this._rankedLitIvemIdListOrNamedReference.tryLock(locker);
        if (lockResult.isErr()) {
            return lockResult.createOuter(ErrorCode.RankedLitIvemIdListTableRecordSource_TryLock);
        } else {
            const lockedRankedLitIvemIdList = this._rankedLitIvemIdListOrNamedReference.lockedRankedLitIvemIdList;
            if (lockedRankedLitIvemIdList === undefined) {
                throw new AssertInternalError('RLIILTRSTL75429');
            } else {
                this._lockedRankedLitIvemIdList = lockedRankedLitIvemIdList;
                this._lockedNamedRankedLitIvemIdList = this._rankedLitIvemIdListOrNamedReference.lockedNamedRankedLitIvemIdList;
                return new Ok(undefined);
            }
        }
    }

    override unlock(locker: LockOpenListItem.Locker) {
        this._rankedLitIvemIdListOrNamedReference.unlock(locker);
        this._rankedLitIvemIdListLocked = false;
        this._lockedNamedRankedLitIvemIdList = undefined;
    }


    override openLocked(opener: LockOpenListItem.Opener) {
        if (!this._rankedLitIvemIdListLocked) {
            throw new AssertInternalError('RLIILTRSOL75429')
        } else {
            this._lockedRankedLitIvemIdList.openLocked(opener);
        }
    }

    override closeLocked(opener: LockOpenListItem.Opener) {
        if (!this._rankedLitIvemIdListLocked) {
            throw new AssertInternalError('RLIILTRSCL75429')
        } else {
            this._lockedRankedLitIvemIdList.closeLocked(opener);
        }
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
        this._lockedRankedLitIvemIdList.openLocked(opener);
        return this._lockedRankedLitIvemIdList;
    }

    protected override unsubscribeList(opener: LockOpenListItem.Opener) {
        this._lockedRankedLitIvemIdList.closeLocked(opener);
    }

    protected override getDefaultFieldSourceDefinitionTypeIds() {
        return RankedLitIvemIdListTableRecordSourceDefinition.defaultFieldSourceDefinitionTypeIds;
    }
}
