/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    CallOrPutId,
    IvemId,
    LitIvemId,
    SearchSymbolsDataDefinition,
    SearchSymbolsLitIvemFullDetail,
    SymbolFieldId,
    SymbolsDataItem
} from '../../../adi/adi-internal-api';
import { CallPut } from '../../../services/services-internal-api';
import {
    AssertInternalError,
    Badness,
    Integer,
    LockOpenListItem,
    MultiEvent,
    UnreachableCaseError,
    UsableListChangeTypeId,
    logger,
    newDecimal
} from '../../../sys/internal-api';
import { TextFormatterService } from '../../../text-format/text-format-internal-api';
import {
    TableFieldSourceDefinition
} from "../field-source/grid-table-field-source-internal-api";
import { CallPutTableRecordDefinition, TableRecordDefinition } from '../record-definition/grid-table-record-definition-internal-api';
import { TableRecord } from '../record/grid-table-record-internal-api';
import { CallPutTableValueSource, SecurityDataItemTableValueSource } from '../value-source/internal-api';
import { CallPutFromUnderlyingTableRecordSourceDefinition } from './definition/call-put-from-underlying-table-record-source-definition';
import { TableRecordSourceDefinitionFactoryService } from './definition/grid-table-record-source-definition-internal-api';
import { SingleDataItemTableRecordSource } from './single-data-item-table-record-source';

/** @public */
export class CallPutFromUnderlyingTableRecordSource extends SingleDataItemTableRecordSource {

    private readonly _underlyingIvemId: IvemId;

    private _recordList: CallPut[] = [];

