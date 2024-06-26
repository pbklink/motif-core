/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BadnessModule } from './badness';
import { CorrectnessModule } from './correctness';
import { FieldDataTypeModule } from './field-data-type';
import { ConfigServiceGroupModule } from './service-operator';
import { SourceTzOffsetTimeRenderValueModule } from './source-tz-offset-date-time-timezone-mode';
import { WebsocketCloseCodeModule } from './websocket-close-code';

/** @internal */
export namespace SysStaticInitialise {
    export function initialise() {
        CorrectnessModule.initialiseStatic();
        BadnessModule.initialiseStatic();
        FieldDataTypeModule.initialiseStatic();
        SourceTzOffsetTimeRenderValueModule.initaliseStatic();
        WebsocketCloseCodeModule.initialiseStatic();
        ConfigServiceGroupModule.initialiseStatic();
    }
}
