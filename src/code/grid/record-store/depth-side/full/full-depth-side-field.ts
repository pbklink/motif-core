/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevHorizontalAlignId } from '@xilytix/revgrid';
import { DepthDataItem } from '../../../../adi/internal-api';
import { EnumInfoOutOfOrderError, Integer, UnreachableCaseError } from '../../../../sys/internal-api';

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

    const leftTextAlign = RevHorizontalAlignId.Left;
    const rightTextAlign = RevHorizontalAlignId.Right;

    class Info {
        constructor(
            public id: Id,
            public name: string,
            public defaultHeading: string,
            public defaultTextAlignId: RevHorizontalAlignId,
        ) { }
    }

    type InfosObject = { [id in keyof typeof FullDepthSideFieldId]: Info };

    const infosObject: InfosObject = {
        PriceAndHasUndisclosed: {
            id: FullDepthSideFieldId.Price,
            name: 'PriceAndHasUndisclosed',
            defaultHeading: 'Price/U',
            defaultTextAlignId: rightTextAlign,
        },
        Volume: {
            id: FullDepthSideFieldId.Volume,
            name: 'Volume',
            defaultHeading: 'Volume',
            defaultTextAlignId: rightTextAlign,
        },
        CountXref: {
            id: FullDepthSideFieldId.CountXref,
            name: 'CountXref',
            defaultHeading: 'Count/X',
            defaultTextAlignId: leftTextAlign,
        },
        BrokerId: {
            id: FullDepthSideFieldId.BrokerId,
            name: 'BrokerId',
            defaultHeading: 'Broker',
            defaultTextAlignId: leftTextAlign,
        },
        MarketId: {
            id: FullDepthSideFieldId.MarketId,
            name: 'MarketId',
            defaultHeading: 'Market',
            defaultTextAlignId: leftTextAlign,
        },
        VolumeAhead: {
            id: FullDepthSideFieldId.VolumeAhead,
            name: 'VolumeAhead',
            defaultHeading: 'Vol Ahead',
            defaultTextAlignId: rightTextAlign,
        },
        Attributes: {
            id: FullDepthSideFieldId.Attributes,
            name: 'Attributes',
            defaultHeading: 'Attributes',
            defaultTextAlignId: leftTextAlign,
        },
        Price: {
            id: FullDepthSideFieldId.Price,
            name: 'Price',
            defaultHeading: 'Price',
            defaultTextAlignId: rightTextAlign,
        },
        Xref: {
            id: FullDepthSideFieldId.Xref,
            name: 'XRef',
            defaultHeading: 'XRef',
            defaultTextAlignId: leftTextAlign,
        },
        Count: {
            id: FullDepthSideFieldId.Count,
            name: 'Count',
            defaultHeading: 'Count',
            defaultTextAlignId: rightTextAlign,
        },
        OrderId: {
            id: FullDepthSideFieldId.OrderId,
            name: 'OrderId',
            defaultHeading: 'Order Id',
            defaultTextAlignId: leftTextAlign,
        },
    };

    export const idCount = Object.keys(infosObject).length;

    const infos = Object.values(infosObject);

    export function initialise() {
        const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index as FullDepthSideFieldId);
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

    export function idToDefaultTextAlignId(id: Id) {
        return infos[id].defaultTextAlignId;
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
