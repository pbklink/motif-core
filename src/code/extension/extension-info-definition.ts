/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExtensionIdDefinition } from './extension-id-definition';

/** @public */
export interface ExtensionInfoDefinition extends ExtensionIdDefinition {
    readonly version: string;
    readonly apiVersion: string;
    readonly shortDescription: string;
    readonly longDescription: string;
    readonly urlPath: string;
}