    private _dataItem: SymbolsDataItem;
    private _dataItemSubscribed = false;
    // private _litIvemDetails: LitIvemDetail[];
    private _dataItemListChangeEventSubscriptionId: MultiEvent.SubscriptionId;
    private _dataItemBadnessChangeEventSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        private readonly _adiService: AdiService,
        textFormatterService: TextFormatterService,
        tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        definition: CallPutFromUnderlyingTableRecordSourceDefinition,
    ) {
        super(
            textFormatterService,
            tableRecordSourceDefinitionFactoryService,
            definition,
            CallPutFromUnderlyingTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
        );
        this._underlyingIvemId = definition.underlyingIvemId;
    }

    override createDefinition(): CallPutFromUnderlyingTableRecordSourceDefinition {
        return this.tableRecordSourceDefinitionFactoryService.createCallPutFromUnderlying(this._underlyingIvemId.createCopy());
    }

    override createRecordDefinition(idx: Integer): CallPutTableRecordDefinition {
        const record = this._recordList[idx];
        return {
            typeId: TableRecordDefinition.TypeId.CallPut,
            mapKey: record.createKey().mapKey,
            record,
        };
    }

    override createTableRecord(recordIndex: Integer, eventHandlers: TableRecord.EventHandlers): TableRecord {
        const result = new TableRecord(recordIndex, eventHandlers);
        const callPut = this._recordList[recordIndex];

        const fieldSources = this.activeFieldSources;
        const sourceCount = fieldSources.length;
        for (let i = 0; i < sourceCount; i++) {
            const fieldSource = fieldSources[i];
            const fieldSourceDefinition = fieldSource.definition;
            const fieldSourceDefinitionTypeId =
                fieldSourceDefinition.typeId as CallPutFromUnderlyingTableRecordSourceDefinition.FieldSourceDefinitionTypeId;
            switch (fieldSourceDefinitionTypeId) {
                case TableFieldSourceDefinition.TypeId.CallPut: {
                    const valueSource = new CallPutTableValueSource(result.fieldCount, callPut);
                    result.addSource(valueSource);
                    break;
                }
                case TableFieldSourceDefinition.TypeId.CallSecurityDataItem: {
                    const litIvemId = callPut.callLitIvemId;
                    if (litIvemId === undefined) {
                        throw new AssertInternalError('CPFUTRSCTRC68409');
                    } else {
                        // below may not bind to fields correctly - check when testing
                        const valueSource = new SecurityDataItemTableValueSource(result.fieldCount, litIvemId, this._adiService);
                        result.addSource(valueSource);
                    }
                    break;
                }
                case TableFieldSourceDefinition.TypeId.PutSecurityDataItem: {
                    const litIvemId = callPut.putLitIvemId;
                    if (litIvemId === undefined) {
                        throw new AssertInternalError('CPFUTRSCTRC68409');
                    } else {
                        // below may not bind to fields correctly - check when testing
                        const valueSource = new SecurityDataItemTableValueSource(result.fieldCount, litIvemId, this._adiService);
                        result.addSource(valueSource);
                    }
                    break;
                }
                default:
                    throw new UnreachableCaseError('CPFUTRSCTVL77752', fieldSourceDefinitionTypeId);
            }
        }

        return result;
    }

    override openLocked(opener: LockOpenListItem.Opener) {
        const definition = new SearchSymbolsDataDefinition();

        const condition: SearchSymbolsDataDefinition.Condition = {
            text: this._underlyingIvemId.code,
            fieldIds: [SymbolFieldId.Base],
            isCaseSensitive: false,
            matchIds: [SearchSymbolsDataDefinition.Condition.MatchId.exact],
        };
        definition.exchangeId = this._underlyingIvemId.exchangeId;
        definition.conditions = [condition];
        this._dataItem = this._adiService.subscribe(definition) as SymbolsDataItem;
        this._dataItemSubscribed = true;
        super.setSingleDataItem(this._dataItem);
        this._dataItemListChangeEventSubscriptionId = this._dataItem.subscribeListChangeEvent(
            (listChangeTypeId, idx, count) => { this.handleDataItemListChangeEvent(listChangeTypeId, idx, count); }
        );
        this._dataItemBadnessChangeEventSubscriptionId = this._dataItem.subscribeBadnessChangeEvent(
            () => { this.handleDataItemBadnessChangeEvent(); }
        );

        super.openLocked(opener);

        if (this._dataItem.usable) {
            const newCount = this._dataItem.records.length;
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
            throw new AssertInternalError('CPFUTRDL234332', '');
        } else {
            this._dataItem.unsubscribeListChangeEvent(this._dataItemListChangeEventSubscriptionId);
            this._dataItemListChangeEventSubscriptionId = undefined;
            this._dataItem.unsubscribeBadnessChangeEvent(this._dataItemBadnessChangeEventSubscriptionId);
            this._dataItemBadnessChangeEventSubscriptionId = undefined;

            super.closeLocked(opener);

            this._adiService.unsubscribe(this._dataItem);
            this._dataItemSubscribed = false;
        }
    }

    protected getCount() { return this._recordList.length; }

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
        return CallPutFromUnderlyingTableRecordSourceDefinition.defaultFieldSourceDefinitionTypeIds;
    }

    private handleDataItemListChangeEvent(listChangeTypeId: UsableListChangeTypeId, idx: Integer, count: Integer) {
        this.processDataItemListChange(listChangeTypeId, idx, count);
    }

    private handleDataItemBadnessChangeEvent() {
        this.checkSetUnusable(this._dataItem.badness);
    }

    private processDataItemListChange(listChangeTypeId: UsableListChangeTypeId, idx: Integer, count: Integer) {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable:
                this.setUnusable(this._dataItem.badness);
                break;
            case UsableListChangeTypeId.PreUsableClear:
                this.setUnusable(Badness.preUsableClear);
                this._recordList.length = 0;
                break;
            case UsableListChangeTypeId.PreUsableAdd:
                this.setUnusable(Badness.preUsableAdd);
                break;
            case UsableListChangeTypeId.Usable:
                this.processDataItemUsable();
                break;
            case UsableListChangeTypeId.Insert:
                // no action
                break;
            case UsableListChangeTypeId.BeforeReplace:
                throw new AssertInternalError('CPFUTRSPDILCBR19662');
            case UsableListChangeTypeId.AfterReplace:
                throw new AssertInternalError('CPFUTRSPDILCAR19662');
            case UsableListChangeTypeId.BeforeMove:
                throw new AssertInternalError('CPFUTRSPDILCBM19662');
            case UsableListChangeTypeId.AfterMove:
                throw new AssertInternalError('CPFUTRSPDILCAM19662');
            case UsableListChangeTypeId.Remove:
                this.checkUsableNotifyListChange(UsableListChangeTypeId.Remove, idx, count);
                this._recordList.splice(idx, count);
                break;
            case UsableListChangeTypeId.Clear:
                this.notifyListChange(UsableListChangeTypeId.Clear, idx, count);
                this._recordList.length = 0;
                break;
            default:
                throw new UnreachableCaseError('SDITRDLPDILC83372992', listChangeTypeId);
        }
    }

    private processDataItemUsable() {
        const symbolDetails = this._dataItem.records;
        const newRecordList = this.createRecordList(symbolDetails);
        this._recordList.splice(0, 0, ...newRecordList);

        this.setUsable(this._dataItem.badness);
    }

    private createRecordList(symbolDetails: SearchSymbolsLitIvemFullDetail[]) {
        const symbolDetailCount = symbolDetails.length;
        const newRecordList = new Array<CallPut>(symbolDetailCount);
        let count = 0;
        const existingIndexMap = new Map<string, Integer>();
        for (let i = 0; i < symbolDetailCount; i++) {
            const symbolDetail = symbolDetails[i];
            const callPutKey = this.createKeyFromSymbolDetail(symbolDetail);
            if (callPutKey !== undefined) {
                const callPutMapKey = callPutKey.mapKey;
                const existingIndex = existingIndexMap.get(callPutMapKey);
                if (existingIndex === undefined) {
                    const newCallPut = this.createCallPutFromKeyAndSymbolDetail(callPutKey, symbolDetail);
                    if (newCallPut !== undefined) {
                        existingIndexMap.set(callPutMapKey, count);
                        newRecordList[count++] = newCallPut;
                    }
                } else {
                    const existingCallPut = newRecordList[existingIndex];
                    const callOrPutId = symbolDetail.callOrPutId;
                    if (callOrPutId === undefined) {
                        logger.logDataError('CPFUTSUCPFSU22995', symbolDetail.litIvemId.name);
                    } else {
                        const litIvemId = symbolDetail.litIvemId;
                        switch (callOrPutId) {
                            case CallOrPutId.Call:
                                if (existingCallPut.callLitIvemId !== undefined) {
                                    logger.logDataError('CPUATSUPCPFSC90445', `${existingCallPut.callLitIvemId.name} ${litIvemId.name}`);
                                } else {
                                    existingCallPut.callLitIvemId = litIvemId;
                                }
                                break;
                            case CallOrPutId.Put:
                                if (existingCallPut.putLitIvemId !== undefined) {
                                    logger.logDataError('CPUATSUPCPFSP33852', `${existingCallPut.putLitIvemId.name} ${litIvemId.name}`);
                                } else {
                                    existingCallPut.putLitIvemId = litIvemId;
                                }
                                break;
                            default:
                                throw new UnreachableCaseError('CPUATSUPCPFSD98732', callOrPutId);
                        }
                    }
                }
            }
        }

        newRecordList.length = count;
        return newRecordList;
    }

    private createKeyFromSymbolDetail(symbolInfo: SymbolsDataItem.Record): CallPut.Key | undefined {
        const exercisePrice = symbolInfo.strikePrice;
        if (exercisePrice === undefined) {
            logger.logDataError('CPFUTSCKFSP28875', symbolInfo.litIvemId.name);
            return undefined;
        } else {
            const expiryDate = symbolInfo.expiryDate;
            if (expiryDate === undefined) {
                logger.logDataError('CPFUTSCKFSD18557', symbolInfo.litIvemId.name);
                return undefined;
            } else {
                const litId = symbolInfo.litIvemId.litId;
                return new CallPut.Key(exercisePrice, expiryDate.utcMidnight, litId);
            }
        }
    }

    private createCallPutFromKeyAndSymbolDetail(key: CallPut.Key, symbolInfo: SymbolsDataItem.Record): CallPut | undefined {
        const exercisePrice = key.exercisePrice;
        const expiryDate = key.expiryDate;
        const litId = key.litId;
        const callOrPutId = symbolInfo.callOrPutId;
        if (callOrPutId === undefined) {
            logger.logDataError('CPFUTSCCPFKASCP22887', symbolInfo.litIvemId.name);
            return undefined;
        } else {
            const litIvemId = symbolInfo.litIvemId;
            let callLitIvemId: LitIvemId | undefined;
            let putLitIvemId: LitIvemId | undefined;
            switch (callOrPutId) {
                case CallOrPutId.Call:
                    callLitIvemId = litIvemId;
                    break;
                case CallOrPutId.Put:
                    putLitIvemId = litIvemId;
                    break;
                default:
                    throw new UnreachableCaseError('CPFUTSCCPFKASD11134', callOrPutId);
            }
            const symbolInfoExerciseTypeId = symbolInfo.exerciseTypeId;
            if (symbolInfoExerciseTypeId === undefined) {
                logger.logDataError('CPFUTSCCPFKASE99811', symbolInfo.name);
                return undefined;
            } else {
                const exerciseTypeId = symbolInfoExerciseTypeId;

                const symbolInfoContractMultipler = symbolInfo.contractSize;
                if (symbolInfoContractMultipler === undefined) {
                    logger.logDataError('CPFUTSCCPFKASC44477', symbolInfo.litIvemId.name);
                    return undefined;
                } else {
                    const contractMultiplier = newDecimal(symbolInfoContractMultipler);
                    // currently do not need underlyingIvemId or underlyingIsIndex
                    return new CallPut(
                        exercisePrice,
                        expiryDate,
                        litId,
                        contractMultiplier,
                        exerciseTypeId,
                        undefined,
                        undefined,
                        callLitIvemId,
                        putLitIvemId,
                    );
                }
            }
        }
    }
}
