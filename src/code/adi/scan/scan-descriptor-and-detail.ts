/**
 * %license Motif
 * (c) 2022 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ScanDetail } from './scan-detail';
import { ScanStatusedDescriptorInterface } from './scan-statused-descriptor-interface';

export interface ScanDescriptorAndDetail extends ScanStatusedDescriptorInterface, ScanDetail {
}
