/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CorrectnessId } from '../sys/sys-internal-api';
import { DataEnvironment, DataEnvironmentId, FeedId, FeedStatusId } from './common/adi-common-internal-api';
import { Feed } from './feed';

export class DataFeed extends Feed {
    constructor(id: FeedId,
        public readonly environmentId: DataEnvironmentId | undefined,
        statusId: FeedStatusId, listCorrectnessId: CorrectnessId
    ) {
        super(id, statusId, listCorrectnessId);
    }

    override get environmentDisplay(): string {
        if (this.environmentId === undefined) {
            return '';
        } else {
            return DataEnvironment.idToDisplay(this.environmentId);
        }
    }
}
