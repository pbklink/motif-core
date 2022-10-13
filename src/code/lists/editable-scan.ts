/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId, MarketId, Scan, ScanTargetTypeId } from '../adi/adi-internal-api';
import { LitIvemIdMatchesDataItem } from '../adi/lit-ivem-id-matches-data-item';
import { StringId, Strings } from '../res/res-internal-api';
import { EnumRenderValue, RenderValue } from '../services/services-internal-api';
import { AssertInternalError, EnumInfoOutOfOrderError, Err, MultiEvent, Ok, Result } from '../sys/sys-internal-api';
import { Integer } from '../sys/types';
import { ScanCriteria } from './scan-criteria';
import { ZenithScanCriteriaConvert } from './zenith-scan-criteria-convert';


export class EditableScan {
    private _stateId: EditableScan.StateId;
    private _scan: Scan | undefined;
    private _propertiesChangedMultiEvent = new MultiEvent<EditableScan.PropertiesChangedEventHandler>();
    private _scanChangedSubscriptionId: MultiEvent.SubscriptionId;
    private _matchesDataItem: LitIvemIdMatchesDataItem;

    enabled: boolean;
    id: string;
    index: Integer; // within list of scans - used by Grid
    name: string;
    uppercaseName: string;
    description: string;
    uppercaseDescription: string;
    versionId: string;
    category: string;
    isWritable: boolean;
    targetTypeId: ScanTargetTypeId;
    targetMarketIds: readonly MarketId[] | undefined;
    targetLitIvemIds: readonly LitIvemId[] | undefined;
    maxMatchCount: Integer;
    criteria: ScanCriteria.BooleanNode; // This is not the scan criteria sent to Zenith Server
    criteriaAsZenithText: string; // This is not the scan criteria sent to Zenith Server
    criteriaAsZenithJson: ZenithScanCriteriaConvert.BooleanTupleNode; // This forms part of the scan criteria sent to Zenith Server
    rank: ScanCriteria.NumericNode;
    rankAsJsonText: string;
    matchCount: Integer;
    unmodifiedVersion: number;
    criteriaTypeId: EditableScan.CriterionId;
    symbolListEnabled: boolean;
    symbolListMaxCount: Integer;
    zenithSource: string;
    history: ScanCriteria.BooleanNode[];
    modifiedStatusId: EditableScan.ModifiedStatusId;

    setOnline(scan: Scan) {
        if (this._scan !== undefined) {
            throw new AssertInternalError('ESSO02229');
        } else {
            this._scan = scan;
            this._scanChangedSubscriptionId = this._scan.subscribeChangedEvent((changedFieldIds) => this.handleScanChangedEvent(changedFieldIds));
        }
    }

    checkSetOffline() {
        if (this._scan !== undefined) {
            this._scan.unsubscribeChangedEvent(this._scanChangedSubscriptionId);
            this._scanChangedSubscriptionId = undefined;
            this._scan = undefined;
        }
    }

    setZenithSource(text: string) {
        //
    }

    save() {
        //
    }

    revert() {
        //
    }

    sync(scan: Scan) {
        //
    }

    tryUpdateCriteriaFromZenithText(value: string): Result<boolean, ZenithScanCriteriaConvert.ParseError> {
        if (value === this.criteriaAsZenithText) {
            return new Ok(false);
        } else {
            const parseResult = this.parseZenithSourceCriteriaText(value);
            if (parseResult.isErr()) {
                return new Err(parseResult.error);
            } else {
                this.criteriaAsZenithText = value;
                this.criteria = parseResult.value.booleanNode;
                this.criteriaAsZenithJson = parseResult.value.json;
                this.notifyPropertiesChanged([EditableScan.FieldId.Criteria, EditableScan.FieldId.CriteriaAsZenithText])
                return new Ok(true);
            }
        }
    }

    subscribePropertiesChangedEvent(handler: EditableScan.PropertiesChangedEventHandler) {
        return this._propertiesChangedMultiEvent.subscribe(handler);
    }

    unsubscribePropertiesChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        return this._propertiesChangedMultiEvent.unsubscribe(subscriptionId);
    }

    private handleScanChangedEvent(changedFieldIds: Scan.FieldId[]) {
        //
    }

    private notifyPropertiesChanged(fieldIds: readonly EditableScan.FieldId[]) {
        const handlers = this._propertiesChangedMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](fieldIds);
        }
    }

    parseZenithSourceCriteriaText(value: string): Result<EditableScan.ParsedZenithSourceCriteria, ZenithScanCriteriaConvert.ParseError>  {
        // value must contain valid JSON
        const json = JSON.parse(value) as ZenithScanCriteriaConvert.BooleanTupleNode;
        const result = ZenithScanCriteriaConvert.parseBoolean(json);
        if (result.isOk()) {
            return new Ok({
                booleanNode: result.value.node,
                json
            });
        } else {
            return result;
        }
    }
}

export namespace EditableScan {
    export type PropertiesChangedEventHandler = (this: void, changedFieldIds: readonly FieldId[]) => void;

    export interface ParsedZenithSourceCriteria {
        booleanNode: ScanCriteria.BooleanNode;
        json: ZenithScanCriteriaConvert.BooleanTupleNode;
    }

    export const enum StateId {

    }

    export const enum CriterionId {
        Custom,
        PriceGreaterThanValue,
        PriceLessThanValue,
        TodayPriceIncreaseGreaterThanPercentage,
        TodayPriceDecreaseGreaterThanPercentage,
    }

    export namespace CriteriaType {
        export type Id = CriterionId;

        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly displayId: StringId;
        }

        type InfosObject = { [id in keyof typeof CriterionId]: Info };

