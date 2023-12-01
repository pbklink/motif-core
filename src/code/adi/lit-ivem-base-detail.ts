/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from '../res/res-internal-api';
import { EnumInfoOutOfOrderError, FieldDataTypeId, MultiEvent } from '../sys/sys-internal-api';
import {
    ExchangeId,
    IvemClassId,
    LitIvemAlternateCodes,
    LitIvemId,
    MarketId,
    PublisherSubscriptionDataTypeId
} from './common/adi-common-internal-api';
import { ReadonlyLitIvemIdRecord } from './readonly-lit-ivem-id-record';

export interface LitIvemBaseDetail extends ReadonlyLitIvemIdRecord {
    readonly litIvemId: LitIvemId;
    readonly key: LitIvemId;
    readonly code: string | undefined;
    readonly marketId: MarketId | undefined;
    readonly ivemClassId: IvemClassId | undefined;
    readonly subscriptionDataTypeIds: readonly PublisherSubscriptionDataTypeId[] | undefined;
    readonly tradingMarketIds: readonly MarketId[] | undefined;
    readonly name: string | undefined;
    readonly exchangeId: ExchangeId | undefined;
    // AlternateCodesFix: Currently this actually is part of FullDetail.  Will be here in future
    readonly alternateCodes: LitIvemAlternateCodes | undefined;

    subscribeBaseChangeEvent: (handler: LitIvemBaseDetail.ChangeEventHandler) => MultiEvent.SubscriptionId;
    unsubscribeBaseChangeEvent: (subscriptionId: MultiEvent.SubscriptionId) => void;
}

export namespace LitIvemBaseDetail {
    export type ChangeEventHandler = (this: void, changedFieldIds: Field.Id[]) => void;

    export namespace Field {
        export const enum Id {
            Id,
            Code,
            // eslint-disable-next-line @typescript-eslint/no-shadow
            MarketId,
            // eslint-disable-next-line @typescript-eslint/no-shadow
            IvemClassId,
            SubscriptionDataTypeIds,
            TradingMarketIds,
            Name,
            // eslint-disable-next-line @typescript-eslint/no-shadow
            ExchangeId,
            AlternateCodes,
        }

        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly dataTypeId: FieldDataTypeId;
            readonly displayId: StringId;
            readonly headingId: StringId;
        }

        type InfosObject = { [id in keyof typeof Id]: Info };

        const infosObject: InfosObject = {
            Id: {
                id: Id.Id,
                name: 'Id',
                dataTypeId: FieldDataTypeId.Object,
                displayId: StringId.BaseLitIvemDetailDisplay_Id,
                headingId: StringId.BaseLitIvemDetailHeading_Id,
            },
            Code: {
                id: Id.Code,
                name: 'Code',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.BaseLitIvemDetailDisplay_Code,
                headingId: StringId.BaseLitIvemDetailHeading_Code,
            },
            MarketId: {
                id: Id.MarketId,
                name: 'MarketId',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.BaseLitIvemDetailDisplay_MarketId,
                headingId: StringId.BaseLitIvemDetailHeading_MarketId,
            },
            IvemClassId: {
                id: Id.IvemClassId,
                name: 'IvemClassId',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.BaseLitIvemDetailDisplay_IvemClassId,
                headingId: StringId.BaseLitIvemDetailHeading_IvemClassId,
            },
            SubscriptionDataTypeIds: {
                id: Id.SubscriptionDataTypeIds,
                name: 'SubscriptionDataTypeIds',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.BaseLitIvemDetailDisplay_SubscriptionDataTypeIds,
                headingId: StringId.BaseLitIvemDetailHeading_SubscriptionDataTypeIds,
            },
            TradingMarketIds: {
                id: Id.TradingMarketIds,
                name: 'TradingMarketIds',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.BaseLitIvemDetailDisplay_TradingMarketIds,
                headingId: StringId.BaseLitIvemDetailHeading_TradingMarketIds,
            },
            Name: {
                id: Id.Name,
                name: 'Name',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.BaseLitIvemDetailDisplay_Name,
                headingId: StringId.BaseLitIvemDetailHeading_Name,
            },
            ExchangeId: {
                id: Id.ExchangeId,
                name: 'ExchangeId',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.BaseLitIvemDetailDisplay_ExchangeId,
                headingId: StringId.BaseLitIvemDetailHeading_ExchangeId,
            },
            AlternateCodes: {
                id: Id.AlternateCodes,
                name: 'AlternateCodes',
                dataTypeId: FieldDataTypeId.Object,
                displayId: StringId.BaseLitIvemDetailDisplay_AlternateCodes,
                headingId: StringId.BaseLitIvemDetailHeading_AlternateCodes,
            },
        } as const;

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export const allNames = new Array<string>(idCount);

        export function initialise() {
            for (let id = 0; id < idCount; id++) {
                if (infos[id].id !== id as Id) {
                    throw new EnumInfoOutOfOrderError('LitIvemDetail.Field', id, infos[id].name);
                } else {
                    allNames[id] = idToName(id);
                }
            }
        }

        export function idToName(id: Id): string {
            return infos[id].name;
        }

        export function idToFieldDataTypeId(id: Id) {
            return infos[id].dataTypeId;
        }

        export function idToDisplayId(id: Id) {
            return infos[id].displayId;
        }

        export function idToHeadingId(id: Id) {
            return infos[id].headingId;
        }

        export function idToHeading(id: Id) {
            return Strings[idToHeadingId(id)];
        }
    }

    export type Key = LitIvemId;

    export namespace Key {
        export const fieldCount = 3;
    }
}

export namespace LitIvemBaseDetailModule {
    export function initialiseStatic() {
        LitIvemBaseDetail.Field.initialise();
    }
}
