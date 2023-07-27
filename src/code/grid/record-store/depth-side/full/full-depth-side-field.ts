/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DepthDataItem } from '../../../../adi/adi-internal-api';
import { EnumInfoOutOfOrderError, GridFieldHorizontalAlign, Integer, UnreachableCaseError } from '../../../../sys/sys-internal-api';

export const enum FullDepthSideFieldId {
    PriceAndHasUndisclosed,
    Volume,
    CountXref,
    BrokerId,
    MarketId,
    VolumeAhead,
    Attributes,
    Price,
    Xref,
    Count,
    OrderId,
}

export namespace FullDepthSideField {
    export type Id = FullDepthSideFieldId;

    const leftTextAlign = 'left';
    const rightTextAlign = 'right';

    class Info {
        constructor(
            public id: Id,
            public name: string,
            public defaultHeading: string,
            public defaultTextAlign: GridFieldHorizontalAlign,
        ) { }
    }

    type InfosObject = { [id in keyof typeof FullDepthSideFieldId]: Info };

    const infosObject: InfosObject = {
        PriceAndHasUndisclosed: {
            id: FullDepthSideFieldId.Price,
            name: 'PriceAndHasUndisclosed',
            defaultHeading: 'Price/U',
            defaultTextAlign: rightTextAlign,
        },
        Volume: {
            id: FullDepthSideFieldId.Volume,
            name: 'Volume',
            defaultHeading: 'Volume',
            defaultTextAlign: rightTextAlign,
        },
        CountXref: {
            id: FullDepthSideFieldId.CountXref,
            name: 'CountXref',
            defaultHeading: 'Count/X',
            defaultTextAlign: leftTextAlign,
        },
        BrokerId: {
            id: FullDepthSideFieldId.BrokerId,
            name: 'BrokerId',
            defaultHeading: 'Broker',
            defaultTextAlign: leftTextAlign,
        },
        MarketId: {
            id: FullDepthSideFieldId.MarketId,
            name: 'MarketId',
            defaultHeading: 'Market',
            defaultTextAlign: leftTextAlign,
        },
        VolumeAhead: {
            id: FullDepthSideFieldId.VolumeAhead,
            name: 'VolumeAhead',
            defaultHeading: 'Vol Ahead',
            defaultTextAlign: rightTextAlign,
        },
        Attributes: {
            id: FullDepthSideFieldId.Attributes,
            name: 'Attributes',
            defaultHeading: 'Attributes',
            defaultTextAlign: leftTextAlign,
        },
        Price: {
            id: FullDepthSideFieldId.Price,
            name: 'Price',
            defaultHeading: 'Price',
            defaultTextAlign: rightTextAlign,
        },
        Xref: {
            id: FullDepthSideFieldId.Xref,
            name: 'XRef',
            defaultHeading: 'XRef',
            defaultTextAlign: leftTextAlign,
        },
        Count: {
            id: FullDepthSideFieldId.Count,
            name: 'Count',
            defaultHeading: 'Count',
            defaultTextAlign: rightTextAlign,
        },
        OrderId: {
            id: FullDepthSideFieldId.OrderId,
            name: 'OrderId',
            defaultHeading: 'Order Id',
            defaultTextAlign: leftTextAlign,
        },
    };

    export const idCount = Object.keys(infosObject).length;

    const infos = Object.values(infosObject);

    export function initialise() {
        const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
        if (outOfOrderIdx >= 0) {
            throw new EnumInfoOutOfOrderError('FullDepthSideFieldId', outOfOrderIdx, infos[outOfOrderIdx].name);
        }
    }

    export function idToName(id: Id) {
        return infos[id].name;
    }

    export function idToDefaultHeading(id: Id) {
        return infos[id].defaultHeading;
    }

    export function idToDefaultTextAlign(id: Id) {
        return infos[id].defaultTextAlign;
    }

    export function createIdFromDepthOrderFieldId(orderFieldId: DepthDataItem.Order.Field.Id): FullDepthSideFieldId | undefined {
        switch (orderFieldId) {
            case DepthDataItem.Order.Field.Id.OrderId:
                return FullDepthSideFieldId.OrderId;
            case DepthDataItem.Order.Field.Id.Side:
                return undefined;
            case DepthDataItem.Order.Field.Id.Price:
                return FullDepthSideFieldId.Price; // Also affects FullDepthSideFieldId.PriceAndHasUndisclosed - handled elsewhere
            case DepthDataItem.Order.Field.Id.Position:
                return undefined;
            case DepthDataItem.Order.Field.Id.Broker:
                return FullDepthSideFieldId.BrokerId;
            case DepthDataItem.Order.Field.Id.Xref:
                return FullDepthSideFieldId.Xref; // Also affects FullDepthSideFieldId.CountXref - handled elsewhere
            case DepthDataItem.Order.Field.Id.Quantity:
                return FullDepthSideFieldId.Volume;
            case DepthDataItem.Order.Field.Id.HasUndisclosed:
                return FullDepthSideFieldId.PriceAndHasUndisclosed;
            case DepthDataItem.Order.Field.Id.Market:
                return FullDepthSideFieldId.MarketId;
            case DepthDataItem.Order.Field.Id.Attributes:
                return FullDepthSideFieldId.Attributes;
            default:
                throw new UnreachableCaseError('FDROFDRPOC44487', orderFieldId);
        }
    }
}
