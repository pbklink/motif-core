/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    RevRecordRecentChangeTypeId,
    RevRecordValueRecentChangeTypeId,
} from '@xilytix/revgrid';
import {
    DataServer,
    DatalessViewCell,
    StandardTextPainter
} from '@xilytix/revgrid';
import { HigherLowerId, OrderSideId } from '../../../../adi/internal-api';
import { ColorRenderValue, ColorScheme, RenderValue, SettingsService } from '../../../../services/internal-api';
import { CorrectnessId, IndexSignatureHack, Integer, UnreachableCaseError } from '../../../../sys/internal-api';
import { TextFormatterService } from '../../../../text-format/internal-api';
import { GridField } from '../../../field/internal-api';
import { DepthRecord, DepthRecordRenderValue } from '../../../record-store/internal-api';
import { AdaptedRevgrid } from '../../adapted-revgrid/internal-api';
import { RecordGridDataServer } from '../../record-grid/record-grid-data-server';
import { AdaptedRevgridBehavioredColumnSettings } from '../../settings/internal-api';
import { RenderValueCellPainter } from './render-value-cell-painter';

export class TextRenderValueCellPainter extends RenderValueCellPainter {
    private readonly _textPainter: StandardTextPainter;

    constructor(settingsService: SettingsService, private readonly _textFormatterService: TextFormatterService, grid: AdaptedRevgrid, dataServer: DataServer<GridField>) {
        super(settingsService, grid, dataServer);
        this._textPainter = new StandardTextPainter(this._renderingContext);
    }

