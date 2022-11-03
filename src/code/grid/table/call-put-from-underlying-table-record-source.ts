/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Decimal } from 'decimal.js-light';
import {
    AdiService,
    CallOrPutId,
    IvemId,
    SearchSymbolsDataDefinition,
    SecurityDataItem,
    SymbolFieldId,
    SymbolsDataItem
} from "../../adi/adi-internal-api";
import { CallPut } from '../../services/services-internal-api';
import {
    AssertInternalError,
    Badness,
    Integer,
    isDecimalEqual,
    JsonElement,
    Logger,
    MultiEvent,
    PickEnum,
    UnreachableCaseError,
    UsableListChangeTypeId
} from '../../sys/sys-internal-api';
import { GridLayout } from '../layout/grid-layout-internal-api';
import { CallPutTableRecordDefinition } from './call-put-table-record-definition';
import { CallPutTableValueSource } from './call-put-table-value-source';
import { SecurityDataItemTableValueSource } from './security-data-item-table-value-source';
import { SingleDataItemTableRecordSource } from './single-data-item-table-record-source';
import { TableFieldSourceDefinition } from './table-field-source-definition';
import { TableFieldSourceDefinitionsService } from './table-field-source-definitions-service';
import { TableRecordDefinition } from './table-record-definition';
import { TableRecordSource } from './table-record-source';
import { TableValueList } from './table-value-list';

export class CallPutFromUnderlyingTableRecordSource extends SingleDataItemTableRecordSource {

    protected override readonly allowedFieldDefinitionSourceTypeIds: CallPutFromUnderlyingTableRecordSource.FieldDefinitionSourceTypeId[] = [
        TableFieldSourceDefinition.TypeId.CallPut,
        TableFieldSourceDefinition.TypeId.CallSecurityDataItem,
        TableFieldSourceDefinition.TypeId.PutSecurityDataItem,
    ];

    private _recordList: CallPut[] = [];

    private _dataItem: SymbolsDataItem;
    private _dataItemSubscribed = false;
    // private _litIvemDetails: LitIvemDetail[];
    private _dataItemListChangeEventSubscriptionId: MultiEvent.SubscriptionId;
    private _dataItemBadnessChangeEventSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        private readonly _adiService: AdiService,
        private readonly _tableFieldSourceDefinitionsService: TableFieldSourceDefinitionsService,
        private readonly _underlyingIvemId: IvemId,
    ) {
        super(TableRecordSource.TypeId.CallPutFromUnderlying);
    }

    get dataItem() { return this._dataItem; }

    override createRecordDefinition(idx: Integer): CallPutTableRecordDefinition {
        const record = this._recordList[idx];
        return {
            typeId: TableRecordDefinition.TypeId.CallPut,
            mapKey: record.createKey().mapKey,
            record,
        };
    }

    override createTableValueList(recordIndex: Integer): TableValueList {
        const result = new TableValueList();
        const callPut = this._recordList[recordIndex];

        const fieldList = this.fieldList;
        const sourceCount = fieldList.sourceCount;
        for (let i = 0; i < sourceCount; i++) {
            const fieldSource = fieldList.getSource(i);
            const fieldDefinitionSource = fieldSource.definition;
            const fieldDefinitionSourceTypeId =
                fieldDefinitionSource.typeId as CallPutFromUnderlyingTableRecordSource.FieldDefinitionSourceTypeId;
            switch (fieldDefinitionSourceTypeId) {
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
                    throw new UnreachableCaseError('CPFUTRSCTVL77752', fieldDefinitionSourceTypeId);
            }
        }

        return result;
    }

    override createDefaultlayout() {
        const result = new GridLayout();

        const callPutFieldSourceDefinition = this._tableFieldSourceDefinitionsService.callPut;
        const callSecurityDataItemFieldSourceDefinition = this._tableFieldSourceDefinitionsService.callSecurityDataItem;
        const putSecurityDataItemFieldSourceDefinition = this._tableFieldSourceDefinitionsService.putSecurityDataItem;

        result.addField(callSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.BestBid));
        result.addField(callSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.BestAsk));
        result.addField(callSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Last));
        result.addField(callSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Open));
        result.addField(callSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.High));
        result.addField(callSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Low));
        result.addField(callSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Close));
        result.addField(callSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Volume));

        result.addField(callPutFieldSourceDefinition.getSupportedFieldNameById(CallPut.FieldId.ExercisePrice));
        result.addField(callPutFieldSourceDefinition.getSupportedFieldNameById(CallPut.FieldId.ExpiryDate));
        result.addField(callPutFieldSourceDefinition.getSupportedFieldNameById(CallPut.FieldId.LitId));
        result.addField(callPutFieldSourceDefinition.getSupportedFieldNameById(CallPut.FieldId.CallLitIvemId));
        result.addField(callPutFieldSourceDefinition.getSupportedFieldNameById(CallPut.FieldId.PutLitIvemId));

        result.addField(putSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.BestBid));
        result.addField(putSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.BestAsk));
        result.addField(putSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Last));
        result.addField(putSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Open));
        result.addField(putSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.High));
        result.addField(putSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Low));
        result.addField(putSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Close));
        result.addField(putSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Volume));

        return result;
    }

    override activate() {
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
            this._dataItemListChangeEventSubscriptionId = this.dataItem.subscribeListChangeEvent(
                (listChangeTypeId, idx, count) => this.handleDataItemListChangeEvent(listChangeTypeId, idx, count)
            );
            this._dataItemBadnessChangeEventSubscriptionId = this._dataItem.subscribeBadnessChangeEvent(
                () => this.handleDataItemBadnessChangeEvent()
            );

            super.activate();

            if (this.dataItem.usable) {
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

    override deactivate() {
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

            super.deactivate();

            this._adiService.unsubscribe(this._dataItem);
            this._dataItemSubscribed = false;
        }
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        element.setJson(CallPutFromUnderlyingTableRecordSource.JsonTag.underlyingIvemId, this._underlyingIvemId?.toJson());
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
                        Logger.logDataError('CPUATSUPCPFSL32238', `${litIvemId.name} ${callPut.contractMultiplier} ${contractMultiplier}`);
                    }
                }
            }
        }
    }
}

export namespace CallPutFromUnderlyingTableRecordSource {
    export type FieldDefinitionSourceTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.CallPut |
        TableFieldSourceDefinition.TypeId.CallSecurityDataItem |
        TableFieldSourceDefinition.TypeId.PutSecurityDataItem
    >;

    export namespace JsonTag {
        export const underlyingIvemId = 'underlyingIvemId';
    }

    export function tryCreateFromJson(
        adiService: AdiService,
        tableFieldSourceDefinitionsService: TableFieldSourceDefinitionsService,
        element: JsonElement
    ): CallPutFromUnderlyingTableRecordSource | undefined {
        const context = 'CPUFUTRSTCFJUII13132';
        const underlyingIvemId = IvemId.tryGetFromJsonElement(element, JsonTag.underlyingIvemId, context);
        if (underlyingIvemId === undefined) {
            return undefined;
        } else {
            return new CallPutFromUnderlyingTableRecordSource(adiService, tableFieldSourceDefinitionsService, underlyingIvemId);
        }
    }
}
