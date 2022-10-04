/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId, MarketId, Scan, ScanTargetTypeId } from '../adi/adi-internal-api';
import { LitIvemIdMatchesDataItem } from '../adi/lit-ivem-id-matches-data-item';
import { StringId, Strings } from '../res/res-internal-api';
import { EnumRenderValue, RenderValue } from '../services/services-internal-api';
import { AssertInternalError, EnumInfoOutOfOrderError, MultiEvent } from '../sys/sys-internal-api';
import { Integer } from '../sys/types';
import { ScanCriteria } from './scan-criteria';


export class EditableScan {
    private _stateId: EditableScan.StateId;
    private _scan: Scan | undefined;
    private _scanChangedSubscriptionId: MultiEvent.SubscriptionId;
    private _matchesDataItem: LitIvemIdMatchesDataItem;

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
    matchCount: Integer;
    unmodifiedVersion: number;
    criteriaTypeId: EditableScan.CriteriaTypeId;
    criteria: ScanCriteria.BooleanNode;
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

    }

    private handleScanChangedEvent(changedFieldIds: Scan.FieldId[]) {
        //
    }
}

export namespace EditableScan {
    export const enum StateId {

    }

    export const enum CriteriaTypeId {
        Custom,
        PriceGreaterThanValue,
        PriceLessThanValue,
        TodayPriceIncreaseGreaterThanPercentage,
        TodayPriceDecreaseGreaterThanPercentage,
    }

    export namespace CriteriaType {
        export type Id = CriteriaTypeId;

        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly displayId: StringId;
        }

        type InfosObject = { [id in keyof typeof CriteriaTypeId]: Info };

        const infosObject: InfosObject = {
            Custom: {
                id: CriteriaTypeId.Custom,
                name: 'Custom',
                displayId: StringId.ScanCriteriaTypeDisplay_Custom,
            },
            PriceGreaterThanValue: {
                id: CriteriaTypeId.PriceGreaterThanValue,
                name: 'PriceGreaterThanValue',
                displayId: StringId.ScanCriteriaTypeDisplay_PriceGreaterThanValue,
            },
            PriceLessThanValue: {
                id: CriteriaTypeId.PriceLessThanValue,
                name: 'PriceLessThanValue',
                displayId: StringId.ScanCriteriaTypeDisplay_PriceLessThanValue,
            },
            TodayPriceIncreaseGreaterThanPercentage: {
                id: CriteriaTypeId.TodayPriceIncreaseGreaterThanPercentage,
                name: 'TodayPriceIncreaseGreaterThanPercentage',
                displayId: StringId.ScanCriteriaTypeDisplay_TodayPriceIncreaseGreaterThanPercentage,
            },
            TodayPriceDecreaseGreaterThanPercentage: {
                id: CriteriaTypeId.TodayPriceDecreaseGreaterThanPercentage,
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

    export namespace Field {
        export const enum Id {
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

        interface Info {
            readonly id: Id;
            readonly name: string;
        }

        type InfosObject = { [id in keyof typeof Id]: Info };

        const infosObject: InfosObject = {
            Id: {
                id: Id.Id,
                name: 'Id',
            },
            Index: {
                id: Id.Index,
                name: 'Index',
            },
            Name: {
                id: Id.Name,
                name: 'Name',
            },
            Description: {
                id: Id.Description,
                name: 'Description',
            },
            TargetTypeId: {
                id: Id.TargetTypeId,
                name: 'TargetTypeId',
            },
            TargetMarkets: {
                id: Id.TargetMarkets,
                name: 'TargetMarkets',
            },
            TargetLitIvemIds: {
                id: Id.TargetLitIvemIds,
                name: 'TargetLitIvemIds',
            },
            MatchCount: {
                id: Id.MatchCount,
                name: 'MatchCount',
            },
            CriteriaTypeId: {
                id: Id.CriteriaTypeId,
                name: 'CriteriaTypeId',
            },
            ModifiedStatusId: {
                id: Id.ModifiedStatusId,
                name: 'ModifiedStatusId',
            },
        } as const;

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: number) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('DayTradeDataItem.Field.Id', outOfOrderIdx, `${idToName(outOfOrderIdx)}`);
            }
        }

        export function idToName(id: Id) {
            return infos[id].name;
        }
    }

    export class CriteriaTypeIdRenderValue extends EnumRenderValue {
        constructor(data: CriteriaTypeId | undefined) {
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