    paintValue(cell: DatalessViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>, prefillColor: string | undefined, renderValue: RenderValue): Integer | undefined {
        const columnSettings = cell.columnSettings;

        const baseBkgdForeColors = this.calculateBaseColors(cell, prefillColor);
        const altRow = baseBkgdForeColors.altRow;
        const rowFocused = baseBkgdForeColors.rowFocused;
        let bkgdColor = baseBkgdForeColors.bkgdColor;
        let foreColor = baseBkgdForeColors.foreColor;
        const focusedCellBorderColor = baseBkgdForeColors.focusedCellBorderColor;
        const focusedRowBorderColor = baseBkgdForeColors.focusedRowBorderColor;
        const focusedRowBorderWidth = baseBkgdForeColors.focusedRowBorderWidth;

        let horizontalAlign = columnSettings.horizontalAlign;
        let graphicId = TextRenderValueCellPainter.GraphicId.None;
        let proportionBarGraphic: TextRenderValueCellPainter.ProportionBarGraphic | undefined;
        const subgridRowIndex = cell.viewLayoutRow.subgridRowIndex;
        const field = cell.viewLayoutColumn.column.field;

        const attributes = renderValue.attributes;

        for (let i = attributes.length - 1; i >= 0; i--) {
            const attribute = attributes[i];
            switch (attribute.typeId) {
                case RenderValue.Attribute.TypeId.Correctness: {
                    const correctnessAttribute =
                        attribute as RenderValue.CorrectnessAttribute;
                    const correctnessId = correctnessAttribute.correctnessId;
                    switch (correctnessId) {
                        case CorrectnessId.Suspect:
                            if (altRow) {
                                foreColor = this._colorSettings.getFore(
                                    ColorScheme.ItemId.Grid_DataSuspectAlt
                                );
                            } else {
                                foreColor = this._colorSettings.getFore(
                                    ColorScheme.ItemId.Grid_DataSuspect
                                );
                            }
                            break;
                        case CorrectnessId.Error:
                            if (altRow) {
                                foreColor = this._colorSettings.getFore(
                                    ColorScheme.ItemId.Grid_DataErrorAlt
                                );
                            } else {
                                foreColor = this._colorSettings.getFore(
                                    ColorScheme.ItemId.Grid_DataError
                                );
                            }
                            break;
                    }
                    break;
                }

                case RenderValue.Attribute.TypeId.HigherLower: {
                    const higherLowerAttribute =
                        attribute as RenderValue.HigherLowerAttribute;
                    const higherLowerId = higherLowerAttribute.higherLowerId;
                    switch (higherLowerId) {
                        case HigherLowerId.Higher:
                            foreColor = this._colorSettings.getFore(
                                ColorScheme.ItemId.Grid_UpValue
                            );
                            break;
                        case HigherLowerId.Lower:
                            foreColor = this._colorSettings.getFore(
                                ColorScheme.ItemId.Grid_DownValue
                            );
                            break;
                    }
                    break;
                }

                case RenderValue.Attribute.TypeId.BackgroundColor: {
                    if (renderValue instanceof ColorRenderValue) {
                        if (renderValue.isUndefined()) {
                            graphicId = TextRenderValueCellPainter.GraphicId.UndefinedColor;
                        } else {
                            if (renderValue.definedData === ColorScheme.schemeInheritColor) {
                                graphicId = TextRenderValueCellPainter.GraphicId.InheritColor;
                            } else {
                                bkgdColor = renderValue.definedData;
                            }
                        }
                    }
                    break;
                }

                case RenderValue.Attribute.TypeId.DepthRecord: {
                    const depthRecordAttribute = attribute as DepthRecordRenderValue.Attribute;
                    let depthRecordItemId: ColorScheme.ItemId;
                    if (depthRecordAttribute.ownOrder) {
                        depthRecordItemId = altRow ? ColorScheme.ItemId.Grid_MyOrderAlt : ColorScheme.ItemId.Grid_MyOrder;
                    } else {
                        depthRecordItemId =
                            TextRenderValueCellPainter.calculateDepthRecordBidAskOrderPriceLevelColorSchemeItemId(
                                depthRecordAttribute.orderSideId,
                                depthRecordAttribute.depthRecordTypeId,
                                altRow
                            );
                    }
                    bkgdColor = this._colorSettings.getBkgd(depthRecordItemId);
                    break;
                }

                case RenderValue.Attribute.TypeId.DepthCountXRefField: {
                    const depthCountXRefFieldAttribute = attribute as RenderValue.DepthCountXRefFieldAttribute;
                    if (depthCountXRefFieldAttribute.isCountAndXrefs) {
                        horizontalAlign = 'right';
                    } else {
                        horizontalAlign = 'left';
                    }
                    break;
                }

                case RenderValue.Attribute.TypeId.DepthRecordInAuction: {
                    const depthRecordInAuctionAttribute =
                        attribute as RenderValue.DepthRecordInAuctionAttribute;
                    const auctionItemId = altRow ? ColorScheme.ItemId.Grid_PriceSellOverlapAlt : ColorScheme.ItemId.Grid_PriceSellOverlap;
                    if (depthRecordInAuctionAttribute.partialAuctionProportion === undefined) {
                        bkgdColor = this._colorSettings.getBkgd(auctionItemId);
                    } else {
                        graphicId = TextRenderValueCellPainter.GraphicId.ProportionBar;
                        proportionBarGraphic = {
                            color: this._colorSettings.getBkgd(auctionItemId),
                            proportion: depthRecordInAuctionAttribute.partialAuctionProportion,
                        };
                    }
                    break;
                }

                case RenderValue.Attribute.TypeId.OwnOrder: {
                    // Note that Depth does not use this attribute as it has a custom attribute
                    const ownOrderRecordItemId = altRow ? ColorScheme.ItemId.Grid_MyOrderAlt : ColorScheme.ItemId.Grid_MyOrder;
                    bkgdColor = this._colorSettings.getBkgd(ownOrderRecordItemId);
                    break;
                }

                case RenderValue.Attribute.TypeId.Cancelled: {
                    graphicId = TextRenderValueCellPainter.GraphicId.LineThrough;
                    break;
                }

                case RenderValue.Attribute.TypeId.Canceller:
                case RenderValue.Attribute.TypeId.GreyedOut: {
                    foreColor = this._colorSettings.getFore(ColorScheme.ItemId.Grid_GreyedOut);
                    break;
                }

                case RenderValue.Attribute.TypeId.Advert: {
                    if (!rowFocused) {
                        bkgdColor = this._colorSettings.getBkgd(ColorScheme.ItemId.Grid_Advert);
                    }
                    break;
                }

                default:
                    throw new UnreachableCaseError('GCRDGCRP333389', attribute.typeId);
            }
        }

        const foreText = this._textFormatterService.formatRenderValue(renderValue);
        const foreFont = this._gridSettings.font;
        let internalBorderRowOnly: boolean;

        let internalBorderColor: string | undefined;
        if (this.dataServer instanceof RecordGridDataServer) {
            const valueRecentChangeTypeId = this.dataServer.getValueRecentChangeTypeId(field, subgridRowIndex);
            if (valueRecentChangeTypeId !== undefined) {
                internalBorderRowOnly = false;
                switch (valueRecentChangeTypeId) {
                    case RevRecordValueRecentChangeTypeId.Update:
                        internalBorderColor = this._colorSettings.getFore(ColorScheme.ItemId.Grid_ValueRecentlyModifiedBorder);
                        break;
                    case RevRecordValueRecentChangeTypeId.Increase:
                        internalBorderColor = this._colorSettings.getFore(ColorScheme.ItemId.Grid_ValueRecentlyModifiedUpBorder);
                        break;
                    case RevRecordValueRecentChangeTypeId.Decrease:
                        internalBorderColor = this._colorSettings.getFore(ColorScheme.ItemId.Grid_ValueRecentlyModifiedDownBorder);
                        break;
                    default:
                        throw new UnreachableCaseError('GCPPRVCTU02775', valueRecentChangeTypeId);
                }
            } else {
                const recordRecentChangeTypeId = this.dataServer.getRecordRecentChangeTypeId(subgridRowIndex);
                if (recordRecentChangeTypeId !== undefined) {
                    internalBorderRowOnly = true;

                    switch (recordRecentChangeTypeId) {
                        case RevRecordRecentChangeTypeId.Update:
                            internalBorderColor = this._colorSettings.getFore(ColorScheme.ItemId.Grid_RowRecordRecentlyChangedBorder);
                            break;
                        case RevRecordRecentChangeTypeId.Insert:
                            internalBorderColor = this._colorSettings.getFore(ColorScheme.ItemId.Grid_RowRecentlyAddedBorder);
                            break;
                        case RevRecordRecentChangeTypeId.Remove:
                            internalBorderColor = undefined;
                            break;
                        default:
                            throw new UnreachableCaseError('TCPPRRCTU02775', recordRecentChangeTypeId);
                    }

                } else {
                    internalBorderRowOnly = false;
                    internalBorderColor = undefined;
                }
            }
        } else {
            internalBorderRowOnly = false;
        }

        const newFingerprint: TextRenderValueCellPainter.TextPaintFingerprint = {
            bkgdColor,
            foreColor,
            internalBorderColor,
            internalBorderRowOnly,
            focusedCellBorderColor,
            focusedRowBorderColor,
            focusedRowBorderWidth,
            foreText,
        };

        let oldFingerprint: TextRenderValueCellPainter.TextPaintFingerprint | undefined;
        if (prefillColor === undefined) {
            oldFingerprint = cell.paintFingerprint as TextRenderValueCellPainter.TextPaintFingerprint | undefined;
        } else {
            oldFingerprint = {
                bkgdColor: prefillColor,
                foreColor: '',
                internalBorderColor: undefined,
                internalBorderRowOnly: false,
                focusedCellBorderColor: undefined,
                focusedRowBorderColor: undefined,
                focusedRowBorderWidth: 0,
                foreText: '',
            };
        }

        if (
            oldFingerprint !== undefined &&
            TextRenderValueCellPainter.TextPaintFingerprint.same(oldFingerprint, newFingerprint)
        ) {
            return undefined;
        } else {
            const bounds = cell.bounds;
            this.paintBackgroundBorderFocus(
                bounds,
                prefillColor,
                bkgdColor,
                internalBorderColor,
                internalBorderRowOnly,
                focusedCellBorderColor,
                focusedRowBorderColor,
                focusedRowBorderWidth,
            );

            const cellPadding = this._scalarSettings.grid_CellPadding;
            const gc = this._renderingContext;

            if (graphicId !== TextRenderValueCellPainter.GraphicId.None) {
                const x = bounds.x;
                const y = bounds.y;
                const width = bounds.width;
                const height = bounds.height;
                switch (graphicId) {
                    case TextRenderValueCellPainter.GraphicId.UndefinedColor: {
                        const paddedLeftX = x + cellPadding;
                        const paddedRightX = x + width - cellPadding;
                        const paddedTopY = y + cellPadding;
                        const paddedBottomY = y + height - cellPadding;

                        gc.cache.strokeStyle = foreColor;
                        gc.beginPath();
                        gc.moveTo(paddedLeftX, paddedTopY);
                        gc.lineTo(paddedRightX, paddedBottomY);
                        gc.stroke();
                        gc.beginPath();
                        gc.moveTo(paddedRightX, paddedTopY);
                        gc.lineTo(paddedLeftX, paddedBottomY);
                        gc.stroke();
                        break;
                    }

                    case TextRenderValueCellPainter.GraphicId.InheritColor: {
                        const inheritColorCenterY = y + height / 2 - 0.5;

                        gc.cache.strokeStyle = foreColor;
                        gc.beginPath();
                        gc.moveTo(x + cellPadding + 2, inheritColorCenterY);
                        gc.lineTo(
                            x + width - cellPadding - 2,
                            inheritColorCenterY
                        );
                        gc.stroke();
                        break;
                    }

                    case TextRenderValueCellPainter.GraphicId.ProportionBar: {
                        if (proportionBarGraphic !== undefined) {
                            const barWidth =
                                proportionBarGraphic.proportion * width;
                            gc.cache.fillStyle = proportionBarGraphic.color;
                            gc.fillRect(x, y, barWidth, height);
                        }
                        break;
                    }

                    case TextRenderValueCellPainter.GraphicId.LineThrough: {
                        const lineThroughcenterY = y + height / 2 - 0.5;

                        gc.cache.strokeStyle = foreColor;
                        gc.beginPath();
                        gc.moveTo(x, lineThroughcenterY);
                        gc.lineTo(x + width, lineThroughcenterY);
                        gc.stroke();
                        break;
                    }

                    default:
                        throw new UnreachableCaseError(
                            'GCRDGCRP2284',
                            graphicId
                        );
                }
            }

            gc.cache.fillStyle = foreColor;
            gc.cache.font = foreFont;
            this._textPainter.setColumnSettings(columnSettings);
            return this._textPainter.renderSingleLineText(bounds, foreText, cellPadding, cellPadding, horizontalAlign);
        }
    }
}

