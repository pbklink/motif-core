/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { OrderSideId } from '../../../adi/internal-api';
import { RenderValue } from '../../../services/internal-api';
import { GridRecordStoreRenderValue } from '../grid-record-store-render-value';
import { DepthRecord } from './depth-record';

/** @public */
export namespace DepthRecordRenderValue {
    export interface Attribute extends GridRecordStoreRenderValue.Attribute {
        readonly id: RenderValue.AttributeId.DepthRecord;
        orderSideId: OrderSideId;
        depthRecordTypeId: DepthRecord.TypeId;
        ownOrder: boolean;
    }
}
