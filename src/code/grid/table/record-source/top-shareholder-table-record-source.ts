/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    LitIvemId,
    TopShareholder,
    TopShareholdersDataDefinition,
    TopShareholdersDataItem
} from "../../../adi/internal-api";
import { RevFieldCustomHeadingsService } from '../../../rev/internal-api';
import {
    AssertInternalError,
    Badness,
    CorrectnessBadness,
    Integer,
    LockOpenListItem,
    MultiEvent, UnreachableCaseError,
    UsableListChangeTypeId,
    newUndefinableDate
} from "../../../sys/internal-api";
import { TextFormatterService } from '../../../text-format/internal-api';
import {
    TableFieldSourceDefinition, TableFieldSourceDefinitionCachingFactoryService
} from "../field-source/internal-api";
import { TopShareholderTableRecordDefinition } from '../record-definition/internal-api';
import { TableRecord } from '../record/internal-api';
import { TopShareholderTableValueSource } from '../value-source/internal-api';
import { TopShareholderTableRecordSourceDefinition } from './definition/top-shareholder-table-record-source-definition';
import { SingleDataItemTableRecordSource } from './single-data-item-table-record-source';

/** @public */
export class TopShareholderTableRecordSource extends SingleDataItemTableRecordSource {
    readonly recordList: TopShareholder[] = [];

    private readonly _litIvemId: LitIvemId;
    private readonly _tradingDate: Date | undefined;
    private readonly _compareToTradingDate: Date | undefined;

