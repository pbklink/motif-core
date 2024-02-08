/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ModifierComparableList } from './modifier-comparable-list';

export type UiComparableList<T extends U, U = T> = ModifierComparableList<T, boolean, U>;
