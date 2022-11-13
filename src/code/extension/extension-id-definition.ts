/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { PublisherIdDefinition } from '../publisher/publisher-internal-api';

/** @public */
export interface ExtensionIdDefinition {
    readonly publisherIdDefinition: PublisherIdDefinition;
    readonly name: string;
}

