// Alias for RevRecordValueRecentChangeTypeId (so that revgrid is only imported here for adi and sys)

import { RevRecordValueRecentChangeTypeId } from 'revgrid';

export type ValueRecentChangeTypeId = RevRecordValueRecentChangeTypeId;

export namespace ValueRecentChangeTypeId {
    export const Update = RevRecordValueRecentChangeTypeId.Update;
    export const Increase = RevRecordValueRecentChangeTypeId.Increase;
    export const Decrease = RevRecordValueRecentChangeTypeId.Decrease;
}
