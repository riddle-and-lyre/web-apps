/*
 *
 * (c) Copyright Ascensio System Limited 2010-2016
 *
 * This program is freeware. You can redistribute it and/or modify it under the terms of the GNU 
 * General Public License (GPL) version 3 as published by the Free Software Foundation (https://www.gnu.org/copyleft/gpl.html).
 * In accordance with Section 7(a) of the GNU GPL its Section 15 shall be amended to the effect that 
 * Ascensio System SIA expressly excludes the warranty of non-infringement of any third-party rights.
 *
 * THIS PROGRAM IS DISTRIBUTED WITHOUT ANY WARRANTY; WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR
 * FITNESS FOR A PARTICULAR PURPOSE. For more details, see GNU GPL at https://www.gnu.org/copyleft/gpl.html
 *
 * You can contact Ascensio System SIA by email at sales@onlyoffice.com
 *
 * The interactive user interfaces in modified source and object code versions of ONLYOFFICE must display 
 * Appropriate Legal Notices, as required under Section 5 of the GNU GPL version 3.
 *
 * Pursuant to Section 7  3(b) of the GNU GPL you must retain the original ONLYOFFICE logo which contains 
 * relevant author attributions when distributing the software. If the display of the logo in its graphic 
 * form is not reasonably feasible for technical reasons, you must include the words "Powered by ONLYOFFICE" 
 * in every copy of the program you distribute.
 * Pursuant to Section 7  3(e) we decline to grant you any rights under trademark law for use of our trademarks.
 *
*/
/**
 *  ChartSettingsDlg.js
 *
 *  Created by Julia Radzhabova on 4/04/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

define([    'text!spreadsheeteditor/main/app/template/ChartSettingsDlg.template',
    'common/main/lib/view/AdvancedSettingsWindow',
    'common/main/lib/component/CheckBox',
    'common/main/lib/component/InputField',
    'spreadsheeteditor/main/app/view/CellRangeDialog'
], function (contentTemplate) {
    'use strict';

    SSE.Views.ChartSettingsDlg = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 322,
            height: 535,
            toggleGroup: 'chart-settings-dlg-group',
            storageName: 'sse-chart-settings-adv-category'
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle,
                items: [
                    {panelId: 'id-chart-settings-dlg-style',        panelCaption: this.textTypeData},
                    {panelId: 'id-chart-settings-dlg-layout',       panelCaption: this.textLayout},
                    {panelId: 'id-chart-settings-dlg-vert',         panelCaption: this.textVertAxis},
                    {panelId: 'id-chart-settings-dlg-hor',          panelCaption: this.textHorAxis}
                ],
                contentTemplate: _.template(contentTemplate)({
                    scope: this
                })
            }, options);
            this.options.handler = function(result, value) {
                if ( result != 'ok' || this.isRangeValid() ) {
                    if (options.handler)
                        options.handler.call(this, result, value);
                    return;
                }
                return true;
            };

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);

            this._state = {
                ChartStyle: 1,
                ChartType: Asc.c_oAscChartTypeSettings.barNormal
            };
            this._noApply = true;

            this.api = this.options.api;
            this.chartSettings = this.options.chartSettings;
            this.vertAxisProps = null;
            this.horAxisProps = null;
            this.currentAxisProps = null;
            this.dataRangeValid = '';
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);

            var me = this;
            var $window = this.getChild();

            // Layout

            var menuAddAlign = function(menuRoot, left, top) {
                var self = this;
                if (!$window.hasClass('notransform')) {
                    $window.addClass('notransform');
                    menuRoot.addClass('hidden');
                    setTimeout(function() {
                        menuRoot.removeClass('hidden');
                        menuRoot.css({left: left, top: top});
                        self.options.additionalAlign = null;
                    }, 500);
                } else {
                    menuRoot.css({left: left, top: top});
                    self.options.additionalAlign = null;
                }
            };
            this.btnChartType = new Common.UI.Button({
                cls         : 'btn-large-dataview',
                iconCls     : 'item-chartlist bar-normal',
                menu        : new Common.UI.Menu({
                    style: 'width: 560px;',
                    additionalAlign: menuAddAlign,
                    items: [
                        { template: _.template('<div id="id-chart-dlg-menu-type" class="menu-insertchart"  style="margin: 5px 5px 5px 10px;"></div>') }
                    ]
                })
            });
            this.btnChartType.on('render:after', function(btn) {
                me.mnuChartTypePicker = new Common.UI.DataView({
                    el: $('#id-chart-dlg-menu-type'),
                    parentMenu: btn.menu,
                    restoreHeight: 411,
                    groups: new Common.UI.DataViewGroupStore([
                        { id: 'menu-chart-group-bar',     caption: me.textColumn },
                        { id: 'menu-chart-group-line',    caption: me.textLine },
                        { id: 'menu-chart-group-pie',     caption: me.textPie },
                        { id: 'menu-chart-group-hbar',    caption: me.textBar },
                        { id: 'menu-chart-group-area',    caption: me.textArea },
                        { id: 'menu-chart-group-scatter', caption: me.textPoint },
                        { id: 'menu-chart-group-stock',   caption: me.textStock }
                    ]),
                    store: new Common.UI.DataViewStore([
                        { group: 'menu-chart-group-bar',     type: Asc.c_oAscChartTypeSettings.barNormal,          iconCls: 'column-normal', selected: true},
                        { group: 'menu-chart-group-bar',     type: Asc.c_oAscChartTypeSettings.barStacked,         iconCls: 'column-stack'},
                        { group: 'menu-chart-group-bar',     type: Asc.c_oAscChartTypeSettings.barStackedPer,      iconCls: 'column-pstack'},
                        { group: 'menu-chart-group-bar',     type: Asc.c_oAscChartTypeSettings.barNormal3d,        iconCls: 'column-3d-normal'},
                        { group: 'menu-chart-group-bar',     type: Asc.c_oAscChartTypeSettings.barStacked3d,       iconCls: 'column-3d-stack'},
                        { group: 'menu-chart-group-bar',     type: Asc.c_oAscChartTypeSettings.barStackedPer3d,    iconCls: 'column-3d-pstack'},
                        { group: 'menu-chart-group-bar',     type: Asc.c_oAscChartTypeSettings.barNormal3dPerspective,    iconCls: 'column-3d-normal-per'},
                        { group: 'menu-chart-group-line',    type: Asc.c_oAscChartTypeSettings.lineNormal,         iconCls: 'line-normal'},
                        { group: 'menu-chart-group-line',    type: Asc.c_oAscChartTypeSettings.lineStacked,        iconCls: 'line-stack'},
                        { group: 'menu-chart-group-line',    type: Asc.c_oAscChartTypeSettings.lineStackedPer,     iconCls: 'line-pstack'},
                        { group: 'menu-chart-group-line',    type: Asc.c_oAscChartTypeSettings.line3d,             iconCls: 'line-3d'},
                        { group: 'menu-chart-group-pie',     type: Asc.c_oAscChartTypeSettings.pie,                iconCls: 'pie-normal'},
                        { group: 'menu-chart-group-pie',     type: Asc.c_oAscChartTypeSettings.doughnut,           iconCls: 'pie-doughnut'},
                        { group: 'menu-chart-group-pie',     type: Asc.c_oAscChartTypeSettings.pie3d,              iconCls: 'pie-3d-normal'},
                        { group: 'menu-chart-group-hbar',    type: Asc.c_oAscChartTypeSettings.hBarNormal,         iconCls: 'bar-normal'},
                        { group: 'menu-chart-group-hbar',    type: Asc.c_oAscChartTypeSettings.hBarStacked,        iconCls: 'bar-stack'},
                        { group: 'menu-chart-group-hbar',    type: Asc.c_oAscChartTypeSettings.hBarStackedPer,     iconCls: 'bar-pstack'},
                        { group: 'menu-chart-group-hbar',    type: Asc.c_oAscChartTypeSettings.hBarNormal3d,       iconCls: 'bar-3d-normal'},
                        { group: 'menu-chart-group-hbar',    type: Asc.c_oAscChartTypeSettings.hBarStacked3d,      iconCls: 'bar-3d-stack'},
                        { group: 'menu-chart-group-hbar',    type: Asc.c_oAscChartTypeSettings.hBarStackedPer3d,   iconCls: 'bar-3d-pstack'},
                        { group: 'menu-chart-group-area',    type: Asc.c_oAscChartTypeSettings.areaNormal,         iconCls: 'area-normal'},
                        { group: 'menu-chart-group-area',    type: Asc.c_oAscChartTypeSettings.areaStacked,        iconCls: 'area-stack'},
                        { group: 'menu-chart-group-area',    type: Asc.c_oAscChartTypeSettings.areaStackedPer,     iconCls: 'area-pstack'},
                        { group: 'menu-chart-group-scatter', type: Asc.c_oAscChartTypeSettings.scatter,            iconCls: 'point-normal'},
                        { group: 'menu-chart-group-stock',   type: Asc.c_oAscChartTypeSettings.stock,              iconCls: 'stock-normal'}
                    ]),
                    itemTemplate: _.template('<div id="<%= id %>" class="item-chartlist <%= iconCls %>"></div>')
                });
            });
            this.btnChartType.render($('#chart-dlg-button-type'));
            this.mnuChartTypePicker.on('item:click', _.bind(this.onSelectType, this, this.btnChartType));

            this.btnChartStyle = new Common.UI.Button({
                cls         : 'btn-large-dataview',
                iconCls     : 'item-wrap',
                menu        : new Common.UI.Menu({
                    additionalAlign: menuAddAlign,
                    items: [
                        { template: _.template('<div id="id-chart-dlg-menu-style" style="width: 245px; margin: 0 5px;"></div>') }
                    ]
                })
            });
            this.btnChartStyle.on('render:after', function(btn) {
                me.mnuChartStylePicker = new Common.UI.DataView({
                    el: $('#id-chart-dlg-menu-style'),
                    parentMenu: btn.menu,
                    style: 'max-height: 411px;',
                    store: new Common.UI.DataViewStore(),
                    itemTemplate: _.template('<div id="<%= id %>" class="item-wrap" style="background-image: url(<%= imageUrl %>); background-position: 0 0;"></div>')
                });

                if (me.btnChartStyle.menu) {
                    me.btnChartStyle.menu.on('show:after', function () {
                        me.mnuChartStylePicker.scroller.update({alwaysVisibleY: true});
                    });
                }
            });
            this.btnChartStyle.render($('#chart-dlg-button-style'));
            this.mnuChartStylePicker.on('item:click', _.bind(this.onSelectStyle, this, this.btnChartStyle));

            this.cmbDataDirect = new Common.UI.ComboBox({
                el          : $('#chart-dlg-combo-range'),
                menuStyle   : 'min-width: 120px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [
                    { value: 0, displayValue: this.textDataRows },
                    { value: 1, displayValue: this.textDataColumns }
                ]
            });

            this.txtDataRange = new Common.UI.InputField({
                el          : $('#chart-dlg-txt-range'),
                name        : 'range',
                style       : 'width: 100%;',
                allowBlank  : true,
                blankError  : this.txtEmpty,
                validateOnChange: true
            });

            this.btnSelectData = new Common.UI.Button({
                el: $('#chart-dlg-btn-data')
            });
            this.btnSelectData.on('click', _.bind(this.onSelectData, this));

            this.cmbChartTitle = new Common.UI.ComboBox({
                el          : $('#chart-dlg-combo-chart-title'),
                menuStyle   : 'min-width: 140px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [
                    { value: Asc.c_oAscChartTitleShowSettings.none, displayValue: this.textNone },
                    { value: Asc.c_oAscChartTitleShowSettings.overlay, displayValue: this.textOverlay },
                    { value: Asc.c_oAscChartTitleShowSettings.noOverlay, displayValue: this.textNoOverlay }
                ]
            });

            this.cmbLegendPos = new Common.UI.ComboBox({
                el          : $('#chart-dlg-combo-legend-pos'),
                menuStyle   : 'min-width: 140px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [
                    { value: Asc.c_oAscChartLegendShowSettings.none, displayValue: this.textNone },
                    { value: Asc.c_oAscChartLegendShowSettings.bottom, displayValue: this.textLegendBottom },
                    { value: Asc.c_oAscChartLegendShowSettings.top, displayValue: this.textLegendTop },
                    { value: Asc.c_oAscChartLegendShowSettings.right, displayValue: this.textLegendRight },
                    { value: Asc.c_oAscChartLegendShowSettings.left, displayValue: this.textLegendLeft },
                    { value: Asc.c_oAscChartLegendShowSettings.leftOverlay, displayValue: this.textLeftOverlay },
                    { value: Asc.c_oAscChartLegendShowSettings.rightOverlay, displayValue: this.textRightOverlay }
                ]
            });

            this.cmbHorTitle = new Common.UI.ComboBox({
                el          : $('#chart-dlg-combo-hor-title'),
                menuStyle   : 'min-width: 140px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [
                    { value: Asc.c_oAscChartHorAxisLabelShowSettings.none, displayValue: this.textNone },
                    { value: Asc.c_oAscChartHorAxisLabelShowSettings.noOverlay, displayValue: this.textNoOverlay }
                ]
            }).on('selected', _.bind(function(combo, record) {
                if (this.chartSettings)
                    this.chartSettings.putHorAxisLabel(record.value);
            }, this));

            this.cmbVertTitle = new Common.UI.ComboBox({
                el          : $('#chart-dlg-combo-vert-title'),
                menuStyle   : 'min-width: 140px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [
                    { value: Asc.c_oAscChartVertAxisLabelShowSettings.none, displayValue: this.textNone },
                    { value: Asc.c_oAscChartVertAxisLabelShowSettings.rotated, displayValue: this.textRotated },
                    { value: Asc.c_oAscChartVertAxisLabelShowSettings.horizontal, displayValue: this.textHorizontal }
                ]
            }).on('selected', _.bind(function(combo, record) {
                if (this.chartSettings) 
                    this.chartSettings.putVertAxisLabel(record.value);
            }, this));

            this.cmbHorShow = new Common.UI.ComboBox({
                el          : $('#chart-dlg-combo-hor-show'),
                menuStyle   : 'min-width: 140px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [
                    { value: true, displayValue: this.textShow },
                    { value: false, displayValue: this.textHide }
                ]
            }).on('selected', _.bind(function(combo, record) {
                if (this.chartSettings)
                    this.chartSettings.putShowHorAxis(record.value);
            }, this));

            this.cmbVertShow = new Common.UI.ComboBox({
                el          : $('#chart-dlg-combo-vert-show'),
                menuStyle   : 'min-width: 140px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [
                    { value: true, displayValue: this.textShow },
                    { value: false, displayValue: this.textHide }
                ]
            }).on('selected', _.bind(function(combo, record) {
                if (this.chartSettings)
                    this.chartSettings.putShowVerAxis(record.value);
            }, this));

            this.cmbHorGrid = new Common.UI.ComboBox({
                el          : $('#chart-dlg-combo-hor-grid'),
                menuStyle   : 'min-width: 140px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [
                    { value: Asc.c_oAscGridLinesSettings.none, displayValue: this.textNone },
                    { value: Asc.c_oAscGridLinesSettings.major, displayValue: this.textMajor },
                    { value: Asc.c_oAscGridLinesSettings.minor, displayValue: this.textMinor },
                    { value: Asc.c_oAscGridLinesSettings.majorMinor, displayValue: this.textMajorMinor }
                ]
            }).on('selected', _.bind(function(combo, record) {
                if (this.chartSettings) 
                    this.chartSettings.putHorGridLines(record.value);
            }, this));

            this.cmbVertGrid = new Common.UI.ComboBox({
                el          : $('#chart-dlg-combo-vert-grid'),
                menuStyle   : 'min-width: 140px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [
                    { value: Asc.c_oAscGridLinesSettings.none, displayValue: this.textNone },
                    { value: Asc.c_oAscGridLinesSettings.major, displayValue: this.textMajor },
                    { value: Asc.c_oAscGridLinesSettings.minor, displayValue: this.textMinor },
                    { value: Asc.c_oAscGridLinesSettings.majorMinor, displayValue: this.textMajorMinor }
                ]
            }).on('selected', _.bind(function(combo, record) {
                if (this.chartSettings) 
                    this.chartSettings.putVertGridLines(record.value);
            }, this));

            this.cmbDataLabels = new Common.UI.ComboBox({
                el          : $('#chart-dlg-combo-data-labels'),
                menuStyle   : 'min-width: 140px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [
                    { value: Asc.c_oAscChartDataLabelsPos.none, displayValue: this.textNone },
                    { value: Asc.c_oAscChartDataLabelsPos.ctr, displayValue: this.textCenter },
                    { value: Asc.c_oAscChartDataLabelsPos.inBase, displayValue: this.textInnerBottom },
                    { value: Asc.c_oAscChartDataLabelsPos.inEnd, displayValue: this.textInnerTop },
                    { value: Asc.c_oAscChartDataLabelsPos.outEnd, displayValue: this.textOuterTop }
                ]
            });

            this.cmbDataLabels.on('selected', _.bind(me.onSelectDataLabels, this));

            this.txtSeparator = new Common.UI.InputField({
                el          : $('#chart-dlg-txt-separator'),
                name        : 'range',
                style       : 'width: 100%;',
                allowBlank  : true,
                blankError  : this.txtEmpty
            });

            this.chSeriesName = new Common.UI.CheckBox({
                el: $('#chart-dlg-check-series'),
                labelText: this.textSeriesName
            });

            this.chCategoryName = new Common.UI.CheckBox({
                el: $('#chart-dlg-check-category'),
                labelText: this.textCategoryName
            });

            this.chValue = new Common.UI.CheckBox({
                el: $('#chart-dlg-check-value'),
                labelText: this.textValue
            });

            this.cmbLines = new Common.UI.ComboBox({
                el          : $('#chart-dlg-combo-lines'),
                menuStyle   : 'min-width: 140px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [
                    { value: 0, displayValue: this.textNone },
                    { value: 1, displayValue: this.textStraight },
                    { value: 2, displayValue: this.textSmooth }
                ]
            }).on('selected', _.bind(function(combo, record) {
                if (this.chartSettings) {
                    this.chartSettings.putLine(record.value!==0);
                    if (record.value>0)
                        this.chartSettings.putSmooth(record.value==2);
                }
            }, this));

            this.chMarkers = new Common.UI.CheckBox({
                el: $('#chart-dlg-check-markers'),
                labelText: this.textMarkers
            }).on('change', _.bind(function(checkbox, state) {
                if (this.chartSettings) 
                    this.chartSettings.putShowMarker(state=='checked');
            }, this));

            this.lblLines = $('#chart-dlg-label-lines');

            // Vertical Axis

            this.cmbMinType = new Common.UI.ComboBox({
                el          : $('#chart-dlg-combo-mintype'),
                cls         : 'input-group-nr',
                menuStyle   : 'min-width: 100px;',
                editable    : false,
                data        : [
                    {displayValue: this.textAuto, value: Asc.c_oAscValAxisRule.auto},
                    {displayValue: this.textFixed, value: Asc.c_oAscValAxisRule.fixed}
                ]
            }).on('selected', _.bind(function(combo, record) {
                if (this.currentAxisProps) {
                    this.currentAxisProps.putMinValRule(record.value);
                    if (record.value==Asc.c_oAscValAxisRule.auto) {
                        this.spnMinValue.setValue(this._originalAxisVValues.minAuto, true);
                    }
                }
            }, this));

            this.spnMinValue = new Common.UI.MetricSpinner({
                el          : $('#chart-dlg-input-min-value'),
                maxValue    : 1000000,
                minValue    : -1000000,
                step        : 0.1,
                defaultUnit : "",
                defaultValue : 0,
                value       : ''
            }).on('change', _.bind(function(field, newValue, oldValue) {
                this.cmbMinType.suspendEvents();
                this.cmbMinType.setValue(Asc.c_oAscValAxisRule.fixed);
                this.cmbMinType.resumeEvents();
                if (this.currentAxisProps) {
                    this.currentAxisProps.putMinValRule(Asc.c_oAscValAxisRule.fixed);
                    this.currentAxisProps.putMinVal(field.getNumberValue());
                }
            }, this));

            this.cmbMaxType = new Common.UI.ComboBox({
                el          : $('#chart-dlg-combo-maxtype'),
                cls         : 'input-group-nr',
                menuStyle   : 'min-width: 100px;',
                editable    : false,
                data        : [
                    {displayValue: this.textAuto, value: Asc.c_oAscValAxisRule.auto},
                    {displayValue: this.textFixed, value: Asc.c_oAscValAxisRule.fixed}
                ]
            }).on('selected', _.bind(function(combo, record) {
                if (this.currentAxisProps) {
                    this.currentAxisProps.putMaxValRule(record.value);
                    if (record.value==Asc.c_oAscValAxisRule.auto) {
                        this.spnMaxValue.setValue(this._originalAxisVValues.maxAuto, true);
                    }
                }
            }, this));

            this.spnMaxValue = new Common.UI.MetricSpinner({
                el          : $('#chart-dlg-input-max-value'),
                maxValue    : 1000000,
                minValue    : -1000000,
                step        : 0.1,
                defaultUnit : "",
                defaultValue : 0,
                value       : ''
            }).on('change', _.bind(function(field, newValue, oldValue) {
                this.cmbMaxType.suspendEvents();
                this.cmbMaxType.setValue(Asc.c_oAscValAxisRule.fixed);
                this.cmbMaxType.resumeEvents();
                if (this.currentAxisProps) {
                    this.currentAxisProps.putMaxValRule(Asc.c_oAscValAxisRule.fixed);
                    this.currentAxisProps.putMaxVal(field.getNumberValue());
                }
            }, this));

            this.cmbVCrossType = new Common.UI.ComboBox({
                el          : $('#chart-dlg-combo-v-crosstype'),
                cls         : 'input-group-nr',
                menuStyle   : 'min-width: 100px;',
                editable    : false,
                data        : [
                    {displayValue: this.textAuto, value: Asc.c_oAscCrossesRule.auto},
                    {displayValue: this.textValue, value: Asc.c_oAscCrossesRule.value},
                    {displayValue: this.textMinValue, value: Asc.c_oAscCrossesRule.minValue},
                    {displayValue: this.textMaxValue, value: Asc.c_oAscCrossesRule.maxValue}
                ]
            }).on('selected', _.bind(function(combo, record) {
                if (this.currentAxisProps) {
                    this.currentAxisProps.putCrossesRule(record.value);
                    var value;
                    switch (record.value) {
                        case Asc.c_oAscCrossesRule.minValue:
                            this.spnVAxisCrosses.setValue(this.spnMinValue.getNumberValue(), true);
                        break;
                        case Asc.c_oAscCrossesRule.maxValue:
                            this.spnVAxisCrosses.setValue(this.spnMaxValue.getNumberValue(), true);
                        break;
                        case Asc.c_oAscCrossesRule.auto:
                            this.spnVAxisCrosses.setValue(this._originalAxisVValues.crossesAuto, true);
                        break;
                    }
                }
            }, this));

            this.spnVAxisCrosses = new Common.UI.MetricSpinner({
                el          : $('#chart-dlg-input-v-axis-crosses'),
                maxValue    : 1000000,
                minValue    : -1000000,
                step        : 0.1,
                defaultUnit : "",
                defaultValue : 0,
                value       : ''
            }).on('change', _.bind(function(field, newValue, oldValue) {
                this.cmbVCrossType.suspendEvents();
                this.cmbVCrossType.setValue(Asc.c_oAscCrossesRule.value);
                this.cmbVCrossType.resumeEvents();
                if (this.currentAxisProps) {
                    this.currentAxisProps.putCrossesRule(Asc.c_oAscCrossesRule.value);
                    this.currentAxisProps.putCrosses(field.getNumberValue());
                }
            }, this));

            this.cmbUnits = new Common.UI.ComboBox({
                el          : $('#chart-dlg-combo-units'),
                cls         : 'input-group-nr',
                menuStyle   : 'min-width: 140px;',
                editable    : false,
                data        : [
                    {displayValue: this.textNone, value: Asc.c_oAscValAxUnits.none},
                    {displayValue: this.textHundreds, value: Asc.c_oAscValAxUnits.HUNDREDS},
                    {displayValue: this.textThousands, value: Asc.c_oAscValAxUnits.THOUSANDS},
                    {displayValue: this.textTenThousands, value: Asc.c_oAscValAxUnits.TEN_THOUSANDS},
                    {displayValue: this.textHundredThousands, value: Asc.c_oAscValAxUnits.HUNDRED_THOUSANDS},
                    {displayValue: this.textMillions, value: Asc.c_oAscValAxUnits.MILLIONS},
                    {displayValue: this.textTenMillions, value: Asc.c_oAscValAxUnits.TEN_MILLIONS},
                    {displayValue: this.textHundredMil, value: Asc.c_oAscValAxUnits.HUNDRED_MILLIONS},
                    {displayValue: this.textBillions, value: Asc.c_oAscValAxUnits.BILLIONS},
                    {displayValue: this.textTrillions, value: Asc.c_oAscValAxUnits.TRILLIONS}
                ]
            }).on('selected', _.bind(function(combo, record) {
                if (this.currentAxisProps) {
                    this.currentAxisProps.putDispUnitsRule(record.value);
                }
            }, this));

            this.chVReverse = new Common.UI.CheckBox({
                el: $('#chart-dlg-check-v-reverse'),
                labelText: this.textReverse
            }).on('change', _.bind(function(checkbox, state) {
                if (this.currentAxisProps) {
                    this.currentAxisProps.putInvertValOrder(state == 'checked');
                }
            }, this));
            
            this.cmbVMajorType = new Common.UI.ComboBox({
                el          : $('#chart-dlg-combo-v-major-type'),
                cls         : 'input-group-nr',
                menuStyle   : 'min-width: 140px;',
                editable    : false,
                data        : [
                    {displayValue: this.textNone, value: Asc.c_oAscTickMark.TICK_MARK_NONE},
                    {displayValue: this.textCross, value: Asc.c_oAscTickMark.TICK_MARK_CROSS},
                    {displayValue: this.textIn, value: Asc.c_oAscTickMark.TICK_MARK_IN},
                    {displayValue: this.textOut, value: Asc.c_oAscTickMark.TICK_MARK_OUT}
                ]
            }).on('selected', _.bind(function(combo, record) {
                if (this.currentAxisProps) {
                    this.currentAxisProps.putMajorTickMark(record.value);
                }
            }, this));

            this.cmbVMinorType = new Common.UI.ComboBox({
                el          : $('#chart-dlg-combo-v-minor-type'),
                cls         : 'input-group-nr',
                menuStyle   : 'min-width: 140px;',
                editable    : false,
                data        : [
                    {displayValue: this.textNone, value: Asc.c_oAscTickMark.TICK_MARK_NONE},
                    {displayValue: this.textCross, value: Asc.c_oAscTickMark.TICK_MARK_CROSS},
                    {displayValue: this.textIn, value: Asc.c_oAscTickMark.TICK_MARK_IN},
                    {displayValue: this.textOut, value: Asc.c_oAscTickMark.TICK_MARK_OUT}
                ]
            }).on('selected', _.bind(function(combo, record) {
                if (this.currentAxisProps) {
                    this.currentAxisProps.putMinorTickMark(record.value);
                }
            }, this));

            this.cmbVLabelPos = new Common.UI.ComboBox({
                el          : $('#chart-dlg-combo-v-label-pos'),
                cls         : 'input-group-nr',
                menuStyle   : 'min-width: 140px;',
                editable    : false,
                data        : [
                    {displayValue: this.textNone, value: Asc.c_oAscTickLabelsPos.TICK_LABEL_POSITION_NONE},
                    {displayValue: this.textLow, value: Asc.c_oAscTickLabelsPos.TICK_LABEL_POSITION_LOW},
                    {displayValue: this.textHigh, value: Asc.c_oAscTickLabelsPos.TICK_LABEL_POSITION_HIGH},
                    {displayValue: this.textNextToAxis, value: Asc.c_oAscTickLabelsPos.TICK_LABEL_POSITION_NEXT_TO}
                ]
            }).on('selected', _.bind(function(combo, record) {
                if (this.currentAxisProps) {
                    this.currentAxisProps.putTickLabelsPos(record.value);
                }
            }, this));

            // Horizontal Axis

            this.cmbHCrossType = new Common.UI.ComboBox({
                el          : $('#chart-dlg-combo-h-crosstype'),
                cls         : 'input-group-nr',
                menuStyle   : 'min-width: 100px;',
                editable    : false,
                data        : [
                    {displayValue: this.textAuto, value: Asc.c_oAscCrossesRule.auto},
                    {displayValue: this.textValue, value: Asc.c_oAscCrossesRule.value},
                    {displayValue: this.textMinValue, value: Asc.c_oAscCrossesRule.minValue},
                    {displayValue: this.textMaxValue, value: Asc.c_oAscCrossesRule.maxValue}
                ]
            }).on('selected', _.bind(function(combo, record) {
                if (this.currentAxisProps) {
                    this.currentAxisProps.putCrossesRule(record.value);
                    if (record.value==Asc.c_oAscCrossesRule.auto) {
                        this.spnHAxisCrosses.setValue(this._originalAxisHValues.crossesAuto, true);
                    } else if (record.value==Asc.c_oAscCrossesRule.minValue) {
                        this.spnHAxisCrosses.setValue(this._originalAxisHValues.minAuto, true);
                    } else if (record.value==Asc.c_oAscCrossesRule.maxValue) {
                        this.spnHAxisCrosses.setValue(this._originalAxisHValues.maxAuto, true);
                    }
                }
            }, this));

            this.spnHAxisCrosses = new Common.UI.MetricSpinner({
                el          : $('#chart-dlg-input-h-axis-crosses'),
                maxValue    : 1000000,
                minValue    : -1000000,
                step        : 0.1,
                defaultUnit : "",
                defaultValue : 0,
                value       : ''
            }).on('change', _.bind(function(field, newValue, oldValue) {
                this.cmbHCrossType.suspendEvents();
                this.cmbHCrossType.setValue(Asc.c_oAscCrossesRule.value);
                this.cmbHCrossType.resumeEvents();
                if (this.currentAxisProps) {
                    this.currentAxisProps.putCrossesRule(Asc.c_oAscCrossesRule.value);
                    this.currentAxisProps.putCrosses(field.getNumberValue());
                }
            }, this));

            this.cmbAxisPos = new Common.UI.ComboBox({
                el          : $('#chart-dlg-combo-axis-pos'),
                cls         : 'input-group-nr',
                menuStyle   : 'min-width: 140px;',
                editable    : false,
                data        : [
                    {displayValue: this.textOnTickMarks, value: Asc.c_oAscLabelsPosition.byDivisions},
                    {displayValue: this.textBetweenTickMarks, value: Asc.c_oAscLabelsPosition.betweenDivisions}
                ]
            }).on('selected', _.bind(function(combo, record) {
                if (this.currentAxisProps) {
                    this.currentAxisProps.putLabelsPosition(record.value);
                }
            }, this));

            this.chHReverse = new Common.UI.CheckBox({
                el: $('#chart-dlg-check-h-reverse'),
                labelText: this.textReverse
            }).on('change', _.bind(function(checkbox, state) {
                if (this.currentAxisProps) {
                    this.currentAxisProps.putInvertCatOrder(state == 'checked');
                }
            }, this));

            this.cmbHMajorType = new Common.UI.ComboBox({
                el          : $('#chart-dlg-combo-h-major-type'),
                cls         : 'input-group-nr',
                menuStyle   : 'min-width: 140px;',
                editable    : false,
                data        : [
                    {displayValue: this.textNone, value: Asc.c_oAscTickMark.TICK_MARK_NONE},
                    {displayValue: this.textCross, value: Asc.c_oAscTickMark.TICK_MARK_CROSS},
                    {displayValue: this.textIn, value: Asc.c_oAscTickMark.TICK_MARK_IN},
                    {displayValue: this.textOut, value: Asc.c_oAscTickMark.TICK_MARK_OUT}
                ]
            }).on('selected', _.bind(function(combo, record) {
                if (this.currentAxisProps) {
                    this.currentAxisProps.putMajorTickMark(record.value);
                }
            }, this));

            this.cmbHMinorType = new Common.UI.ComboBox({
                el          : $('#chart-dlg-combo-h-minor-type'),
                cls         : 'input-group-nr',
                menuStyle   : 'min-width: 140px;',
                editable    : false,
                data        : [
                    {displayValue: this.textNone, value: Asc.c_oAscTickMark.TICK_MARK_NONE},
                    {displayValue: this.textCross, value: Asc.c_oAscTickMark.TICK_MARK_CROSS},
                    {displayValue: this.textIn, value: Asc.c_oAscTickMark.TICK_MARK_IN},
                    {displayValue: this.textOut, value: Asc.c_oAscTickMark.TICK_MARK_OUT}
                ]
            }).on('selected', _.bind(function(combo, record) {
                if (this.currentAxisProps) {
                    this.currentAxisProps.putMinorTickMark(record.value);
                }
            }, this));

            this.spnMarksInterval = new Common.UI.MetricSpinner({
                el          : $('#chart-dlg-input-marks-interval'),
                width       : 140,
                maxValue    : 1000000,
                minValue    : 1,
                step        : 1,
                defaultUnit : "",
                value       : ''
            }).on('change', _.bind(function(field, newValue, oldValue) {
                if (this.currentAxisProps) {
                    this.currentAxisProps.putIntervalBetweenTick(field.getNumberValue());
                }
            }, this));

            this.cmbHLabelPos = new Common.UI.ComboBox({
                el          : $('#chart-dlg-combo-h-label-pos'),
                cls         : 'input-group-nr',
                menuStyle   : 'min-width: 140px;',
                editable    : false,
                data        : [
                    {displayValue: this.textNone, value: Asc.c_oAscTickLabelsPos.TICK_LABEL_POSITION_NONE},
                    {displayValue: this.textLow, value: Asc.c_oAscTickLabelsPos.TICK_LABEL_POSITION_LOW},
                    {displayValue: this.textHigh, value: Asc.c_oAscTickLabelsPos.TICK_LABEL_POSITION_HIGH},
                    {displayValue: this.textNextToAxis, value: Asc.c_oAscTickLabelsPos.TICK_LABEL_POSITION_NEXT_TO}
                ]
            }).on('selected', _.bind(function(combo, record) {
                if (this.currentAxisProps) {
                    this.currentAxisProps.putTickLabelsPos(record.value);
                }
            }, this));

            this.spnLabelDist = new Common.UI.MetricSpinner({
                el          : $('#chart-dlg-input-label-dist'),
                width       : 140,
                maxValue    : 1000,
                minValue    : 0,
                step        : 1,
                defaultUnit : "",
                value       : ''
            }).on('change', _.bind(function(field, newValue, oldValue) {
                if (this.currentAxisProps) {
                    this.currentAxisProps.putLabelsAxisDistance(field.getNumberValue());
                }
            }, this));

            this.spnLabelInterval = new Common.UI.MetricSpinner({
                el          : $('#chart-dlg-input-label-int'),
                width       : 140,
                maxValue    : 1000000,
                minValue    : 1,
                step        : 1,
                defaultUnit : "",
                value       : ''
            }).on('change', _.bind(function(field, newValue, oldValue) {
                this.cmbLabelInterval.suspendEvents();
                this.cmbLabelInterval.setValue(Asc.c_oAscBetweenLabelsRule.manual);
                this.cmbLabelInterval.resumeEvents();
                if (this.currentAxisProps) {
                    this.currentAxisProps.putIntervalBetweenLabelsRule(Asc.c_oAscBetweenLabelsRule.manual);
                    this.currentAxisProps.putIntervalBetweenLabels(field.getNumberValue());
                }
            }, this));

            this.cmbLabelInterval = new Common.UI.ComboBox({
                el          : $('#chart-dlg-combo-label-int'),
                cls         : 'input-group-nr',
                menuStyle   : 'min-width: 140px;',
                editable    : false,
                data        : [
                    {displayValue: this.textAuto, value: Asc.c_oAscBetweenLabelsRule.auto},
                    {displayValue: this.textManual, value: Asc.c_oAscBetweenLabelsRule.manual}
                ]
            }).on('selected', _.bind(function(combo, record) {
                if (this.currentAxisProps) {
                    this.currentAxisProps.putIntervalBetweenLabelsRule(record.value);
                    if (record.value==Asc.c_oAscBetweenLabelsRule.auto)
                        this.spnLabelInterval.setValue(1, true);
                }
            }, this));

            this.btnsCategory[2].on('click', _.bind(this.onVCategoryClick, this));
            this.btnsCategory[3].on('click', _.bind(this.onHCategoryClick, this));
            this.afterRender();
        },


        afterRender: function() {
            if (this.api)
                this.updateChartStyles(this.api.asc_getChartPreviews(this._state.ChartType));

            this._setDefaults(this.chartSettings);
            if (this.storageName) {
                var value = Common.localStorage.getItem(this.storageName);
                this.setActiveCategory((value!==null) ? parseInt(value) : 0);
                value = this.getActiveCategory();
                if (value==2) this.onVCategoryClick();
                else if (value==3) this.onHCategoryClick();
            }
        },

        onSelectType: function(btn, picker, itemView, record) {
            if (this._noApply) return;

            var rawData = {},
                isPickerSelect = _.isFunction(record.toJSON);

            if (isPickerSelect){
                if (record.get('selected')) {
                    rawData = record.toJSON();
                } else {
                    // record deselected
                    return;
                }
            } else {
                rawData = record;
            }

            this.btnChartType.setIconCls('item-chartlist ' + rawData.iconCls);
            this.updateChartStyles(this.api.asc_getChartPreviews(rawData.type));
            this.chartSettings.changeType(rawData.type);
            this.updateAxisProps(rawData.type, true);
            this.vertAxisProps = this.chartSettings.getVertAxisProps();
            this.horAxisProps = this.chartSettings.getHorAxisProps();
        },

        updateAxisProps: function(type, isDefault) {
            var value = (type == Asc.c_oAscChartTypeSettings.lineNormal || type == Asc.c_oAscChartTypeSettings.lineStacked ||
                          type == Asc.c_oAscChartTypeSettings.lineStackedPer || type == Asc.c_oAscChartTypeSettings.scatter);
            this.chMarkers.setVisible(value);
            this.cmbLines.setVisible(value);
            this.lblLines.toggleClass('hidden', !value);

            if (value) {
                this.chMarkers.setValue(this.chartSettings.getShowMarker(), true);
                this.cmbLines.setValue(this.chartSettings.getLine() ? (this.chartSettings.getSmooth() ? 2 : 1) : 0);
            }

            value = (type == Asc.c_oAscChartTypeSettings.pie || type == Asc.c_oAscChartTypeSettings.doughnut || type == Asc.c_oAscChartTypeSettings.pie3d);
            this.btnsCategory[2].setDisabled(value);
            this.btnsCategory[3].setDisabled(value);
            this.cmbHorShow.setDisabled(value);
            this.cmbVertShow.setDisabled(value);
            this.cmbHorTitle.setDisabled(value);
            this.cmbVertTitle.setDisabled(value);
            this.cmbHorGrid.setDisabled(value);
            this.cmbVertGrid.setDisabled(value);

            this.cmbHorShow.setValue(this.chartSettings.getShowHorAxis());
            this.cmbVertShow.setValue(this.chartSettings.getShowVerAxis());
            this.cmbHorTitle.setValue(this.chartSettings.getHorAxisLabel());
            this.cmbVertTitle.setValue(this.chartSettings.getVertAxisLabel());
            this.cmbHorGrid.setValue(this.chartSettings.getHorGridLines());
            this.cmbVertGrid.setValue(this.chartSettings.getVertGridLines());

            value = (type == Asc.c_oAscChartTypeSettings.hBarNormal || type == Asc.c_oAscChartTypeSettings.hBarStacked || type == Asc.c_oAscChartTypeSettings.hBarStackedPer ||
                     type == Asc.c_oAscChartTypeSettings.hBarNormal3d || type == Asc.c_oAscChartTypeSettings.hBarStacked3d || type == Asc.c_oAscChartTypeSettings.hBarStackedPer3d);
            this.btnsCategory[2].options.contentTarget = (value) ? 'id-chart-settings-dlg-hor' : 'id-chart-settings-dlg-vert';
            this.btnsCategory[3].options.contentTarget = (value || type == Asc.c_oAscChartTypeSettings.scatter) ? 'id-chart-settings-dlg-vert' : 'id-chart-settings-dlg-hor';
        },

        onVCategoryClick: function() {
            (this.vertAxisProps.getAxisType()==Asc.c_oAscAxisType.val) ? this.fillVProps(this.vertAxisProps) : this.fillHProps(this.vertAxisProps);
        },

        onHCategoryClick: function() {
            (this.horAxisProps.getAxisType()==Asc.c_oAscAxisType.val) ? this.fillVProps(this.horAxisProps) : this.fillHProps(this.horAxisProps);
        },

        fillVProps: function(props) {
            if (props.getAxisType() !== Asc.c_oAscAxisType.val) return;
            if (this._originalAxisVValues==undefined) {
                this._originalAxisVValues = {
                    minAuto: (props.getMinVal()==null) ? 0 : props.getMinVal(),
                    maxAuto: (props.getMaxVal()==null) ? 10 : props.getMaxVal(),
                    crossesAuto: (props.getCrosses()==null) ? 0 : props.getCrosses()
                };
            }

            this.cmbMinType.setValue(props.getMinValRule());
            var value = (props.getMinValRule()==Asc.c_oAscValAxisRule.auto) ? this._originalAxisVValues.minAuto : props.getMinVal();
            this.spnMinValue.setValue((value==null) ? '' : value, true);

            this.cmbMaxType.setValue(props.getMaxValRule());
            value = (props.getMaxValRule()==Asc.c_oAscValAxisRule.auto) ? this._originalAxisVValues.maxAuto : props.getMaxVal();
            this.spnMaxValue.setValue((value==null) ? '' : value, true);

            value = props.getCrossesRule();
            this.cmbVCrossType.setValue(value);
            switch (value) {
                case Asc.c_oAscCrossesRule.minValue:
                    value = this.spnMinValue.getNumberValue();
                break;
                case Asc.c_oAscCrossesRule.maxValue:
                    value = this.spnMaxValue.getNumberValue();
                break;
                case Asc.c_oAscCrossesRule.auto:
                    value = this._originalAxisVValues.crossesAuto;
                break;
                default:
                    value = props.getCrosses();
                break;
            }
            this.spnVAxisCrosses.setValue((value==null) ? '' : value, true);

            this.cmbUnits.setValue(props.getDispUnitsRule());
            this.chVReverse.setValue(props.getInvertValOrder(), true);
            this.cmbVMajorType.setValue(props.getMajorTickMark());
            this.cmbVMinorType.setValue(props.getMinorTickMark());
            this.cmbVLabelPos.setValue(props.getTickLabelsPos());

            this.currentAxisProps = props;
        },

        fillHProps: function(props) {
            if (props.getAxisType() !== Asc.c_oAscAxisType.cat) return;
            if (this._originalAxisHValues==undefined) {
                this._originalAxisHValues = {
                    minAuto: (props.getCrossMinVal()==null) ? 0 : props.getCrossMinVal(),
                    maxAuto: (props.getCrossMaxVal()==null) ? 10 : props.getCrossMaxVal(),
                    crossesAuto: (props.getCrosses()==null) ? 0 : props.getCrosses()
                };
            }

            var value = props.getCrossesRule();
            this.cmbHCrossType.setValue(value);
            switch (value) {
                case Asc.c_oAscCrossesRule.minValue:
                    value = this._originalAxisHValues.minAuto;
                break;
                case Asc.c_oAscCrossesRule.maxValue:
                    value = this._originalAxisHValues.maxAuto;
                break;
                case Asc.c_oAscCrossesRule.auto:
                    value = this._originalAxisHValues.crossesAuto;
                break;
                default:
                    value = props.getCrosses();
                break;
            }
            this.spnHAxisCrosses.setValue((value==null) ? '' : value, true);

            this.cmbAxisPos.setValue(props.getLabelsPosition());
            this.chHReverse.setValue(props.getInvertCatOrder(), true);
            this.cmbHMajorType.setValue(props.getMajorTickMark());
            this.cmbHMinorType.setValue(props.getMinorTickMark());
            this.spnMarksInterval.setValue(props.getIntervalBetweenTick(), true);
            this.cmbHLabelPos.setValue(props.getTickLabelsPos());
            this.spnLabelDist.setValue(props.getLabelsAxisDistance(), true);

            value = props.getIntervalBetweenLabelsRule();
            this.cmbLabelInterval.setValue(value);
            this.spnLabelInterval.setValue((value===Asc.c_oAscBetweenLabelsRule.manual) ? props.getIntervalBetweenLabels(): 1, true);

            this.currentAxisProps = props;
        },

        onSelectStyle: function(btn, picker, itemView, record) {
            if (this._noApply) return;

            var rawData = {},
                isPickerSelect = _.isFunction(record.toJSON);

            if (isPickerSelect){
                if (record.get('selected')) {
                    rawData = record.toJSON();
                } else {
                    // record deselected
                    return;
                }
            } else {
                rawData = record;
            }

            var style = 'url(' + rawData.imageUrl + ')';
            var btnIconEl = this.btnChartStyle.cmpEl.find('span.btn-icon');
            btnIconEl.css('background-image', style);

            this._state.ChartStyle = rawData.data;
        },

        updateChartStyles: function(styles) {
            var me = this;
            if (styles && styles.length>0){
                var stylesStore = this.mnuChartStylePicker.store;
                if (stylesStore) {
                    var stylearray = [],
                        selectedIdx = -1,
                        selectedUrl;
                    _.each(styles, function(item, index){
                        stylearray.push({
                            imageUrl: item.asc_getImageUrl(),
                            data    : item.asc_getStyle(),
                            tip     : me.textStyle + ' ' + item.asc_getStyle()
                        });
                        if (me._state.ChartStyle == item.asc_getStyle()) {
                            selectedIdx = index;
                            selectedUrl = item.asc_getImageUrl();
                        }

                    });

                    stylesStore.reset(stylearray, {silent: false});
                }
            }
            this.mnuChartStylePicker.selectByIndex(selectedIdx, true);
            if (selectedIdx>=0 && this.btnChartStyle.cmpEl) {
                var style = 'url(' + selectedUrl + ')';
                var btnIconEl = this.btnChartStyle.cmpEl.find('span.btn-icon');
                btnIconEl.css('background-image', style);
            }
        },

        _setDefaults: function(props) {
            var me = this;
            if (props ){
                this.chartSettings = props;

                this._state.ChartType = props.getType();

                this._noApply = true;

                // Layout

                var record = this.mnuChartTypePicker.store.findWhere({type: this._state.ChartType});
                this.mnuChartTypePicker.selectRecord(record, true);
                if (record) {
                    this.btnChartType.setIconCls('item-chartlist ' + record.get('iconCls'));
                }
                this.updateChartStyles(this.api.asc_getChartPreviews(this._state.ChartType));

                this._noApply = false;

                this._state.ChartStyle = props.getStyle();
                record = this.mnuChartStylePicker.store.findWhere({data: this._state.ChartStyle});
                this.mnuChartStylePicker.selectRecord(record, true);
                if (record) {
                    var btnIconEl = this.btnChartStyle.cmpEl.find('span.btn-icon');
                    btnIconEl.css('background-image', 'url(' + record.get('imageUrl') + ')');
                }

                var value = props.getRange();
                this.txtDataRange.setValue((value) ? value : '');
                this.dataRangeValid = value;

                this.txtDataRange.validation = function(value) {
                    if (_.isEmpty(value)) {
                        if (!me.cmbDataDirect.isDisabled()) me.cmbDataDirect.setDisabled(true);
                        return true;
                    }

                    if (me.cmbDataDirect.isDisabled()) me.cmbDataDirect.setDisabled(false);

                    var isvalid = me.api.asc_checkDataRange(Asc.c_oAscSelectionDialogType.Chart, value, false);
                    return (isvalid==Asc.c_oAscError.ID.DataRangeError) ? me.textInvalidRange : true;
                };

                this.cmbDataDirect.setDisabled(value===null);
                this.cmbDataDirect.setValue(props.getInColumns() ? 1 : 0);

                this.cmbChartTitle.setValue(props.getTitle());
                this.cmbLegendPos.setValue(props.getLegendPos());

                this.cmbDataLabels.setValue(props.getDataLabelsPos());
                this.onSelectDataLabels(this.cmbDataLabels, {value:props.getDataLabelsPos()});

                this.chSeriesName.setValue(this.chartSettings.getShowSerName(), true);
                this.chCategoryName.setValue(this.chartSettings.getShowCatName(), true);
                this.chValue.setValue(this.chartSettings.getShowVal(), true);

                value = props.getSeparator();
                this.txtSeparator.setValue((value) ? value : '');

                // Vertical Axis
                this.vertAxisProps = props.getVertAxisProps();

                // Horizontal Axis
                this.horAxisProps = props.getHorAxisProps();

                this.updateAxisProps(this._state.ChartType);
            }
        },

        getSettings: function() {
            var value,
                type = this.mnuChartTypePicker.getSelectedRec()[0].get('type');

            // Layout

            this.chartSettings.putType(type);
            this.chartSettings.putStyle(this._state.ChartStyle);

            this.chartSettings.putInColumns(this.cmbDataDirect.getValue()==1);
            this.chartSettings.putRange(this.txtDataRange.getValue());

            this.chartSettings.putTitle(this.cmbChartTitle.getValue());
            this.chartSettings.putLegendPos(this.cmbLegendPos.getValue());

            this.chartSettings.putShowHorAxis(this.cmbHorShow.getValue());
            this.chartSettings.putShowVerAxis(this.cmbVertShow.getValue());

            this.chartSettings.putHorAxisLabel(this.cmbHorTitle.getValue());
            this.chartSettings.putVertAxisLabel(this.cmbVertTitle.getValue());

            this.chartSettings.putHorGridLines(this.cmbHorGrid.getValue());
            this.chartSettings.putVertGridLines(this.cmbVertGrid.getValue());

            this.chartSettings.putDataLabelsPos(this.cmbDataLabels.getValue());

            this.chartSettings.putShowSerName(this.chSeriesName.getValue()=='checked');
            this.chartSettings.putShowCatName(this.chCategoryName.getValue()=='checked');
            this.chartSettings.putShowVal(this.chValue.getValue()=='checked');

            this.chartSettings.putSeparator(_.isEmpty(this.txtSeparator.getValue()) ? ' ' : this.txtSeparator.getValue());

            this.chartSettings.putShowMarker(this.chMarkers.getValue()=='checked');

            value = (type == Asc.c_oAscChartTypeSettings.lineNormal || type == Asc.c_oAscChartTypeSettings.lineStacked ||
                      type == Asc.c_oAscChartTypeSettings.lineStackedPer || type == Asc.c_oAscChartTypeSettings.scatter);
            if (value) {
                value = this.cmbLines.getValue();
                this.chartSettings.putLine(value!==0);
                if (value>0)
                    this.chartSettings.putSmooth(value==2);
            }

            this.chartSettings.putVertAxisProps(this.vertAxisProps);
            this.chartSettings.putHorAxisProps(this.horAxisProps);

            return { chartSettings: this.chartSettings };
        },

        isRangeValid: function() {
            var isvalid;
            if (!_.isEmpty(this.txtDataRange.getValue())) {
                isvalid = this.api.asc_checkDataRange(Asc.c_oAscSelectionDialogType.Chart, this.txtDataRange.getValue(), true, this.cmbDataDirect.getValue()==0, this.mnuChartTypePicker.getSelectedRec()[0].get('type'));
                if (isvalid == Asc.c_oAscError.ID.No)
                    return true;
            } else
                this.txtDataRange.showError([this.txtEmpty]);

            this.setActiveCategory(0);
            if (isvalid == Asc.c_oAscError.ID.StockChartError) {
                Common.UI.warning({msg: this.errorStockChart});
            } else if (isvalid == Asc.c_oAscError.ID.MaxDataSeriesError) {
                Common.UI.warning({msg: this.errorMaxRows});
            } else
                this.txtDataRange.cmpEl.find('input').focus();
            return false;
        },

        onSelectData: function() {
            var me = this;
            if (me.api) {
                var handlerDlg = function(dlg, result) {
                    if (result == 'ok') {
                        me.dataRangeValid = dlg.getSettings();
                        me.txtDataRange.setValue(me.dataRangeValid);
                        me.txtDataRange.checkValidate();
                    }
                };

                var win = new SSE.Views.CellRangeDialog({
                    handler: handlerDlg
                }).on('close', function() {
                    me.show();
                });

                var xy = me.$window.offset();
                me.hide();
                win.show(xy.left + 160, xy.top + 125);
                win.setSettings({
                    api     : me.api,
                    isRows  : (me.cmbDataDirect.getValue()==0),
                    range   : (!_.isEmpty(me.txtDataRange.getValue()) && (me.txtDataRange.checkValidate()==true)) ? me.txtDataRange.getValue() : me.dataRangeValid
                });
            }
        },

        onSelectDataLabels: function(obj, rec, e) {
            var disable = rec.value == Asc.c_oAscChartDataLabelsPos.none;
            this.chSeriesName.setDisabled(disable);
            this.chCategoryName.setDisabled(disable);
            this.chValue.setDisabled(disable);
            this.txtSeparator.setDisabled(disable);
            if (!disable && this.chSeriesName.getValue()!=='checked' && this.chCategoryName.getValue()!=='checked'
                         && this.chValue.getValue()!=='checked') {
                this.chValue.setValue('checked', true);
            }
        },

         show: function() {
            Common.Views.AdvancedSettingsWindow.prototype.show.apply(this, arguments);

            var me = this;
            _.delay(function(){
                me.txtDataRange.cmpEl.find('input').focus();
            },50);
        },

        close: function () {
            this.api.asc_onCloseChartFrame();
            Common.Views.AdvancedSettingsWindow.prototype.close.apply(this, arguments);
        },

        textTitle:          'Chart - Advanced Settings',
        textShowValues:     'Display chart values',
        textShowBorders:    'Display chart borders',
        textLine:           'Line',
        textColumn:         'Column',
        textBar:            'Bar',
        textArea:           'Area',
        textPie:            'Pie',
        textPoint:          'Point',
        textStock:          'Stock',
        textDataRows:       'in rows',
        textDataColumns:    'in columns',
        textDisplayLegend:  'Display Legend',
        textLegendBottom:   'Bottom',
        textLegendTop:      'Top',
        textLegendRight:    'Right',
        textLegendLeft:     'Left',
        textShowAxis:       'Display Axis',
        textShowGrid:       'Grid Lines',
        textDataRange:      'Data Range',
        textChartTitle:     'Chart Title',
        textXAxisTitle:     'X Axis Title',
        textYAxisTitle:     'Y Axis Title',
        txtEmpty:           'This field is required',
        textInvalidRange:   'ERROR! Invalid cells range',
        cancelButtonText:   'Cancel',
        textTypeStyle: 'Chart Type, Style &<br/>Data Range',
        textChartElementsLegend: 'Chart Elements &<br/>Chart Legend',
        textLayout: 'Layout',
        textLegendPos: 'Legend',
        textHorTitle: 'Horizontal Axis Title',
        textVertTitle: 'Vertical Axis Title',
        textDataLabels: 'Data Labels',
        textSeparator: 'Data Labels Separator',
        textSeriesName: 'Series Name',
        textCategoryName: 'Category Name',
        textValue: 'Value',
        textAxisOptions: 'Axis Options',
        textMinValue: 'Minimum Value',
        textMaxValue: 'Maximum Value',
        textAxisCrosses: 'Axis Crosses',
        textUnits: 'Display Units',
        textTickOptions: 'Tick Options',
        textMajorType: 'Major Type',
        textMinorType: 'Minor Type',
        textLabelOptions: 'Label Options',
        textLabelPos: 'Label Position',
        textReverse: 'Values in reverse order',
        textVertAxis: 'Vertical Axis',
        textHorAxis: 'Horizontal Axis',
        textMarksInterval: 'Interval between Marks',
        textLabelDist: 'Axis Label Distance',
        textLabelInterval: 'Interval between Labels',
        textAxisPos: 'Axis Position',
        textLeftOverlay: 'Left Overlay',
        textRightOverlay: 'Right Overlay',
        textOverlay: 'Overlay',
        textNoOverlay: 'No Overlay',
        textRotated: 'Rotated',
        textHorizontal: 'Horizontal',
        textInnerBottom: 'Inner Bottom',
        textInnerTop: 'Inner Top',
        textOuterTop: 'Outer Top',
        textNone: 'None',
        textCenter: 'Center',
        textFixed: 'Fixed',
        textAuto: 'Auto',
        textCross: 'Cross',
        textIn: 'In',
        textOut: 'Out',
        textLow: 'Low',
        textHigh: 'High',
        textNextToAxis: 'Next to axis',
        textHundreds: 'Hundreds',
        textThousands: 'Thousands',
        textTenThousands: '10 000',
        textHundredThousands: '100 000',
        textMillions: 'Millions',
        textTenMillions: '10 000 000',
        textHundredMil: '100 000 000',
        textBillions: 'Billions',
        textTrillions: 'Trillions',
        textCustom: 'Custom',
        textManual: 'Manual',
        textBetweenTickMarks: 'Between Tick Marks',
        textOnTickMarks: 'On Tick Marks',
        textHorGrid: 'Horizontal Gridlines',
        textVertGrid: 'Vertical Gridlines',
        textLines: 'Lines',
        textMarkers: 'Markers',
        textMajor: 'Major',
        textMinor: 'Minor',
        textMajorMinor: 'Major and Minor',
        textStraight: 'Straight',
        textSmooth: 'Smooth',
        textType: 'Type',
        textTypeData: 'Type & Data',
        textStyle: 'Style',
        textSelectData: 'Select Data',
        textDataSeries: 'Data series',
        errorMaxRows: 'ERROR! The maximum number of data series per chart is 255.',
        errorStockChart: 'Incorrect row order. To build a stock chart place the data on the sheet in the following order:<br> opening price, max price, min price, closing price.',
        textAxisSettings: 'Axis Settings',
        textGridLines: 'Gridlines',
        textShow: 'Show',
        textHide: 'Hide'
}, SSE.Views.ChartSettingsDlg || {}));
});
