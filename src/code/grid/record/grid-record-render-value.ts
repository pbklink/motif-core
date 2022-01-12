/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { OrderSideId } from '../../adi/adi-internal-api';
import { RenderValue } from '../../services/services-internal-api';
import { DepthRecord } from './depth-record';

export namespace GridRecordRenderValue {
    export interface GridRecordAttribute extends RenderValue.Attribute {

    }

    export interface DepthRecordAttribute extends GridRecordAttribute {
        readonly id: RenderValue.AttributeId.DepthRecord;
        orderSideId: OrderSideId;
        depthRecordTypeId: DepthRecord.TypeId;
        ownOrder: boolean;
    }
}
