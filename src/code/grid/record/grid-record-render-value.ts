import { BidAskSideId } from 'adi-internal-api';
import { RenderValue } from 'services-internal-api';
import { DepthRecord } from './depth-record';

export namespace GridRecordRenderValue {
    export interface GridRecordAttribute extends RenderValue.Attribute {

    }

    export interface DepthRecordAttribute extends GridRecordAttribute {
        readonly id: RenderValue.AttributeId.DepthRecord;
        bidAskSideId: BidAskSideId;
        depthRecordTypeId: DepthRecord.TypeId;
        ownOrder: boolean;
    }
}