    private _dataItem: TopShareholdersDataItem;
    private _dataItemSubscribed = false;
    private _listChangeEventSubscriptionId: MultiEvent.SubscriptionId;
    private _badnessChangedEventSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        private readonly _adiService: AdiService,
        textFormatterService: TextFormatterService,
        gridFieldCustomHeadingsService: RevFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachingFactoryService: TableFieldSourceDefinitionCachingFactoryService,
        correctnessBadness: CorrectnessBadness,
        definition: TopShareholderTableRecordSourceDefinition,
    ) {
        super(
            textFormatterService,
            gridFieldCustomHeadingsService,
            tableFieldSourceDefinitionCachingFactoryService,
            correctnessBadness,
            definition,
            TopShareholderTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
        );

        this._litIvemId = definition.litIvemId;
        this._tradingDate = definition.tradingDate;
        this._compareToTradingDate = definition.compareToTradingDate;
    }

    override createDefinition(): TopShareholderTableRecordSourceDefinition {
        return new TopShareholderTableRecordSourceDefinition(
            this._gridFieldCustomHeadingsService,
            this._tableFieldSourceDefinitionCachingFactoryService,
            this._litIvemId.createCopy(),
            newUndefinableDate(this._tradingDate),
            newUndefinableDate(this._compareToTradingDate),
        );
    }

    override createRecordDefinition(idx: Integer): TopShareholderTableRecordDefinition {
        const record = this.recordList[idx];
        return {
            typeId: TableFieldSourceDefinition.TypeId.TopShareholder,
            mapKey: record.createKey().mapKey,
            record,
        };
    }

    override createTableRecord(recordIndex: Integer, eventHandlers: TableRecord.EventHandlers): TableRecord {
        const result = new TableRecord(recordIndex, eventHandlers);
        const topShareholder = this.recordList[recordIndex];

        const fieldSources = this.activeFieldSources;
        const sourceCount = fieldSources.length;
        for (let i = 0; i < sourceCount; i++) {
            const fieldSource = fieldSources[i];
            const fieldSourceDefinition = fieldSource.definition;
            const fieldSourceDefinitionTypeId =
                fieldSourceDefinition.typeId as TopShareholderTableRecordSourceDefinition.FieldSourceDefinitionTypeId;
            switch (fieldSourceDefinitionTypeId) {
                case TableFieldSourceDefinition.TypeId.TopShareholder: {
                    const valueSource = new TopShareholderTableValueSource(result.fieldCount, topShareholder, this._dataItem);
                    result.addSource(valueSource);
                    break;
                }
                default:
                    throw new UnreachableCaseError('TSTRSCTVL43309', fieldSourceDefinitionTypeId);
            }
        }

        return result;
    }

    override openLocked(opener: LockOpenListItem.Opener) {
        const definition = new TopShareholdersDataDefinition();

        definition.litIvemId = this._litIvemId;
        definition.tradingDate = this._tradingDate;
        definition.compareToTradingDate = this._compareToTradingDate;

        this._dataItem = this._adiService.subscribe(definition) as TopShareholdersDataItem;
        this._dataItemSubscribed = true;
        super.setSingleDataItem(this._dataItem);
        this._listChangeEventSubscriptionId = this._dataItem.subscribeListChangeEvent(
                (listChangeTypeId, idx, count) => { this.handleDataItemListChangeEvent(listChangeTypeId, idx, count); }
        );
        this._badnessChangedEventSubscriptionId = this._dataItem.subscribeBadnessChangedEvent(
            () => { this.handleDataItembadnessChangedEvent(); }
        );

        super.openLocked(opener);

        if (this._dataItem.usable) {
            const newCount = this._dataItem.count;
            if (newCount > 0) {
                this.processDataItemListChange(UsableListChangeTypeId.PreUsableAdd, 0, newCount);
            }
            this.processDataItemListChange(UsableListChangeTypeId.Usable, 0, 0);
        } else {
            this.processDataItemListChange(UsableListChangeTypeId.Unusable, 0, 0);
        }
    }

    override closeLocked(opener: LockOpenListItem.Opener) {
        // TableRecordDefinitionList can no longer be used after it is deactivated
        if (this.count > 0) {
            this.notifyListChange(UsableListChangeTypeId.Clear, 0, 0);
        }

        if (!this._dataItemSubscribed) {
            throw new AssertInternalError('TSHTRDLD29987', '');
        } else {
            this._dataItem.unsubscribeListChangeEvent(this._listChangeEventSubscriptionId);
            this._listChangeEventSubscriptionId = undefined;
            this._dataItem.unsubscribeBadnessChangedEvent(this._badnessChangedEventSubscriptionId);
            this._badnessChangedEventSubscriptionId = undefined;

            super.closeLocked(opener);

            this._adiService.unsubscribe(this._dataItem);
            this._dataItemSubscribed = false;
        }
    }

    protected getCount() { return this.recordList.length; }

    protected override processUsableChanged() {
        if (this.usable) {
            this.notifyListChange(UsableListChangeTypeId.PreUsableClear, 0, 0);
            const count = this.count;
            if (count > 0) {
                this.notifyListChange(UsableListChangeTypeId.PreUsableAdd, 0, count);
            }
            this.notifyListChange(UsableListChangeTypeId.Usable, 0, 0);
        } else {
            this.notifyListChange(UsableListChangeTypeId.Unusable, 0, 0);
        }
    }

    protected override getDefaultFieldSourceDefinitionTypeIds() {
        return TopShareholderTableRecordSourceDefinition.defaultFieldSourceDefinitionTypeIds;
    }

    private handleDataItemListChangeEvent(listChangeTypeId: UsableListChangeTypeId, idx: Integer, count: Integer) {
        this.processDataItemListChange(listChangeTypeId, idx, count);
    }

    private handleDataItembadnessChangedEvent() {
        this.checkSetUnusable(this._dataItem.badness);
    }

    private insertRecordDefinition(idx: Integer, count: Integer) {
        if (count === 1) {
            const topShareholder = this._dataItem.topShareholders[idx];
            if (idx === this.recordList.length) {
                this.recordList.push(topShareholder);
            } else {
                this.recordList.splice(idx, 0, topShareholder);
            }
        } else {
            const topShareholders = new Array<TopShareholder>(count);
            let insertArrayIdx = 0;
            for (let i = idx; i < idx + count; i++) {
                const topShareholder = this._dataItem.topShareholders[i];
                topShareholders[insertArrayIdx++] = topShareholder;
            }
            this.recordList.splice(idx, 0, ...topShareholders);
        }
    }

    private processDataItemListChange(listChangeTypeId: UsableListChangeTypeId, idx: Integer, count: Integer) {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable:
                this.setUnusable(this._dataItem.badness);
                break;
            case UsableListChangeTypeId.PreUsableClear:
                this.setUnusable(Badness.preUsableClear);
                this.recordList.length = 0;
                break;
            case UsableListChangeTypeId.PreUsableAdd:
                this.setUnusable(Badness.preUsableAdd);
                this.insertRecordDefinition(idx, count);
                break;
            case UsableListChangeTypeId.Usable:
                this.setUsable(this._dataItem.badness);
                break;
            case UsableListChangeTypeId.Insert:
                this.insertRecordDefinition(idx, count);
                this.checkUsableNotifyListChange(UsableListChangeTypeId.Insert, idx, count);
                break;
            case UsableListChangeTypeId.BeforeReplace:
                throw new AssertInternalError('GLDCERTRSPDILCBR19662');
            case UsableListChangeTypeId.AfterReplace:
                throw new AssertInternalError('GLDCERTRSPDILCAR19662');
            case UsableListChangeTypeId.BeforeMove:
                throw new AssertInternalError('GLDCERTRSPDILCBM19662');
            case UsableListChangeTypeId.AfterMove:
                throw new AssertInternalError('GLDCERTRSPDILCAM19662');
            case UsableListChangeTypeId.Remove:
                this.checkUsableNotifyListChange(UsableListChangeTypeId.Remove, idx, count);
                this.recordList.splice(idx, count);
                break;
            case UsableListChangeTypeId.Clear:
                this.notifyListChange(UsableListChangeTypeId.Clear, idx, count);
                this.recordList.length = 0;
                break;
            default:
                throw new UnreachableCaseError('GLDCERTRSPDILCD983338', listChangeTypeId);
        }
    }
}
