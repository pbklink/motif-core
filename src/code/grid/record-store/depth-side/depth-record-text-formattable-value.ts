/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { OrderSideId } from '../../../adi/internal-api';
import { TextFormattableValue } from '../../../services/internal-api';
import { GridRecordStoreTextFormattableValue } from '../grid-record-store-text-formattable-value';
import { DepthRecord } from './depth-record';

/** @public */
export namespace DepthRecordTextFormattableValue {
    export interface Attribute extends GridRecordStoreTextFormattableValue.Attribute {
        readonly typeId: TextFormattableValue.Attribute.TypeId.DepthRecord;
        orderSideId: OrderSideId;
        depthRecordTypeId: DepthRecord.TypeId;
        ownOrder: boolean;
    }
}
