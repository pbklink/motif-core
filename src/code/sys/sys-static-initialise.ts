/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BadnessModule } from './badness';
import { CorrectnessModule } from './correctness';
import { LoggerModule } from './logger';
import { SourceTzOffsetTimeRenderValueModule } from './source-tz-offset-date-time';
import { WebsocketCloseCodeModule } from './websocket-close-code';

/** @internal */
export namespace SysStaticInitialise {
    export function initialise() {
        CorrectnessModule.initialiseStatic();
        BadnessModule.initialiseStatic();
        SourceTzOffsetTimeRenderValueModule.initaliseStatic();
        WebsocketCloseCodeModule.initialiseStatic();
        LoggerModule.initialiseStatic();
    }
}