export namespace TextRenderValueCellPainter {
    export const enum GraphicId {
        None,
        UndefinedColor,
        InheritColor,
        ProportionBar,
        LineThrough,
    }

    export interface TextPaintFingerprintInterface extends RenderValueCellPainter.PaintFingerprintInterface {
        foreColor: string;
        foreText: string;
    }

    export type TextPaintFingerprint = IndexSignatureHack<TextPaintFingerprintInterface>;

    export namespace TextPaintFingerprint {
        export function same(left: TextPaintFingerprint, right: TextPaintFingerprint) {
            if (RenderValueCellPainter.PaintFingerprint.same(left, right)) {
                return (
                    left.foreText === right.foreText &&
                    left.foreColor === right.foreColor
                );
            } else {
                return false;
            }
        }
    }

    export interface ProportionBarGraphic {
        color: string;
        proportion: number;
    }
    export function calculateDepthRecordBidAskOrderPriceLevelColorSchemeItemId(
        sideId: OrderSideId,
        typeId: DepthRecord.TypeId,
        altRow: boolean
    ) {
        switch (sideId) {
            case OrderSideId.Bid:
                switch (typeId) {
                    case DepthRecord.TypeId.Order:
                        if (altRow) {
                            return ColorScheme.ItemId.Grid_OrderBuyAlt;
                        } else {
                            return ColorScheme.ItemId.Grid_OrderBuy;
                        }
                    case DepthRecord.TypeId.PriceLevel:
                        if (altRow) {
                            return ColorScheme.ItemId.Grid_PriceBuyAlt;
                        } else {
                            return ColorScheme.ItemId.Grid_PriceBuy;
                        }
                    default:
                        throw new UnreachableCaseError(
                            'GCRCDRBAOPLCSIIB23467',
                            typeId
                        );
                }

            case OrderSideId.Ask:
                switch (typeId) {
                    case DepthRecord.TypeId.Order:
                        if (altRow) {
                            return ColorScheme.ItemId.Grid_OrderSellAlt;
                        } else {
                            return ColorScheme.ItemId.Grid_OrderSell;
                        }
                    case DepthRecord.TypeId.PriceLevel:
                        if (altRow) {
                            return ColorScheme.ItemId.Grid_PriceSellAlt;
                        } else {
                            return ColorScheme.ItemId.Grid_PriceSell;
                        }
                    default:
                        throw new UnreachableCaseError(
                            'GCRCDRBAOPLCSIIA22985',
                            typeId
                        );
                }

            default:
                throw new UnreachableCaseError('GCRCDRBAOPLCSII11187', sideId);
        }
    }
}
