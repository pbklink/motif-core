/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError } from './internal-error';
import { ComparisonResult, Integer } from './types';

/** @public */
export interface BinarySearchResult {
    found: boolean;
    index: Integer;
}

/** @public */
export type CompareFtn<in T> = (this: void, left: T, right: T) => ComparisonResult;

/** Finds any matching index.  Use if index values are unique
 * @public
 */
export function anyBinarySearch<T>(
    values: T[],
    item: T,
    compare: CompareFtn<T>
) {
    return rangedAnyBinarySearch(values, item, compare, 0, values.length);
}

/** Finds any matching index in range.  Use if index values are unique
 * @public
 */
export function rangedAnyBinarySearch<T>(
    values: T[],
    item: T,
    compare: CompareFtn<T>,
    index: Integer,
    count: Integer
): BinarySearchResult {

    if (index < 0 || (index >= values.length && count > 0) || index + count - 1 >= values.length || count < 0) {
        throw new AssertInternalError('USRBS25632988827', `${index} ${values.length} ${count}`);
    } else {
        if (count === 0) {
            return {
                found: false,
                index
            };
        } else {
            let found = false;
            let l = index;
            let h = index + count - 1;
            while (l <= h) {
                /* eslint-disable no-bitwise */
                const mid = l + ((h - l) >> 1);
                /* eslint-enable no-bitwise */
                const cmp = compare(values[mid], item);
                if (cmp < ComparisonResult.LeftEqualsRight) {
                    l = mid + 1;
                } else {
                    h = mid - 1;
                    if (cmp === ComparisonResult.LeftEqualsRight) {
                        found = true;
                        break;
                    }
                }
            }
            return {
                found,
                index: l
            };
        }
    }
}

/** Finds earliest matching index.  Use if index values are not unique
 * @public
 */

export function earliestBinarySearch<T>(
    values: T[],
    item: T,
    compare: CompareFtn<T>
) {
    return rangedEarliestBinarySearch(values, item, compare, 0, values.length);
}

/** Finds earliest matching index in range.  Use if index values are not unique
 * @public
 */
export function rangedEarliestBinarySearch<T>(
    values: T[],
    item: T,
    compare: CompareFtn<T>,
    index: Integer,
    count: Integer
): BinarySearchResult {

    if (index < 0 || (index >= values.length && count > 0) || index + count - 1 >= values.length || count < 0) {
        throw new AssertInternalError('USRBS25632988827', `${index} ${values.length} ${count}`);
    } else {
        if (count === 0) {
            return {
                found: false,
                index
            };
        } else {
            let found = false;
            let l = index;
            let h = index + count - 1;
            while (l <= h) {
                /* eslint-disable no-bitwise */
                const mid = l + ((h - l) >> 1);
                /* eslint-enable no-bitwise */
                const cmp = compare(values[mid], item);
                if (cmp < ComparisonResult.LeftEqualsRight) {
                    l = mid + 1;
                } else {
                    h = mid - 1;
                    if (cmp === ComparisonResult.LeftEqualsRight) {
                        found = true;
                    }
                }
            }
            return {
                found,
                index: l
            };
        }
    }
}

/** Finds earliest matching index.  Use if index values are not unique
 * @public
 */
export function latestBinarySearch<T>(
    values: T[],
    item: T,
    compare: CompareFtn<T>
) {
    return rangedLatestBinarySearch(values, item, compare, 0, values.length);
}

/** Finds latest matching index.  Use if index values are not unique
 * @public
 */
export function rangedLatestBinarySearch<T>(
    values: T[],
    item: T,
    compare: CompareFtn<T>,
    index: Integer,
    count: Integer
): BinarySearchResult {

    if (index < 0 || (index >= values.length && count > 0) || index + count - 1 >= values.length || count < 0) {
        throw new AssertInternalError('USRBS25632988827', `${index} ${values.length} ${count}`);
    } else {
        if (count === 0) {
            return {
                found: false,
                index
            };
        } else {
            let found = false;
            let l = index;
            let h = index + count - 1;
            while (l <= h) {
                /* eslint-disable no-bitwise */
                const mid = l + ((h - l) >> 1);
                /* eslint-enable no-bitwise */
                const cmp = compare(values[mid], item);
                if (cmp > ComparisonResult.LeftEqualsRight) {
                    h = mid - 1;
                } else {
                    l = mid + 1;
                    if (cmp === ComparisonResult.LeftEqualsRight) {
                        found = true;
                    }
                }
            }
            return {
                found,
                index: found ? h : h + 1
            };
        }
    }
}

/** @public */
export function quickSort<T>(values: T[], compareFtn: CompareFtn<T>) {
    firstLastRangedQuickSort(values, compareFtn, 0, values.length - 1);
}

/** @public */
export function rangedQuickSort<T>(values: T[], compareFtn: CompareFtn<T>, index: Integer, count: Integer) {
    firstLastRangedQuickSort(values, compareFtn, index, index + count - 1);
}

/** @public */
export function firstLastRangedQuickSort<T>(values: T[], compareFtn: CompareFtn<T>, firstIdx: Integer, lastIdx: Integer) {
    if (values.length > 0 && (lastIdx - firstIdx) > 0) {
        let i = firstIdx;
        let j = lastIdx;
        const pivot = values[Math.floor((firstIdx + lastIdx) / 2)];
        while (i <= j) {
            while (compareFtn(values[i], pivot) < ComparisonResult.LeftEqualsRight) {
                i++;
            }
            while (compareFtn(values[j], pivot) > ComparisonResult.LeftEqualsRight) {
                j--;
            }

            if (i <= j) {
                [values[i], values[j]] = [values[j], values[i]]; // swap

                i++;
                j--;
            }
        }

        if (firstIdx < j) {
            firstLastRangedQuickSort(values, compareFtn, firstIdx, j);
        }

        if (i < lastIdx) {
            firstLastRangedQuickSort(values, compareFtn, i, lastIdx);
        }
    }
}
