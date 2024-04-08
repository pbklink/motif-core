/**
 * %license Motif
 * (c) 2022 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BadnessMappedComparableList, Integer, MultiEvent, UnreachableCaseError, UsableListChangeTypeId } from '../sys/internal-api';
import { Scan } from './scan';
import { ScanList } from './scan-list';

export class SymbolListEnabledUsableScanList extends BadnessMappedComparableList<Scan> {
    private readonly _scanListScanValuesChangedSubscriptionIds = new Array<MultiEvent.SubscriptionId>();

    private _scanListBadnessChangedSubscriptionId: MultiEvent.SubscriptionId;
    private _scanListListChangeSubscriptionId: MultiEvent.SubscriptionId;

    constructor(private readonly _scanList: ScanList) {
        super();

        this._scanListBadnessChangedSubscriptionId = this._scanList.subscribeBadnessChangedEvent(() => this.setBadness(this._scanList.badness));
        this._scanListListChangeSubscriptionId = _scanList.subscribeListChangeEvent(
            (listChangeTypeId, index, count) => this.processScanListListChangeEvent(listChangeTypeId, index, count)
        );

        if (_scanList.usable) {
            const count = _scanList.count;
            if (count > 0) {
                this.addScanListRange(0, count);
            }
            this.setUsable(this._scanList.badness);
        } else {
            this.setUnusable(this._scanList.badness);
        }
    }

    override finalise() {
        this._scanList.unsubscribeBadnessChangedEvent(this._scanListBadnessChangedSubscriptionId);
        this._scanListBadnessChangedSubscriptionId = undefined;
        this._scanList.unsubscribeListChangeEvent(this._scanListListChangeSubscriptionId);
        this._scanListListChangeSubscriptionId = undefined;
        super.finalise();
    }

    private processScanListListChangeEvent(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable:
                if (this.count > 0) {
                    this.clear();
                }
                break;
            case UsableListChangeTypeId.PreUsableAdd:
                this.addScanListRange(index, count);
                break;
            case UsableListChangeTypeId.PreUsableClear:
                if (this.count > 0) {
                    this.clear();
                }
                break;
            case UsableListChangeTypeId.Usable:
                // nothing to do
                break;
            case UsableListChangeTypeId.Insert:
                this.addScanListRange(index, count);
                break;
            case UsableListChangeTypeId.BeforeReplace:
                this.removeScanListRange(index, count);
                break;
            case UsableListChangeTypeId.AfterReplace:
                this.addScanListRange(index, count);
                break;
            case UsableListChangeTypeId.BeforeMove:
            case UsableListChangeTypeId.AfterMove:
                break; // Don't care about position so ignore
            case UsableListChangeTypeId.Remove:
                this.removeScanListRange(index, count);
                break;
            case UsableListChangeTypeId.Clear:
                if (this.count > 0) {
                    this.clear();
                }
                break;
            default:
                throw new UnreachableCaseError('SLEUSLPSLLCE55557', listChangeTypeId);
        }
    }

    private addScanListRange(scanListIndex: Integer, scanListCount: Integer) {
        const symbolListEnableScans = new Array<Scan>(scanListCount);
        const afterRangeIndex = scanListIndex + scanListCount;
        const valuesChangedSubscriptionIds = new Array<MultiEvent.SubscriptionId>(scanListCount);
        let valuesChangedSubscriptionIdCount = 0;
        let symbolListEnabledScanCount = 0;
        for (let i = scanListIndex; i < afterRangeIndex; i++) {
            const scan = this._scanList.getAt(i);
            valuesChangedSubscriptionIds[valuesChangedSubscriptionIdCount++] = scan.subscribeValuesChangedEvent(
                (valueChanges) => this.processScanValuesChangedEvent(scan, valueChanges)
            );
            if (scan.symbolListEnabled) {
                symbolListEnableScans[symbolListEnabledScanCount++] = scan;
            }
        }

        this._scanListScanValuesChangedSubscriptionIds.splice(scanListIndex, 0, ...valuesChangedSubscriptionIds);
        this.addSubRange(symbolListEnableScans, 0, symbolListEnabledScanCount);
    }

    private removeScanListRange(scanListIndex: Integer, scanListCount: Integer) {
        switch (scanListCount) {
            case 0:
                break;
            case 1:
                this.remove(this._scanList.getAt(scanListIndex));
                break;
            default: {
                const removeItems = this._scanList.items.slice(scanListIndex, scanListIndex + scanListCount);
                this.removeItems(removeItems);
            }
        }
    }

    private processScanValuesChangedEvent(scan: Scan, valueChanges: Scan.ValueChange[]) {
        const count = valueChanges.length;
        for (let i = 0; i < count; i++) {
            const change = valueChanges[i];
            if (change.fieldId === Scan.FieldId.SymbolListEnabled) {
                if (scan.symbolListEnabled) {
                    this.add(scan);
                } else {
                    this.remove(scan);
                }
            }
        }
    }
}