        const infosObject: InfosObject = {
            Custom: {
                id: CriterionId.Custom,
                name: 'Custom',
                displayId: StringId.ScanCriteriaTypeDisplay_Custom,
            },
            PriceGreaterThanValue: {
                id: CriterionId.PriceGreaterThanValue,
                name: 'PriceGreaterThanValue',
                displayId: StringId.ScanCriteriaTypeDisplay_PriceGreaterThanValue,
            },
            PriceLessThanValue: {
                id: CriterionId.PriceLessThanValue,
                name: 'PriceLessThanValue',
                displayId: StringId.ScanCriteriaTypeDisplay_PriceLessThanValue,
            },
            TodayPriceIncreaseGreaterThanPercentage: {
                id: CriterionId.TodayPriceIncreaseGreaterThanPercentage,
                name: 'TodayPriceIncreaseGreaterThanPercentage',
                displayId: StringId.ScanCriteriaTypeDisplay_TodayPriceIncreaseGreaterThanPercentage,
            },
            TodayPriceDecreaseGreaterThanPercentage: {
                id: CriterionId.TodayPriceDecreaseGreaterThanPercentage,
                name: 'TodayPriceDecreaseGreaterThanPercentage',
                displayId: StringId.ScanCriteriaTypeDisplay_TodayPriceDecreaseGreaterThanPercentage,
            },
        } as const;

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('Scan.CriteriaTypeId', outOfOrderIdx, infos[outOfOrderIdx].name);
            }
        }

        export function getAllIds() {
            return infos.map(info => info.id);
        }

        export function idToDisplayId(id: Id): StringId {
            return infos[id].displayId;
        }

        export function idToDisplay(id: Id): string {
            return Strings[idToDisplayId(id)];
        }
    }

    export const enum ModifiedStatusId {
        Unmodified,
        Modified,
        Conflict,
    }

    export namespace ModifiedStatus {
        export type Id = ModifiedStatusId;

        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly displayId: StringId;
        }

        type InfosObject = { [id in keyof typeof ModifiedStatusId]: Info };

        const infosObject: InfosObject = {
            Unmodified: {
                id: ModifiedStatusId.Unmodified,
                name: 'Unmodified',
                displayId: StringId.ScanModifiedStatusDisplay_Unmodified,
            },
            Modified: {
                id: ModifiedStatusId.Modified,
                name: 'Modified',
                displayId: StringId.ScanModifiedStatusDisplay_Modified,
            },
            Conflict: {
                id: ModifiedStatusId.Conflict,
                name: 'Conflict',
                displayId: StringId.ScanModifiedStatusDisplay_Conflict,
            },
        } as const;

        export const idCount = Object.keys(infosObject).length;

        const infos = Object.values(infosObject);

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('Scan.TargetTypeId', outOfOrderIdx, infos[outOfOrderIdx].name);
            }
        }

        export function idToDisplayId(id: Id): StringId {
            return infos[id].displayId;
        }

        export function idToDisplay(id: Id): string {
            return Strings[idToDisplayId(id)];
        }
    }

    export const enum FieldId {
        Id,
        Index,
        Name,
        Description,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        TargetTypeId,
        TargetMarkets,
        TargetLitIvemIds,
        MatchCount,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        CriteriaTypeId,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        ModifiedStatusId,
    }

    export namespace Field {
        export type Id = FieldId;

        interface Info {
            readonly id: Id;
            readonly name: string;
        }

        type InfosObject = { [id in keyof typeof FieldId]: Info };

        const infosObject: InfosObject = {
            Id: {
                id: FieldId.Id,
                name: 'Id',
            },
            Index: {
                id: FieldId.Index,
                name: 'Index',
            },
            Name: {
                id: FieldId.Name,
                name: 'Name',
            },
            Description: {
                id: FieldId.Description,
                name: 'Description',
            },
            TargetTypeId: {
                id: FieldId.TargetTypeId,
                name: 'TargetTypeId',
            },
            TargetMarkets: {
                id: FieldId.TargetMarkets,
                name: 'TargetMarkets',
            },
            TargetLitIvemIds: {
                id: FieldId.TargetLitIvemIds,
                name: 'TargetLitIvemIds',
            },
            MatchCount: {
                id: FieldId.MatchCount,
                name: 'MatchCount',
            },
            CriteriaTypeId: {
                id: FieldId.CriteriaTypeId,
                name: 'CriteriaTypeId',
            },
            ModifiedStatusId: {
                id: FieldId.ModifiedStatusId,
                name: 'ModifiedStatusId',
            },
        } as const;

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: number) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('EditableScan.FieldId', outOfOrderIdx, `${idToName(outOfOrderIdx)}`);
            }
        }

        export function idToName(id: Id) {
            return infos[id].name;
        }
    }

    export class CriteriaTypeIdRenderValue extends EnumRenderValue {
        constructor(data: CriterionId | undefined) {
            super(data, RenderValue.TypeId.ScanCriteriaTypeId);
        }
    }
    export class TargetTypeIdRenderValue extends EnumRenderValue {
        constructor(data: ScanTargetTypeId | undefined) {
            super(data, RenderValue.TypeId.ScanTargetTypeId);
        }
    }
    export class ModifiedStatusIdRenderValue extends EnumRenderValue {
        constructor(data: ModifiedStatusId | undefined) {
            super(data, RenderValue.TypeId.ScanModifiedStatusId);
        }
    }
}

export namespace EditableScanModule {
    export function initialiseStatic() {
        EditableScan.Field.initialise();
        EditableScan.CriteriaType.initialise();
        EditableScan.ModifiedStatus.initialise();
    }
}
