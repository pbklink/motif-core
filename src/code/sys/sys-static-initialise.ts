/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BadnessModule } from './badness';
import { ConfigServiceGroupModule } from './config-service-group';
import { CorrectnessModule } from './correctness';
import { FieldDataTypeModule } from './field-data-type';
import { LoggerModule } from './logger';
import { SourceTzOffsetTimeRenderValueModule } from './source-tz-offset-date-time';
import { WebsocketCloseCodeModule } from './websocket-close-code';

/** @internal */
export namespace SysStaticInitialise {
    export function initialise() {
        CorrectnessModule.initialiseStatic();
        BadnessModule.initialiseStatic();
        FieldDataTypeModule.initialiseStatic();
        SourceTzOffsetTimeRenderValueModule.initaliseStatic();
        WebsocketCloseCodeModule.initialiseStatic();
        LoggerModule.initialiseStatic();
        ConfigServiceGroupModule.initialiseStatic();
    }
}
