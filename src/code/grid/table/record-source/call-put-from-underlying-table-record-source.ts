/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Decimal } from 'decimal.js-light';
import {
    AdiService,
    CallOrPutId, IvemId, SearchSymbolsDataDefinition, SymbolFieldId,
    SymbolsDataItem
} from "../../../adi/adi-internal-api";
import { CallPut } from '../../../services/services-internal-api';
import {
    AssertInternalError,
    Badness,
    Integer,
    isDecimalEqual,
    LockOpenListItem,
    Logger,
    MultiEvent,
    UnreachableCaseError,
    UsableListChangeTypeId
} from '../../../sys/sys-internal-api';
import { TextFormatterService } from '../../../text-format/text-format-internal-api';
import {
    TableFieldCustomHeadingsService,
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionRegistryService
} from "../field-source/grid-table-field-source-internal-api";
import { CallPutTableRecordDefinition, TableRecordDefinition } from '../record-definition/grid-table-record-definition-internal-api';
import { TableRecord } from '../record/grid-table-record-internal-api';
import { CallPutTableValueSource, SecurityDataItemTableValueSource } from '../value-source/grid-table-value-source-internal-api';
import { CallPutFromUnderlyingTableRecordSourceDefinition } from './definition/call-put-from-underlying-table-record-source-definition';
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
        tableFieldSourceDefinitionRegistryService: TableFieldSourceDefinitionRegistryService,
        tableFieldCustomHeadingsService: TableFieldCustomHeadingsService,
        definition: CallPutFromUnderlyingTableRecordSourceDefinition,
    ) {
        super(
            textFormatterService,
            tableFieldSourceDefinitionRegistryService,
            tableFieldCustomHeadingsService,
            definition.typeId,
            CallPutFromUnderlyingTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
        );
        this._underlyingIvemId = definition.underlyingIvemId;
    }

    override createDefinition(): CallPutFromUnderlyingTableRecordSourceDefinition {
        return new CallPutFromUnderlyingTableRecordSourceDefinition(this.tableFieldSourceDefinitionRegistryService, this._underlyingIvemId);
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
                    // below may not bind to fields correctly - check when testing
                    const valueSource = new SecurityDataItemTableValueSource(result.fieldCount, callPut.callLitIvemId, this._adiService);
                    result.addSource(valueSource);
                    break;
                }
                case TableFieldSourceDefinition.TypeId.PutSecurityDataItem: {
                    // below may not bind to fields correctly - check when testing
                    const valueSource = new SecurityDataItemTableValueSource(result.fieldCount, callPut.putLitIvemId, this._adiService);
                    result.addSource(valueSource);
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

        if (this._underlyingIvemId !== undefined) {
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
                (listChangeTypeId, idx, count) => this.handleDataItemListChangeEvent(listChangeTypeId, idx, count)
            );
            this._dataItemBadnessChangeEventSubscriptionId = this._dataItem.subscribeBadnessChangeEvent(
                () => this.handleDataItemBadnessChangeEvent()
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
            case UsableListChangeTypeId.Replace:
                throw new AssertInternalError('CPFUTRSPDILC19662');
            case UsableListChangeTypeId.Remove:
                this.checkUsableNotifyListChange(UsableListChangeTypeId.Remove, idx, count);
                this._recordList.splice(idx, count);
                break;
            case UsableListChangeTypeId.Clear:
                this.checkUsableNotifyListChange(UsableListChangeTypeId.Clear, idx, count);
                this._recordList.length = 0;
                break;
            default:
                throw new UnreachableCaseError('SDITRDLPDILC83372992', listChangeTypeId);
        }
    }

    private processDataItemUsable() {
        const symbolInfoArray = this._dataItem.records;
        if (symbolInfoArray === undefined) {
            throw new AssertInternalError('CPFUTRDLPDISC23239');
        } else {
            const symbolCount = symbolInfoArray.length;
            const newRecordList = new Array<CallPut>(symbolCount);
            let count = 0;
            const existingIndexMap = new Map<string, Integer>();
            for (let i = 0; i < symbolCount; i++) {
                const symbol = symbolInfoArray[i];
                const callPutKey = this.createKeyFromSymbol(symbolInfoArray[i]);
                if (callPutKey !== undefined) {
                    const callPutMapKey = callPutKey.mapKey;
                    const existingIndex = existingIndexMap.get(callPutMapKey);
                    if (existingIndex === undefined) {
                        const newCallPut = this.createCallPutFromKeyAndSymbol(callPutKey, symbol);
                        if (newCallPut !== undefined) {
                            existingIndexMap.set(callPutMapKey, count);
                            newRecordList[count++] = newCallPut;
                        }
                    } else {
                        const existingCallPut = newRecordList[existingIndex];
                        this.updateCallPutFromSymbol(existingCallPut, symbol);
                    }
                }
            }
            newRecordList.length = count;
            this._recordList.splice(0, 0, ...newRecordList);

            this.setUsable(this._dataItem.badness);
        }
    }

    private createKeyFromSymbol(symbolInfo: SymbolsDataItem.Record): CallPut.Key | undefined {
        const exercisePrice = symbolInfo.strikePrice;
        if (exercisePrice === undefined) {
            Logger.logDataError('CPFUTSCKFSP28875', symbolInfo.litIvemId.name);
            return undefined;
        } else {
            const expiryDate = symbolInfo.expiryDate;
            if (expiryDate === undefined) {
                Logger.logDataError('CPFUTSCKFSD18557', symbolInfo.litIvemId.name);
                return undefined;
            } else {
                const litId = symbolInfo.litIvemId.litId;
                return new CallPut.Key(exercisePrice, expiryDate.utcMidnight, litId);
            }
        }
    }

    private createCallPutFromKeyAndSymbol(key: CallPut.Key, symbolInfo: SymbolsDataItem.Record): CallPut | undefined {
        const result = new CallPut();
        result.exercisePrice = key.exercisePrice;
        result.expiryDate = key.expiryDate;
        result.litId = key.litId;
        const callOrPutId = symbolInfo.callOrPutId;
        if (callOrPutId === undefined) {
            Logger.logDataError('CPFUTSCCPFKASCP22887', symbolInfo.litIvemId.name);
            return undefined;
        } else {
            const litIvemId = symbolInfo.litIvemId;
            switch (callOrPutId) {
                case CallOrPutId.Call:
                    result.callLitIvemId = litIvemId;
                    break;
                case CallOrPutId.Put:
                    result.putLitIvemId = litIvemId;
                    break;
                default:
                    throw new UnreachableCaseError('CPFUTSCCPFKASD11134', callOrPutId);
            }
            const exerciseTypeId = symbolInfo.exerciseTypeId;
            if (exerciseTypeId === undefined) {
                Logger.logDataError('CPFUTSCCPFKASE99811', symbolInfo.name);
                return undefined;
            } else {
                result.exerciseTypeId = exerciseTypeId;

                const contractMultipler = symbolInfo.contractSize;
                if (contractMultipler === undefined) {
                    Logger.logDataError('CPFUTSCCPFKASC44477', symbolInfo.litIvemId.name);
                    return undefined;
                } else {
                    result.contractMultiplier = new Decimal(contractMultipler);
                    // currently do not need underlyingIvemId or underlyingIsIndex
                    return result;
                }
            }
        }
    }

    private updateCallPutFromSymbol(callPut: CallPut, symbolInfo: SymbolsDataItem.Record) {
        const callOrPutId = symbolInfo.callOrPutId;
        if (callOrPutId === undefined) {
            Logger.logDataError('CPFUTSUCPFSU22995', symbolInfo.litIvemId.name);
        } else {
            const litIvemId = symbolInfo.litIvemId;
            switch (callOrPutId) {
                case CallOrPutId.Call:
                    if (callPut.callLitIvemId !== undefined) {
                        Logger.logDataError('CPUATSUPCPFSC90445', `${callPut.callLitIvemId.name} ${litIvemId.name}`);
                    } else {
                        callPut.callLitIvemId = litIvemId;
                    }
                    break;
                case CallOrPutId.Put:
                    if (callPut.putLitIvemId !== undefined) {
                        Logger.logDataError('CPUATSUPCPFSP33852', `${callPut.putLitIvemId.name} ${litIvemId.name}`);
                    } else {
                        callPut.putLitIvemId = litIvemId;
                    }
                    break;
                default:
                    throw new UnreachableCaseError('CPUATSUPCPFSD98732', callOrPutId);
            }

            const exerciseTypeId = symbolInfo.exerciseTypeId;
            if (exerciseTypeId === undefined) {
                Logger.logDataError('CPUATSUPCPFSE13123', litIvemId.name);
            } else {
                if (callPut.exerciseTypeId === undefined) {
                    callPut.exerciseTypeId = exerciseTypeId;
                    Logger.logDataError('CPUATSUPCPFST22258', litIvemId.name);
                } else {
                    if (callPut.exerciseTypeId !== exerciseTypeId) {
                        Logger.logDataError('CPUATSUPCPFSY91192', `${litIvemId.name} ${callPut.exerciseTypeId} ${exerciseTypeId}`);
                    }
                }
            }

            const contractMultiplier = symbolInfo.contractSize;
            if (contractMultiplier === undefined) {
                Logger.logDataError('CPUATSUPCPFSM48865', litIvemId.name);
            } else {
                if (callPut.contractMultiplier === undefined) {
                    callPut.contractMultiplier = new Decimal(contractMultiplier);
                    Logger.logDataError('CPUATSUPCPFSU33285', litIvemId.name);
                } else {
                    if (!isDecimalEqual(callPut.contractMultiplier, contractMultiplier)) {
                        Logger.logDataError('CPUATSUPCPFSL32238', `${litIvemId.name} ${callPut.contractMultiplier.toString()} ${contractMultiplier.toString()}`);
                    }
                }
            }
        }
    }
}
