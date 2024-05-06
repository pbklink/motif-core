/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevTextFormatter } from '@xilytix/revgrid';
import { TextFormattableValue } from './text-formattable-value';

export interface TextFormatter extends RevTextFormatter<TextFormattableValue.TypeId, TextFormattableValue.Attribute.TypeId> {

}
