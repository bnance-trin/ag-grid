var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp(target, key, result);
  return result;
};

// enterprise-modules/column-tool-panel/src/main.ts
var main_exports = {};
__export(main_exports, {
  ColumnsToolPanelModule: () => ColumnsToolPanelModule,
  PrimaryColsPanel: () => PrimaryColsPanel
});
module.exports = __toCommonJS(main_exports);

// enterprise-modules/column-tool-panel/src/columnsToolPanelModule.ts
var import_core12 = require("@ag-grid-community/core");
var import_core13 = require("@ag-grid-enterprise/core");

// enterprise-modules/column-tool-panel/src/columnToolPanel/primaryColsHeaderPanel.ts
var import_core = require("@ag-grid-community/core");
var _PrimaryColsHeaderPanel = class _PrimaryColsHeaderPanel extends import_core.Component {
  constructor() {
    super(_PrimaryColsHeaderPanel.TEMPLATE);
  }
  postConstruct() {
    this.createExpandIcons();
    this.addManagedListener(this.eExpand, "click", this.onExpandClicked.bind(this));
    this.addManagedListener(this.eExpand, "keydown", (e) => {
      if (e.key === import_core.KeyCode.SPACE) {
        e.preventDefault();
        this.onExpandClicked();
      }
    });
    this.addManagedListener(this.eSelect.getInputElement(), "click", this.onSelectClicked.bind(this));
    this.addManagedPropertyListener("functionsReadOnly", () => this.onFunctionsReadOnlyPropChanged());
    this.eFilterTextField.setAutoComplete(false).onValueChange(() => this.onFilterTextChanged());
    this.addManagedListener(
      this.eFilterTextField.getInputElement(),
      "keydown",
      this.onMiniFilterKeyDown.bind(this)
    );
    this.addManagedListener(this.eventService, import_core.Events.EVENT_NEW_COLUMNS_LOADED, this.showOrHideOptions.bind(this));
    const translate = this.localeService.getLocaleTextFunc();
    this.eSelect.setInputAriaLabel(translate("ariaColumnSelectAll", "Toggle Select All Columns"));
    this.eFilterTextField.setInputAriaLabel(translate("ariaFilterColumnsInput", "Filter Columns Input"));
    this.activateTabIndex([this.eExpand]);
  }
  onFunctionsReadOnlyPropChanged() {
    const readOnly = this.gridOptionsService.get("functionsReadOnly");
    this.eSelect.setReadOnly(readOnly);
    this.eSelect.addOrRemoveCssClass("ag-column-select-column-readonly", readOnly);
  }
  init(params) {
    this.params = params;
    const readOnly = this.gridOptionsService.get("functionsReadOnly");
    this.eSelect.setReadOnly(readOnly);
    this.eSelect.addOrRemoveCssClass("ag-column-select-column-readonly", readOnly);
    if (this.columnModel.isReady()) {
      this.showOrHideOptions();
    }
  }
  createExpandIcons() {
    this.eExpand.appendChild(this.eExpandChecked = import_core._.createIconNoSpan("columnSelectOpen", this.gridOptionsService));
    this.eExpand.appendChild(this.eExpandUnchecked = import_core._.createIconNoSpan("columnSelectClosed", this.gridOptionsService));
    this.eExpand.appendChild(this.eExpandIndeterminate = import_core._.createIconNoSpan("columnSelectIndeterminate", this.gridOptionsService));
    this.setExpandState(0 /* EXPANDED */);
  }
  // we only show expand / collapse if we are showing columns
  showOrHideOptions() {
    const showFilter = !this.params.suppressColumnFilter;
    const showSelect = !this.params.suppressColumnSelectAll;
    const showExpand = !this.params.suppressColumnExpandAll;
    const groupsPresent = this.columnModel.isPrimaryColumnGroupsPresent();
    const translate = this.localeService.getLocaleTextFunc();
    this.eFilterTextField.setInputPlaceholder(translate("searchOoo", "Search..."));
    import_core._.setDisplayed(this.eFilterTextField.getGui(), showFilter);
    import_core._.setDisplayed(this.eSelect.getGui(), showSelect);
    import_core._.setDisplayed(this.eExpand, showExpand && groupsPresent);
  }
  onFilterTextChanged() {
    if (!this.onFilterTextChangedDebounced) {
      this.onFilterTextChangedDebounced = import_core._.debounce(() => {
        const filterText = this.eFilterTextField.getValue();
        this.dispatchEvent({ type: "filterChanged", filterText });
      }, _PrimaryColsHeaderPanel.DEBOUNCE_DELAY);
    }
    this.onFilterTextChangedDebounced();
  }
  onMiniFilterKeyDown(e) {
    if (e.key === import_core.KeyCode.ENTER) {
      setTimeout(() => this.onSelectClicked(), _PrimaryColsHeaderPanel.DEBOUNCE_DELAY);
    }
  }
  onSelectClicked() {
    this.dispatchEvent({ type: this.selectState ? "unselectAll" : "selectAll" });
  }
  onExpandClicked() {
    this.dispatchEvent({ type: this.expandState === 0 /* EXPANDED */ ? "collapseAll" : "expandAll" });
  }
  setExpandState(state) {
    this.expandState = state;
    import_core._.setDisplayed(this.eExpandChecked, this.expandState === 0 /* EXPANDED */);
    import_core._.setDisplayed(this.eExpandUnchecked, this.expandState === 1 /* COLLAPSED */);
    import_core._.setDisplayed(this.eExpandIndeterminate, this.expandState === 2 /* INDETERMINATE */);
  }
  setSelectionState(state) {
    this.selectState = state;
    this.eSelect.setValue(this.selectState);
  }
};
_PrimaryColsHeaderPanel.DEBOUNCE_DELAY = 300;
_PrimaryColsHeaderPanel.TEMPLATE = /* html */
`<div class="ag-column-select-header" role="presentation">
            <div ref="eExpand" class="ag-column-select-header-icon"></div>
            <ag-checkbox ref="eSelect" class="ag-column-select-header-checkbox"></ag-checkbox>
            <ag-input-text-field class="ag-column-select-header-filter-wrapper" ref="eFilterTextField"></ag-input-text-field>
        </div>`;
__decorateClass([
  (0, import_core.Autowired)("columnModel")
], _PrimaryColsHeaderPanel.prototype, "columnModel", 2);
__decorateClass([
  (0, import_core.RefSelector)("eExpand")
], _PrimaryColsHeaderPanel.prototype, "eExpand", 2);
__decorateClass([
  (0, import_core.RefSelector)("eSelect")
], _PrimaryColsHeaderPanel.prototype, "eSelect", 2);
__decorateClass([
  (0, import_core.RefSelector)("eFilterTextField")
], _PrimaryColsHeaderPanel.prototype, "eFilterTextField", 2);
__decorateClass([
  import_core.PostConstruct
], _PrimaryColsHeaderPanel.prototype, "postConstruct", 1);
var PrimaryColsHeaderPanel = _PrimaryColsHeaderPanel;

// enterprise-modules/column-tool-panel/src/columnToolPanel/primaryColsListPanel.ts
var import_core7 = require("@ag-grid-community/core");

// enterprise-modules/column-tool-panel/src/columnToolPanel/primaryColsListPanelItemDragFeature.ts
var import_core5 = require("@ag-grid-community/core");

// enterprise-modules/column-tool-panel/src/columnToolPanel/toolPanelColumnGroupComp.ts
var import_core4 = require("@ag-grid-community/core");

// enterprise-modules/column-tool-panel/src/columnToolPanel/columnModelItem.ts
var import_core2 = require("@ag-grid-community/core");
var _ColumnModelItem = class _ColumnModelItem {
  constructor(displayName, columnOrGroup, dept, group = false, expanded) {
    this.eventService = new import_core2.EventService();
    this.displayName = displayName;
    this.dept = dept;
    this.group = group;
    if (group) {
      this.columnGroup = columnOrGroup;
      this.expanded = expanded;
      this.children = [];
    } else {
      this.column = columnOrGroup;
    }
  }
  isGroup() {
    return this.group;
  }
  getDisplayName() {
    return this.displayName;
  }
  getColumnGroup() {
    return this.columnGroup;
  }
  getColumn() {
    return this.column;
  }
  getDept() {
    return this.dept;
  }
  isExpanded() {
    return !!this.expanded;
  }
  getChildren() {
    return this.children;
  }
  isPassesFilter() {
    return this.passesFilter;
  }
  setExpanded(expanded) {
    if (expanded === this.expanded) {
      return;
    }
    this.expanded = expanded;
    this.eventService.dispatchEvent({ type: _ColumnModelItem.EVENT_EXPANDED_CHANGED });
  }
  setPassesFilter(passesFilter) {
    this.passesFilter = passesFilter;
  }
  addEventListener(eventType, listener) {
    this.eventService.addEventListener(eventType, listener);
  }
  removeEventListener(eventType, listener) {
    this.eventService.removeEventListener(eventType, listener);
  }
};
_ColumnModelItem.EVENT_EXPANDED_CHANGED = "expandedChanged";
var ColumnModelItem = _ColumnModelItem;

// enterprise-modules/column-tool-panel/src/columnToolPanel/toolPanelContextMenu.ts
var import_core3 = require("@ag-grid-community/core");
var ToolPanelContextMenu = class extends import_core3.Component {
  constructor(column, mouseEvent, parentEl) {
    super(
      /* html */
      `<div class="ag-menu"></div>`
    );
    this.column = column;
    this.mouseEvent = mouseEvent;
    this.parentEl = parentEl;
    this.displayName = null;
  }
  postConstruct() {
    this.initializeProperties(this.column);
    this.buildMenuItemMap();
    if (this.column instanceof import_core3.Column) {
      this.displayName = this.columnModel.getDisplayNameForColumn(this.column, "columnToolPanel");
    } else {
      this.displayName = this.columnModel.getDisplayNameForProvidedColumnGroup(null, this.column, "columnToolPanel");
    }
    if (this.isActive()) {
      this.mouseEvent.preventDefault();
      const menuItemsMapped = this.getMappedMenuItems();
      if (menuItemsMapped.length === 0) {
        return;
      }
      this.displayContextMenu(menuItemsMapped);
    }
  }
  initializeProperties(column) {
    if (column instanceof import_core3.ProvidedColumnGroup) {
      this.columns = column.getLeafColumns();
    } else {
      this.columns = [column];
    }
    this.allowGrouping = this.columns.some((col) => col.isPrimary() && col.isAllowRowGroup());
    this.allowValues = this.columns.some((col) => col.isPrimary() && col.isAllowValue());
    this.allowPivoting = this.columnModel.isPivotMode() && this.columns.some((col) => col.isPrimary() && col.isAllowPivot());
  }
  buildMenuItemMap() {
    const localeTextFunc = this.localeService.getLocaleTextFunc();
    this.menuItemMap = /* @__PURE__ */ new Map();
    this.menuItemMap.set("rowGroup", {
      allowedFunction: (col) => col.isPrimary() && col.isAllowRowGroup() && !this.columnModel.isColumnGroupingLocked(col),
      activeFunction: (col) => col.isRowGroupActive(),
      activateLabel: () => `${localeTextFunc("groupBy", "Group by")} ${this.displayName}`,
      deactivateLabel: () => `${localeTextFunc("ungroupBy", "Un-Group by")} ${this.displayName}`,
      activateFunction: () => {
        const groupedColumns = this.columnModel.getRowGroupColumns();
        this.columnModel.setRowGroupColumns(this.addColumnsToList(groupedColumns), "toolPanelUi");
      },
      deActivateFunction: () => {
        const groupedColumns = this.columnModel.getRowGroupColumns();
        this.columnModel.setRowGroupColumns(this.removeColumnsFromList(groupedColumns), "toolPanelUi");
      },
      addIcon: "menuAddRowGroup",
      removeIcon: "menuRemoveRowGroup"
    });
    this.menuItemMap.set("value", {
      allowedFunction: (col) => col.isPrimary() && col.isAllowValue(),
      activeFunction: (col) => col.isValueActive(),
      activateLabel: () => localeTextFunc("addToValues", `Add ${this.displayName} to values`, [this.displayName]),
      deactivateLabel: () => localeTextFunc("removeFromValues", `Remove ${this.displayName} from values`, [this.displayName]),
      activateFunction: () => {
        const valueColumns = this.columnModel.getValueColumns();
        this.columnModel.setValueColumns(this.addColumnsToList(valueColumns), "toolPanelUi");
      },
      deActivateFunction: () => {
        const valueColumns = this.columnModel.getValueColumns();
        this.columnModel.setValueColumns(this.removeColumnsFromList(valueColumns), "toolPanelUi");
      },
      addIcon: "valuePanel",
      removeIcon: "valuePanel"
    });
    this.menuItemMap.set("pivot", {
      allowedFunction: (col) => this.columnModel.isPivotMode() && col.isPrimary() && col.isAllowPivot(),
      activeFunction: (col) => col.isPivotActive(),
      activateLabel: () => localeTextFunc("addToLabels", `Add ${this.displayName} to labels`, [this.displayName]),
      deactivateLabel: () => localeTextFunc("removeFromLabels", `Remove ${this.displayName} from labels`, [this.displayName]),
      activateFunction: () => {
        const pivotColumns = this.columnModel.getPivotColumns();
        this.columnModel.setPivotColumns(this.addColumnsToList(pivotColumns), "toolPanelUi");
      },
      deActivateFunction: () => {
        const pivotColumns = this.columnModel.getPivotColumns();
        this.columnModel.setPivotColumns(this.removeColumnsFromList(pivotColumns), "toolPanelUi");
      },
      addIcon: "pivotPanel",
      removeIcon: "pivotPanel"
    });
  }
  addColumnsToList(columnList) {
    return [...columnList].concat(this.columns.filter((col) => columnList.indexOf(col) === -1));
  }
  removeColumnsFromList(columnList) {
    return columnList.filter((col) => this.columns.indexOf(col) === -1);
  }
  displayContextMenu(menuItemsMapped) {
    const eGui = this.getGui();
    const menuList = this.createBean(new import_core3.AgMenuList());
    const localeTextFunc = this.localeService.getLocaleTextFunc();
    let hideFunc = () => {
    };
    eGui.appendChild(menuList.getGui());
    menuList.addMenuItems(menuItemsMapped);
    menuList.addManagedListener(menuList, import_core3.AgMenuItemComponent.EVENT_CLOSE_MENU, () => {
      this.parentEl.focus();
      hideFunc();
    });
    const addPopupRes = this.popupService.addPopup({
      modal: true,
      eChild: eGui,
      closeOnEsc: true,
      afterGuiAttached: () => this.focusService.focusInto(menuList.getGui()),
      ariaLabel: localeTextFunc("ariaLabelContextMenu", "Context Menu"),
      closedCallback: (e) => {
        if (e instanceof KeyboardEvent) {
          this.parentEl.focus();
        }
        this.destroyBean(menuList);
      }
    });
    if (addPopupRes) {
      hideFunc = addPopupRes.hideFunc;
    }
    this.popupService.positionPopupUnderMouseEvent({
      type: "columnContextMenu",
      mouseEvent: this.mouseEvent,
      ePopup: eGui
    });
  }
  isActive() {
    return this.allowGrouping || this.allowValues || this.allowPivoting;
  }
  getMappedMenuItems() {
    const ret = [];
    for (const val of this.menuItemMap.values()) {
      const isInactive = this.columns.some((col) => val.allowedFunction(col) && !val.activeFunction(col));
      const isActive = this.columns.some((col) => val.allowedFunction(col) && val.activeFunction(col));
      if (isInactive) {
        ret.push({
          name: val.activateLabel(this.displayName),
          icon: import_core3._.createIconNoSpan(val.addIcon, this.gridOptionsService, null),
          action: () => val.activateFunction()
        });
      }
      if (isActive) {
        ret.push({
          name: val.deactivateLabel(this.displayName),
          icon: import_core3._.createIconNoSpan(val.removeIcon, this.gridOptionsService, null),
          action: () => val.deActivateFunction()
        });
      }
    }
    return ret;
  }
};
__decorateClass([
  (0, import_core3.Autowired)("columnModel")
], ToolPanelContextMenu.prototype, "columnModel", 2);
__decorateClass([
  (0, import_core3.Autowired)("popupService")
], ToolPanelContextMenu.prototype, "popupService", 2);
__decorateClass([
  (0, import_core3.Autowired)("focusService")
], ToolPanelContextMenu.prototype, "focusService", 2);
__decorateClass([
  import_core3.PostConstruct
], ToolPanelContextMenu.prototype, "postConstruct", 1);

// enterprise-modules/column-tool-panel/src/columnToolPanel/toolPanelColumnGroupComp.ts
var _ToolPanelColumnGroupComp = class _ToolPanelColumnGroupComp extends import_core4.Component {
  constructor(modelItem, allowDragging, eventType, focusWrapper) {
    super();
    this.modelItem = modelItem;
    this.allowDragging = allowDragging;
    this.eventType = eventType;
    this.focusWrapper = focusWrapper;
    this.processingColumnStateChange = false;
    this.modelItem = modelItem;
    this.columnGroup = modelItem.getColumnGroup();
    this.columnDept = modelItem.getDept();
    this.displayName = modelItem.getDisplayName();
    this.allowDragging = allowDragging;
  }
  init() {
    this.setTemplate(_ToolPanelColumnGroupComp.TEMPLATE);
    this.eDragHandle = import_core4._.createIconNoSpan("columnDrag", this.gridOptionsService);
    this.eDragHandle.classList.add("ag-drag-handle", "ag-column-select-column-group-drag-handle");
    const checkboxGui = this.cbSelect.getGui();
    const checkboxInput = this.cbSelect.getInputElement();
    checkboxGui.insertAdjacentElement("afterend", this.eDragHandle);
    checkboxInput.setAttribute("tabindex", "-1");
    this.eLabel.innerHTML = this.displayName ? this.displayName : "";
    this.setupExpandContract();
    this.addCssClass("ag-column-select-indent-" + this.columnDept);
    this.addManagedListener(this.eventService, import_core4.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.onColumnStateChanged.bind(this));
    this.addManagedListener(this.eLabel, "click", this.onLabelClicked.bind(this));
    this.addManagedListener(this.cbSelect, import_core4.Events.EVENT_FIELD_VALUE_CHANGED, this.onCheckboxChanged.bind(this));
    this.addManagedListener(this.modelItem, ColumnModelItem.EVENT_EXPANDED_CHANGED, this.onExpandChanged.bind(this));
    this.addManagedListener(this.focusWrapper, "keydown", this.handleKeyDown.bind(this));
    this.addManagedListener(this.focusWrapper, "contextmenu", this.onContextMenu.bind(this));
    this.setOpenClosedIcons();
    this.setupDragging();
    this.onColumnStateChanged();
    this.addVisibilityListenersToAllChildren();
    this.refreshAriaExpanded();
    this.refreshAriaLabel();
    this.setupTooltip();
    const classes = import_core4.CssClassApplier.getToolPanelClassesFromColDef(this.columnGroup.getColGroupDef(), this.gridOptionsService, null, this.columnGroup);
    classes.forEach((c) => this.addOrRemoveCssClass(c, true));
  }
  getColumns() {
    return this.columnGroup.getLeafColumns();
  }
  setupTooltip() {
    const colGroupDef = this.columnGroup.getColGroupDef();
    if (!colGroupDef) {
      return;
    }
    const isTooltipWhenTruncated = this.gridOptionsService.get("tooltipShowMode") === "whenTruncated";
    let shouldDisplayTooltip;
    if (isTooltipWhenTruncated) {
      shouldDisplayTooltip = () => this.eLabel.scrollWidth > this.eLabel.clientWidth;
    }
    const refresh = () => {
      const newTooltipText = colGroupDef.headerTooltip;
      this.setTooltip({ newTooltipText, location: "columnToolPanelColumnGroup", shouldDisplayTooltip });
    };
    refresh();
    this.addManagedListener(this.eventService, import_core4.Events.EVENT_NEW_COLUMNS_LOADED, refresh);
  }
  getTooltipParams() {
    const res = super.getTooltipParams();
    res.location = "columnToolPanelColumnGroup";
    return res;
  }
  handleKeyDown(e) {
    switch (e.key) {
      case import_core4.KeyCode.LEFT:
        e.preventDefault();
        this.modelItem.setExpanded(false);
        break;
      case import_core4.KeyCode.RIGHT:
        e.preventDefault();
        this.modelItem.setExpanded(true);
        break;
      case import_core4.KeyCode.SPACE:
        e.preventDefault();
        if (this.isSelectable()) {
          this.onSelectAllChanged(!this.isSelected());
        }
        break;
    }
  }
  onContextMenu(e) {
    const { columnGroup, gridOptionsService } = this;
    if (gridOptionsService.get("functionsReadOnly")) {
      return;
    }
    const contextMenu = this.createBean(new ToolPanelContextMenu(columnGroup, e, this.focusWrapper));
    this.addDestroyFunc(() => {
      if (contextMenu.isAlive()) {
        this.destroyBean(contextMenu);
      }
    });
  }
  addVisibilityListenersToAllChildren() {
    this.columnGroup.getLeafColumns().forEach((column) => {
      this.addManagedListener(column, import_core4.Column.EVENT_VISIBLE_CHANGED, this.onColumnStateChanged.bind(this));
      this.addManagedListener(column, import_core4.Column.EVENT_VALUE_CHANGED, this.onColumnStateChanged.bind(this));
      this.addManagedListener(column, import_core4.Column.EVENT_PIVOT_CHANGED, this.onColumnStateChanged.bind(this));
      this.addManagedListener(column, import_core4.Column.EVENT_ROW_GROUP_CHANGED, this.onColumnStateChanged.bind(this));
    });
  }
  setupDragging() {
    if (!this.allowDragging) {
      import_core4._.setDisplayed(this.eDragHandle, false);
      return;
    }
    let hideColumnOnExit = !this.gridOptionsService.get("suppressDragLeaveHidesColumns");
    const dragSource = {
      type: import_core4.DragSourceType.ToolPanel,
      eElement: this.eDragHandle,
      dragItemName: this.displayName,
      getDefaultIconName: () => hideColumnOnExit ? import_core4.DragAndDropService.ICON_HIDE : import_core4.DragAndDropService.ICON_NOT_ALLOWED,
      getDragItem: () => this.createDragItem(),
      onDragStarted: () => {
        hideColumnOnExit = !this.gridOptionsService.get("suppressDragLeaveHidesColumns");
        const event = {
          type: import_core4.Events.EVENT_COLUMN_PANEL_ITEM_DRAG_START,
          column: this.columnGroup
        };
        this.eventService.dispatchEvent(event);
      },
      onDragStopped: () => {
        const event = {
          type: import_core4.Events.EVENT_COLUMN_PANEL_ITEM_DRAG_END
        };
        this.eventService.dispatchEvent(event);
      },
      onGridEnter: (dragItem) => {
        if (hideColumnOnExit) {
          this.modelItemUtils.updateColumns({
            columns: this.columnGroup.getLeafColumns(),
            visibleState: dragItem == null ? void 0 : dragItem.visibleState,
            pivotState: dragItem == null ? void 0 : dragItem.pivotState,
            eventType: this.eventType
          });
        }
      },
      onGridExit: () => {
        if (hideColumnOnExit) {
          this.onChangeCommon(false);
        }
      }
    };
    this.dragAndDropService.addDragSource(dragSource, true);
    this.addDestroyFunc(() => this.dragAndDropService.removeDragSource(dragSource));
  }
  createDragItem() {
    const columns = this.columnGroup.getLeafColumns();
    const visibleState = {};
    const pivotState = {};
    columns.forEach((col) => {
      const colId = col.getId();
      visibleState[colId] = col.isVisible();
      pivotState[colId] = this.modelItemUtils.createPivotState(col);
    });
    return {
      columns,
      visibleState,
      pivotState
    };
  }
  setupExpandContract() {
    this.eGroupClosedIcon.appendChild(import_core4._.createIcon("columnSelectClosed", this.gridOptionsService, null));
    this.eGroupOpenedIcon.appendChild(import_core4._.createIcon("columnSelectOpen", this.gridOptionsService, null));
    this.addManagedListener(this.eGroupClosedIcon, "click", this.onExpandOrContractClicked.bind(this));
    this.addManagedListener(this.eGroupOpenedIcon, "click", this.onExpandOrContractClicked.bind(this));
    const touchListener = new import_core4.TouchListener(this.eColumnGroupIcons, true);
    this.addManagedListener(touchListener, import_core4.TouchListener.EVENT_TAP, this.onExpandOrContractClicked.bind(this));
    this.addDestroyFunc(touchListener.destroy.bind(touchListener));
  }
  onLabelClicked() {
    const nextState = !this.cbSelect.getValue();
    this.onChangeCommon(nextState);
  }
  onCheckboxChanged(event) {
    this.onChangeCommon(event.selected);
  }
  getVisibleLeafColumns() {
    const childColumns = [];
    const extractCols = (children) => {
      children.forEach((child) => {
        if (!child.isPassesFilter()) {
          return;
        }
        if (child.isGroup()) {
          extractCols(child.getChildren());
        } else {
          childColumns.push(child.getColumn());
        }
      });
    };
    extractCols(this.modelItem.getChildren());
    return childColumns;
  }
  onChangeCommon(nextState) {
    this.refreshAriaLabel();
    if (this.processingColumnStateChange) {
      return;
    }
    this.modelItemUtils.selectAllChildren(this.modelItem.getChildren(), nextState, this.eventType);
  }
  refreshAriaLabel() {
    const translate = this.localeService.getLocaleTextFunc();
    const columnLabel = translate("ariaColumnGroup", "Column Group");
    const checkboxValue = this.cbSelect.getValue();
    const state = checkboxValue === void 0 ? translate("ariaIndeterminate", "indeterminate") : checkboxValue ? translate("ariaVisible", "visible") : translate("ariaHidden", "hidden");
    const visibilityLabel = translate("ariaToggleVisibility", "Press SPACE to toggle visibility");
    import_core4._.setAriaLabel(this.focusWrapper, `${this.displayName} ${columnLabel}`);
    this.cbSelect.setInputAriaLabel(`${visibilityLabel} (${state})`);
    import_core4._.setAriaDescribedBy(this.focusWrapper, this.cbSelect.getInputElement().id);
  }
  onColumnStateChanged() {
    const selectedValue = this.workOutSelectedValue();
    const readOnlyValue = this.workOutReadOnlyValue();
    this.processingColumnStateChange = true;
    this.cbSelect.setValue(selectedValue);
    this.cbSelect.setReadOnly(readOnlyValue);
    this.addOrRemoveCssClass("ag-column-select-column-group-readonly", readOnlyValue);
    this.processingColumnStateChange = false;
  }
  workOutSelectedValue() {
    const pivotMode = this.columnModel.isPivotMode();
    const visibleLeafColumns = this.getVisibleLeafColumns();
    let checkedCount = 0;
    let uncheckedCount = 0;
    visibleLeafColumns.forEach((column) => {
      if (!pivotMode && column.getColDef().lockVisible) {
        return;
      }
      if (this.isColumnChecked(column, pivotMode)) {
        checkedCount++;
      } else {
        uncheckedCount++;
      }
    });
    if (checkedCount > 0 && uncheckedCount > 0) {
      return void 0;
    }
    return checkedCount > 0;
  }
  workOutReadOnlyValue() {
    const pivotMode = this.columnModel.isPivotMode();
    let colsThatCanAction = 0;
    this.columnGroup.getLeafColumns().forEach((col) => {
      if (pivotMode) {
        if (col.isAnyFunctionAllowed()) {
          colsThatCanAction++;
        }
      } else {
        if (!col.getColDef().lockVisible) {
          colsThatCanAction++;
        }
      }
    });
    return colsThatCanAction === 0;
  }
  isColumnChecked(column, pivotMode) {
    if (pivotMode) {
      const pivoted = column.isPivotActive();
      const grouped = column.isRowGroupActive();
      const aggregated = column.isValueActive();
      return pivoted || grouped || aggregated;
    }
    return column.isVisible();
  }
  onExpandOrContractClicked() {
    const oldState = this.modelItem.isExpanded();
    this.modelItem.setExpanded(!oldState);
  }
  onExpandChanged() {
    this.setOpenClosedIcons();
    this.refreshAriaExpanded();
  }
  setOpenClosedIcons() {
    const folderOpen = this.modelItem.isExpanded();
    import_core4._.setDisplayed(this.eGroupClosedIcon, !folderOpen);
    import_core4._.setDisplayed(this.eGroupOpenedIcon, folderOpen);
  }
  refreshAriaExpanded() {
    import_core4._.setAriaExpanded(this.focusWrapper, this.modelItem.isExpanded());
  }
  getDisplayName() {
    return this.displayName;
  }
  onSelectAllChanged(value) {
    const cbValue = this.cbSelect.getValue();
    const readOnly = this.cbSelect.isReadOnly();
    if (!readOnly && (value && !cbValue || !value && cbValue)) {
      this.cbSelect.toggle();
    }
  }
  isSelected() {
    return this.cbSelect.getValue();
  }
  isSelectable() {
    return !this.cbSelect.isReadOnly();
  }
  setSelected(selected) {
    this.cbSelect.setValue(selected, true);
  }
};
_ToolPanelColumnGroupComp.TEMPLATE = /* html */
`<div class="ag-column-select-column-group" aria-hidden="true">
            <span class="ag-column-group-icons" ref="eColumnGroupIcons" >
                <span class="ag-column-group-closed-icon" ref="eGroupClosedIcon"></span>
                <span class="ag-column-group-opened-icon" ref="eGroupOpenedIcon"></span>
            </span>
            <ag-checkbox ref="cbSelect" class="ag-column-select-checkbox"></ag-checkbox>
            <span class="ag-column-select-column-label" ref="eLabel"></span>
        </div>`;
__decorateClass([
  (0, import_core4.Autowired)("columnModel")
], _ToolPanelColumnGroupComp.prototype, "columnModel", 2);
__decorateClass([
  (0, import_core4.Autowired)("dragAndDropService")
], _ToolPanelColumnGroupComp.prototype, "dragAndDropService", 2);
__decorateClass([
  (0, import_core4.Autowired)("modelItemUtils")
], _ToolPanelColumnGroupComp.prototype, "modelItemUtils", 2);
__decorateClass([
  (0, import_core4.RefSelector)("cbSelect")
], _ToolPanelColumnGroupComp.prototype, "cbSelect", 2);
__decorateClass([
  (0, import_core4.RefSelector)("eLabel")
], _ToolPanelColumnGroupComp.prototype, "eLabel", 2);
__decorateClass([
  (0, import_core4.RefSelector)("eGroupOpenedIcon")
], _ToolPanelColumnGroupComp.prototype, "eGroupOpenedIcon", 2);
__decorateClass([
  (0, import_core4.RefSelector)("eGroupClosedIcon")
], _ToolPanelColumnGroupComp.prototype, "eGroupClosedIcon", 2);
__decorateClass([
  (0, import_core4.RefSelector)("eColumnGroupIcons")
], _ToolPanelColumnGroupComp.prototype, "eColumnGroupIcons", 2);
__decorateClass([
  import_core4.PostConstruct
], _ToolPanelColumnGroupComp.prototype, "init", 1);
var ToolPanelColumnGroupComp = _ToolPanelColumnGroupComp;

// enterprise-modules/column-tool-panel/src/columnToolPanel/primaryColsListPanelItemDragFeature.ts
var PrimaryColsListPanelItemDragFeature = class extends import_core5.BeanStub {
  constructor(comp, virtualList) {
    super();
    this.comp = comp;
    this.virtualList = virtualList;
  }
  postConstruct() {
    this.createManagedBean(new import_core5.VirtualListDragFeature(
      this.comp,
      this.virtualList,
      {
        dragSourceType: import_core5.DragSourceType.ToolPanel,
        listItemDragStartEvent: import_core5.Events.EVENT_COLUMN_PANEL_ITEM_DRAG_START,
        listItemDragEndEvent: import_core5.Events.EVENT_COLUMN_PANEL_ITEM_DRAG_END,
        eventSource: this.eventService,
        getCurrentDragValue: (listItemDragStartEvent) => this.getCurrentDragValue(listItemDragStartEvent),
        isMoveBlocked: (currentDragValue) => this.isMoveBlocked(currentDragValue),
        getNumRows: (comp) => comp.getDisplayedColsList().length,
        moveItem: (currentDragValue, lastHoveredListItem) => this.moveItem(currentDragValue, lastHoveredListItem)
      }
    ));
  }
  getCurrentDragValue(listItemDragStartEvent) {
    return listItemDragStartEvent.column;
  }
  isMoveBlocked(currentDragValue) {
    const preventMoving = this.gridOptionsService.get("suppressMovableColumns");
    if (preventMoving) {
      return true;
    }
    const currentColumns = this.getCurrentColumns(currentDragValue);
    const hasNotMovable = currentColumns.find((col) => {
      const colDef = col.getColDef();
      return !!colDef.suppressMovable || !!colDef.lockPosition;
    });
    return !!hasNotMovable;
  }
  moveItem(currentDragValue, lastHoveredListItem) {
    const targetIndex = this.getTargetIndex(currentDragValue, lastHoveredListItem);
    const columnsToMove = this.getCurrentColumns(currentDragValue);
    if (targetIndex != null) {
      this.columnModel.moveColumns(columnsToMove, targetIndex, "toolPanelUi");
    }
  }
  getMoveDiff(currentDragValue, end) {
    const allColumns = this.columnModel.getAllGridColumns();
    const currentColumns = this.getCurrentColumns(currentDragValue);
    const currentColumn = currentColumns[0];
    const span = currentColumns.length;
    const currentIndex = allColumns.indexOf(currentColumn);
    if (currentIndex < end) {
      return span;
    }
    return 0;
  }
  getCurrentColumns(currentDragValue) {
    if (currentDragValue instanceof import_core5.ProvidedColumnGroup) {
      return currentDragValue.getLeafColumns();
    }
    return [currentDragValue];
  }
  getTargetIndex(currentDragValue, lastHoveredListItem) {
    if (!lastHoveredListItem) {
      return null;
    }
    const columnItemComponent = lastHoveredListItem.component;
    let isBefore = lastHoveredListItem.position === "top";
    let targetColumn;
    if (columnItemComponent instanceof ToolPanelColumnGroupComp) {
      const columns = columnItemComponent.getColumns();
      targetColumn = columns[0];
      isBefore = true;
    } else {
      targetColumn = columnItemComponent.getColumn();
    }
    const movingCols = this.getCurrentColumns(currentDragValue);
    if (movingCols.indexOf(targetColumn) !== -1) {
      return null;
    }
    const targetColumnIndex = this.columnModel.getAllGridColumns().indexOf(targetColumn);
    const adjustedTarget = isBefore ? targetColumnIndex : targetColumnIndex + 1;
    const diff = this.getMoveDiff(currentDragValue, adjustedTarget);
    return adjustedTarget - diff;
  }
};
__decorateClass([
  (0, import_core5.Autowired)("columnModel")
], PrimaryColsListPanelItemDragFeature.prototype, "columnModel", 2);
__decorateClass([
  (0, import_core5.Autowired)("gridOptionsService")
], PrimaryColsListPanelItemDragFeature.prototype, "gridOptionsService", 2);
__decorateClass([
  import_core5.PostConstruct
], PrimaryColsListPanelItemDragFeature.prototype, "postConstruct", 1);

// enterprise-modules/column-tool-panel/src/columnToolPanel/toolPanelColumnComp.ts
var import_core6 = require("@ag-grid-community/core");
var _ToolPanelColumnComp = class _ToolPanelColumnComp extends import_core6.Component {
  constructor(modelItem, allowDragging, groupsExist, focusWrapper) {
    super();
    this.allowDragging = allowDragging;
    this.groupsExist = groupsExist;
    this.focusWrapper = focusWrapper;
    this.processingColumnStateChange = false;
    this.column = modelItem.getColumn();
    this.columnDept = modelItem.getDept();
    this.displayName = modelItem.getDisplayName();
  }
  init() {
    this.setTemplate(_ToolPanelColumnComp.TEMPLATE);
    this.eDragHandle = import_core6._.createIconNoSpan("columnDrag", this.gridOptionsService);
    this.eDragHandle.classList.add("ag-drag-handle", "ag-column-select-column-drag-handle");
    const checkboxGui = this.cbSelect.getGui();
    const checkboxInput = this.cbSelect.getInputElement();
    checkboxGui.insertAdjacentElement("afterend", this.eDragHandle);
    checkboxInput.setAttribute("tabindex", "-1");
    const displayNameSanitised = import_core6._.escapeString(this.displayName);
    this.eLabel.innerHTML = displayNameSanitised;
    const indent = this.columnDept;
    if (this.groupsExist) {
      this.addCssClass("ag-column-select-add-group-indent");
    }
    this.addCssClass(`ag-column-select-indent-${indent}`);
    this.setupDragging();
    this.addManagedListener(this.eventService, import_core6.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.onColumnStateChanged.bind(this));
    this.addManagedListener(this.column, import_core6.Column.EVENT_VALUE_CHANGED, this.onColumnStateChanged.bind(this));
    this.addManagedListener(this.column, import_core6.Column.EVENT_PIVOT_CHANGED, this.onColumnStateChanged.bind(this));
    this.addManagedListener(this.column, import_core6.Column.EVENT_ROW_GROUP_CHANGED, this.onColumnStateChanged.bind(this));
    this.addManagedListener(this.column, import_core6.Column.EVENT_VISIBLE_CHANGED, this.onColumnStateChanged.bind(this));
    this.addManagedListener(this.focusWrapper, "keydown", this.handleKeyDown.bind(this));
    this.addManagedListener(this.focusWrapper, "contextmenu", this.onContextMenu.bind(this));
    this.addManagedPropertyListener("functionsReadOnly", this.onColumnStateChanged.bind(this));
    this.addManagedListener(this.cbSelect, import_core6.Events.EVENT_FIELD_VALUE_CHANGED, this.onCheckboxChanged.bind(this));
    this.addManagedListener(this.eLabel, "click", this.onLabelClicked.bind(this));
    this.onColumnStateChanged();
    this.refreshAriaLabel();
    this.setupTooltip();
    const classes = import_core6.CssClassApplier.getToolPanelClassesFromColDef(this.column.getColDef(), this.gridOptionsService, this.column, null);
    classes.forEach((c) => this.addOrRemoveCssClass(c, true));
  }
  getColumn() {
    return this.column;
  }
  setupTooltip() {
    const isTooltipWhenTruncated = this.gridOptionsService.get("tooltipShowMode") === "whenTruncated";
    let shouldDisplayTooltip;
    if (isTooltipWhenTruncated) {
      shouldDisplayTooltip = () => this.eLabel.scrollWidth > this.eLabel.clientWidth;
    }
    const refresh = () => {
      const newTooltipText = this.column.getColDef().headerTooltip;
      this.setTooltip({ newTooltipText, location: "columnToolPanelColumn", shouldDisplayTooltip });
    };
    refresh();
    this.addManagedListener(this.eventService, import_core6.Events.EVENT_NEW_COLUMNS_LOADED, refresh);
  }
  getTooltipParams() {
    const res = super.getTooltipParams();
    res.location = "columnToolPanelColumn";
    res.colDef = this.column.getColDef();
    return res;
  }
  onContextMenu(e) {
    const { column, gridOptionsService } = this;
    if (gridOptionsService.get("functionsReadOnly")) {
      return;
    }
    const contextMenu = this.createBean(new ToolPanelContextMenu(column, e, this.focusWrapper));
    this.addDestroyFunc(() => {
      if (contextMenu.isAlive()) {
        this.destroyBean(contextMenu);
      }
    });
  }
  handleKeyDown(e) {
    if (e.key === import_core6.KeyCode.SPACE) {
      e.preventDefault();
      if (this.isSelectable()) {
        this.onSelectAllChanged(!this.isSelected());
      }
    }
  }
  onLabelClicked() {
    if (this.gridOptionsService.get("functionsReadOnly")) {
      return;
    }
    const nextState = !this.cbSelect.getValue();
    this.onChangeCommon(nextState);
  }
  onCheckboxChanged(event) {
    this.onChangeCommon(event.selected);
  }
  onChangeCommon(nextState) {
    if (this.cbSelect.isReadOnly()) {
      return;
    }
    this.refreshAriaLabel();
    if (this.processingColumnStateChange) {
      return;
    }
    this.modelItemUtils.setColumn(this.column, nextState, "toolPanelUi");
  }
  refreshAriaLabel() {
    const translate = this.localeService.getLocaleTextFunc();
    const columnLabel = translate("ariaColumn", "Column");
    const state = this.cbSelect.getValue() ? translate("ariaVisible", "visible") : translate("ariaHidden", "hidden");
    const visibilityLabel = translate("ariaToggleVisibility", "Press SPACE to toggle visibility");
    import_core6._.setAriaLabel(this.focusWrapper, `${this.displayName} ${columnLabel}`);
    this.cbSelect.setInputAriaLabel(`${visibilityLabel} (${state})`);
    import_core6._.setAriaDescribedBy(this.focusWrapper, this.cbSelect.getInputElement().id);
  }
  setupDragging() {
    if (!this.allowDragging) {
      import_core6._.setDisplayed(this.eDragHandle, false);
      return;
    }
    let hideColumnOnExit = !this.gridOptionsService.get("suppressDragLeaveHidesColumns");
    const dragSource = {
      type: import_core6.DragSourceType.ToolPanel,
      eElement: this.eDragHandle,
      dragItemName: this.displayName,
      getDefaultIconName: () => hideColumnOnExit ? import_core6.DragAndDropService.ICON_HIDE : import_core6.DragAndDropService.ICON_NOT_ALLOWED,
      getDragItem: () => this.createDragItem(),
      onDragStarted: () => {
        hideColumnOnExit = !this.gridOptionsService.get("suppressDragLeaveHidesColumns");
        const event = {
          type: import_core6.Events.EVENT_COLUMN_PANEL_ITEM_DRAG_START,
          column: this.column
        };
        this.eventService.dispatchEvent(event);
      },
      onDragStopped: () => {
        const event = {
          type: import_core6.Events.EVENT_COLUMN_PANEL_ITEM_DRAG_END
        };
        this.eventService.dispatchEvent(event);
      },
      onGridEnter: (dragItem) => {
        if (hideColumnOnExit) {
          this.modelItemUtils.updateColumns({
            columns: [this.column],
            visibleState: dragItem == null ? void 0 : dragItem.visibleState,
            pivotState: dragItem == null ? void 0 : dragItem.pivotState,
            eventType: "toolPanelUi"
          });
        }
      },
      onGridExit: () => {
        if (hideColumnOnExit) {
          this.onChangeCommon(false);
        }
      }
    };
    this.dragAndDropService.addDragSource(dragSource, true);
    this.addDestroyFunc(() => this.dragAndDropService.removeDragSource(dragSource));
  }
  createDragItem() {
    const colId = this.column.getColId();
    const visibleState = { [colId]: this.column.isVisible() };
    const pivotState = { [colId]: this.modelItemUtils.createPivotState(this.column) };
    return {
      columns: [this.column],
      visibleState,
      pivotState
    };
  }
  onColumnStateChanged() {
    this.processingColumnStateChange = true;
    const isPivotMode = this.columnModel.isPivotMode();
    if (isPivotMode) {
      const anyFunctionActive = this.column.isAnyFunctionActive();
      this.cbSelect.setValue(anyFunctionActive);
    } else {
      this.cbSelect.setValue(this.column.isVisible());
    }
    let canBeToggled = true;
    let canBeDragged = true;
    if (isPivotMode) {
      const functionsReadOnly = this.gridOptionsService.get("functionsReadOnly");
      const noFunctionsAllowed = !this.column.isAnyFunctionAllowed();
      canBeToggled = !functionsReadOnly && !noFunctionsAllowed;
      canBeDragged = canBeToggled;
    } else {
      const { enableRowGroup, enableValue, lockPosition, suppressMovable, lockVisible } = this.column.getColDef();
      const forceDraggable = !!enableRowGroup || !!enableValue;
      const disableDraggable = !!lockPosition || !!suppressMovable;
      canBeToggled = !lockVisible;
      canBeDragged = forceDraggable || !disableDraggable;
    }
    this.cbSelect.setReadOnly(!canBeToggled);
    this.eDragHandle.classList.toggle("ag-column-select-column-readonly", !canBeDragged);
    this.addOrRemoveCssClass("ag-column-select-column-readonly", !canBeDragged && !canBeToggled);
    const checkboxPassive = isPivotMode && this.gridOptionsService.get("functionsPassive");
    this.cbSelect.setPassive(checkboxPassive);
    this.processingColumnStateChange = false;
  }
  getDisplayName() {
    return this.displayName;
  }
  onSelectAllChanged(value) {
    if (value !== this.cbSelect.getValue()) {
      if (!this.cbSelect.isReadOnly()) {
        this.cbSelect.toggle();
      }
    }
  }
  isSelected() {
    return this.cbSelect.getValue();
  }
  isSelectable() {
    return !this.cbSelect.isReadOnly();
  }
  isExpandable() {
    return false;
  }
  setExpanded(value) {
    console.warn("AG Grid: can not expand a column item that does not represent a column group header");
  }
};
_ToolPanelColumnComp.TEMPLATE = /* html */
`<div class="ag-column-select-column" aria-hidden="true">
            <ag-checkbox ref="cbSelect" class="ag-column-select-checkbox"></ag-checkbox>
            <span class="ag-column-select-column-label" ref="eLabel"></span>
        </div>`;
__decorateClass([
  (0, import_core6.Autowired)("columnModel")
], _ToolPanelColumnComp.prototype, "columnModel", 2);
__decorateClass([
  (0, import_core6.Autowired)("dragAndDropService")
], _ToolPanelColumnComp.prototype, "dragAndDropService", 2);
__decorateClass([
  (0, import_core6.Autowired)("modelItemUtils")
], _ToolPanelColumnComp.prototype, "modelItemUtils", 2);
__decorateClass([
  (0, import_core6.RefSelector)("eLabel")
], _ToolPanelColumnComp.prototype, "eLabel", 2);
__decorateClass([
  (0, import_core6.RefSelector)("cbSelect")
], _ToolPanelColumnComp.prototype, "cbSelect", 2);
__decorateClass([
  import_core6.PostConstruct
], _ToolPanelColumnComp.prototype, "init", 1);
var ToolPanelColumnComp = _ToolPanelColumnComp;

// enterprise-modules/column-tool-panel/src/columnToolPanel/primaryColsListPanel.ts
var UIColumnModel = class {
  constructor(items) {
    this.items = items;
  }
  getRowCount() {
    return this.items.length;
  }
  getRow(index) {
    return this.items[index];
  }
};
var PRIMARY_COLS_LIST_PANEL_CLASS = "ag-column-select-list";
var _PrimaryColsListPanel = class _PrimaryColsListPanel extends import_core7.Component {
  constructor() {
    super(_PrimaryColsListPanel.TEMPLATE);
    this.destroyColumnItemFuncs = [];
    this.hasLoadedInitialState = false;
    this.isInitialState = false;
  }
  destroyColumnTree() {
    this.allColsTree = [];
    this.destroyColumnItemFuncs.forEach((f) => f());
    this.destroyColumnItemFuncs = [];
  }
  init(params, allowDragging, eventType) {
    this.params = params;
    this.allowDragging = allowDragging;
    this.eventType = eventType;
    if (!this.params.suppressSyncLayoutWithGrid) {
      this.addManagedListener(this.eventService, import_core7.Events.EVENT_COLUMN_MOVED, this.onColumnsChanged.bind(this));
    }
    this.addManagedListener(this.eventService, import_core7.Events.EVENT_NEW_COLUMNS_LOADED, this.onColumnsChanged.bind(this));
    const eventsImpactingCheckedState = [
      import_core7.Events.EVENT_COLUMN_PIVOT_CHANGED,
      import_core7.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED,
      import_core7.Events.EVENT_COLUMN_ROW_GROUP_CHANGED,
      import_core7.Events.EVENT_COLUMN_VALUE_CHANGED,
      import_core7.Events.EVENT_COLUMN_VISIBLE,
      import_core7.Events.EVENT_NEW_COLUMNS_LOADED
    ];
    eventsImpactingCheckedState.forEach((event) => {
      this.addManagedListener(this.eventService, event, this.fireSelectionChangedEvent.bind(this));
    });
    this.expandGroupsByDefault = !this.params.contractColumnSelection;
    this.virtualList = this.createManagedBean(new import_core7.VirtualList({
      cssIdentifier: "column-select",
      ariaRole: "tree"
    }));
    this.appendChild(this.virtualList.getGui());
    this.virtualList.setComponentCreator(
      (item, listItemElement) => {
        import_core7._.setAriaLevel(listItemElement, item.getDept() + 1);
        return this.createComponentFromItem(item, listItemElement);
      }
    );
    if (this.columnModel.isReady()) {
      this.onColumnsChanged();
    }
    if (this.params.suppressColumnMove) {
      return;
    }
    this.createManagedBean(
      new PrimaryColsListPanelItemDragFeature(this, this.virtualList)
    );
  }
  createComponentFromItem(item, listItemElement) {
    if (item.isGroup()) {
      const renderedGroup = new ToolPanelColumnGroupComp(item, this.allowDragging, this.eventType, listItemElement);
      this.getContext().createBean(renderedGroup);
      return renderedGroup;
    }
    const columnComp = new ToolPanelColumnComp(item, this.allowDragging, this.groupsExist, listItemElement);
    this.getContext().createBean(columnComp);
    return columnComp;
  }
  onColumnsChanged() {
    if (!this.hasLoadedInitialState) {
      this.hasLoadedInitialState = true;
      this.isInitialState = !!this.params.initialState;
    }
    const expandedStates = this.getExpandedStates();
    const pivotModeActive = this.columnModel.isPivotMode();
    const shouldSyncColumnLayoutWithGrid = !this.params.suppressSyncLayoutWithGrid && !pivotModeActive;
    if (shouldSyncColumnLayoutWithGrid) {
      this.buildTreeFromWhatGridIsDisplaying();
    } else {
      this.buildTreeFromProvidedColumnDefs();
    }
    this.setExpandedStates(expandedStates);
    this.markFilteredColumns();
    this.flattenAndFilterModel();
    this.isInitialState = false;
  }
  getDisplayedColsList() {
    return this.displayedColsList;
  }
  getExpandedStates() {
    const res = {};
    if (this.isInitialState) {
      const { expandedGroupIds } = this.params.initialState;
      expandedGroupIds.forEach((id) => {
        res[id] = true;
      });
      return res;
    }
    if (!this.allColsTree) {
      return {};
    }
    this.forEachItem((item) => {
      if (!item.isGroup()) {
        return;
      }
      const colGroup = item.getColumnGroup();
      if (colGroup) {
        res[colGroup.getId()] = item.isExpanded();
      }
    });
    return res;
  }
  setExpandedStates(states) {
    if (!this.allColsTree) {
      return;
    }
    const { isInitialState } = this;
    this.forEachItem((item) => {
      if (!item.isGroup()) {
        return;
      }
      const colGroup = item.getColumnGroup();
      if (colGroup) {
        const expanded = states[colGroup.getId()];
        const groupExistedLastTime = expanded != null;
        if (groupExistedLastTime || isInitialState) {
          item.setExpanded(!!expanded);
        }
      }
    });
  }
  buildTreeFromWhatGridIsDisplaying() {
    this.colDefService.syncLayoutWithGrid(this.setColumnLayout.bind(this));
  }
  setColumnLayout(colDefs) {
    const columnTree = this.colDefService.createColumnTree(colDefs);
    this.buildListModel(columnTree);
    this.groupsExist = colDefs.some((colDef) => {
      return colDef && typeof colDef.children !== "undefined";
    });
    this.markFilteredColumns();
    this.flattenAndFilterModel();
  }
  buildTreeFromProvidedColumnDefs() {
    this.buildListModel(this.columnModel.getPrimaryColumnTree());
    this.groupsExist = this.columnModel.isPrimaryColumnGroupsPresent();
  }
  buildListModel(columnTree) {
    const columnExpandedListener = this.onColumnExpanded.bind(this);
    const addListeners = (item) => {
      item.addEventListener(ColumnModelItem.EVENT_EXPANDED_CHANGED, columnExpandedListener);
      const removeFunc = item.removeEventListener.bind(item, ColumnModelItem.EVENT_EXPANDED_CHANGED, columnExpandedListener);
      this.destroyColumnItemFuncs.push(removeFunc);
    };
    const recursivelyBuild = (tree, dept, parentList) => {
      tree.forEach((child) => {
        if (child instanceof import_core7.ProvidedColumnGroup) {
          createGroupItem(child, dept, parentList);
        } else {
          createColumnItem(child, dept, parentList);
        }
      });
    };
    const createGroupItem = (columnGroup, dept, parentList) => {
      const columnGroupDef = columnGroup.getColGroupDef();
      const skipThisGroup = columnGroupDef && columnGroupDef.suppressColumnsToolPanel;
      if (skipThisGroup) {
        return;
      }
      if (columnGroup.isPadding()) {
        recursivelyBuild(columnGroup.getChildren(), dept, parentList);
        return;
      }
      const displayName = this.columnModel.getDisplayNameForProvidedColumnGroup(null, columnGroup, "columnToolPanel");
      const item = new ColumnModelItem(displayName, columnGroup, dept, true, this.expandGroupsByDefault);
      parentList.push(item);
      addListeners(item);
      recursivelyBuild(columnGroup.getChildren(), dept + 1, item.getChildren());
    };
    const createColumnItem = (column, dept, parentList) => {
      const skipThisColumn = column.getColDef() && column.getColDef().suppressColumnsToolPanel;
      if (skipThisColumn) {
        return;
      }
      const displayName = this.columnModel.getDisplayNameForColumn(column, "columnToolPanel");
      parentList.push(new ColumnModelItem(displayName, column, dept));
    };
    this.destroyColumnTree();
    recursivelyBuild(columnTree, 0, this.allColsTree);
  }
  onColumnExpanded() {
    this.flattenAndFilterModel();
  }
  flattenAndFilterModel() {
    this.displayedColsList = [];
    const recursiveFunc = (item) => {
      if (!item.isPassesFilter()) {
        return;
      }
      this.displayedColsList.push(item);
      if (item.isGroup() && item.isExpanded()) {
        item.getChildren().forEach(recursiveFunc);
      }
    };
    this.allColsTree.forEach(recursiveFunc);
    this.virtualList.setModel(new UIColumnModel(this.displayedColsList));
    const focusedRow = this.virtualList.getLastFocusedRow();
    this.virtualList.refresh();
    if (focusedRow != null) {
      this.focusRowIfAlive(focusedRow);
    }
    this.notifyListeners();
    this.refreshAriaLabel();
  }
  refreshAriaLabel() {
    const translate = this.localeService.getLocaleTextFunc();
    const columnListName = translate("ariaColumnPanelList", "Column List");
    const localeColumns = translate("columns", "Columns");
    const items = this.displayedColsList.length;
    import_core7._.setAriaLabel(this.virtualList.getAriaElement(), `${columnListName} ${items} ${localeColumns}`);
  }
  focusRowIfAlive(rowIndex) {
    window.setTimeout(() => {
      if (this.isAlive()) {
        this.virtualList.focusRow(rowIndex);
      }
    }, 0);
  }
  forEachItem(callback) {
    const recursiveFunc = (items) => {
      items.forEach((item) => {
        callback(item);
        if (item.isGroup()) {
          recursiveFunc(item.getChildren());
        }
      });
    };
    if (!this.allColsTree) {
      return;
    }
    recursiveFunc(this.allColsTree);
  }
  doSetExpandedAll(value) {
    this.forEachItem((item) => {
      if (item.isGroup()) {
        item.setExpanded(value);
      }
    });
  }
  setGroupsExpanded(expand, groupIds) {
    if (!groupIds) {
      this.doSetExpandedAll(expand);
      return;
    }
    const expandedGroupIds = [];
    this.forEachItem((item) => {
      if (!item.isGroup()) {
        return;
      }
      const groupId = item.getColumnGroup().getId();
      if (groupIds.indexOf(groupId) >= 0) {
        item.setExpanded(expand);
        expandedGroupIds.push(groupId);
      }
    });
    const unrecognisedGroupIds = groupIds.filter((groupId) => !import_core7._.includes(expandedGroupIds, groupId));
    if (unrecognisedGroupIds.length > 0) {
      console.warn("AG Grid: unable to find group(s) for supplied groupIds:", unrecognisedGroupIds);
    }
  }
  getExpandState() {
    let expandedCount = 0;
    let notExpandedCount = 0;
    this.forEachItem((item) => {
      if (!item.isGroup()) {
        return;
      }
      if (item.isExpanded()) {
        expandedCount++;
      } else {
        notExpandedCount++;
      }
    });
    if (expandedCount > 0 && notExpandedCount > 0) {
      return 2 /* INDETERMINATE */;
    }
    if (notExpandedCount > 0) {
      return 1 /* COLLAPSED */;
    }
    return 0 /* EXPANDED */;
  }
  doSetSelectedAll(selectAllChecked) {
    this.modelItemUtils.selectAllChildren(this.allColsTree, selectAllChecked, this.eventType);
  }
  getSelectionState() {
    let checkedCount = 0;
    let uncheckedCount = 0;
    const pivotMode = this.columnModel.isPivotMode();
    this.forEachItem((item) => {
      if (item.isGroup()) {
        return;
      }
      if (!item.isPassesFilter()) {
        return;
      }
      const column = item.getColumn();
      const colDef = column.getColDef();
      let checked;
      if (pivotMode) {
        const noPivotModeOptionsAllowed = !column.isAllowPivot() && !column.isAllowRowGroup() && !column.isAllowValue();
        if (noPivotModeOptionsAllowed) {
          return;
        }
        checked = column.isValueActive() || column.isPivotActive() || column.isRowGroupActive();
      } else {
        if (colDef.lockVisible) {
          return;
        }
        checked = column.isVisible();
      }
      checked ? checkedCount++ : uncheckedCount++;
    });
    if (checkedCount > 0 && uncheckedCount > 0) {
      return void 0;
    }
    return !(checkedCount === 0 || uncheckedCount > 0);
  }
  setFilterText(filterText) {
    this.filterText = import_core7._.exists(filterText) ? filterText.toLowerCase() : null;
    this.markFilteredColumns();
    this.flattenAndFilterModel();
  }
  markFilteredColumns() {
    const passesFilter = (item) => {
      if (!import_core7._.exists(this.filterText)) {
        return true;
      }
      const displayName = item.getDisplayName();
      return displayName == null || displayName.toLowerCase().indexOf(this.filterText) !== -1;
    };
    const recursivelyCheckFilter = (item, parentPasses) => {
      let atLeastOneChildPassed = false;
      if (item.isGroup()) {
        const groupPasses = passesFilter(item);
        item.getChildren().forEach((child) => {
          const childPasses = recursivelyCheckFilter(child, groupPasses || parentPasses);
          if (childPasses) {
            atLeastOneChildPassed = childPasses;
          }
        });
      }
      const filterPasses = parentPasses || atLeastOneChildPassed ? true : passesFilter(item);
      item.setPassesFilter(filterPasses);
      return filterPasses;
    };
    this.allColsTree.forEach((item) => recursivelyCheckFilter(item, false));
  }
  notifyListeners() {
    this.fireGroupExpandedEvent();
    this.fireSelectionChangedEvent();
  }
  fireGroupExpandedEvent() {
    const expandState = this.getExpandState();
    this.dispatchEvent({ type: "groupExpanded", state: expandState });
  }
  fireSelectionChangedEvent() {
    if (!this.allColsTree) {
      return;
    }
    const selectionState = this.getSelectionState();
    this.dispatchEvent({ type: "selectionChanged", state: selectionState });
  }
  getExpandedGroups() {
    const expandedGroupIds = [];
    if (!this.allColsTree) {
      return expandedGroupIds;
    }
    this.forEachItem((item) => {
      if (item.isGroup() && item.isExpanded()) {
        expandedGroupIds.push(item.getColumnGroup().getId());
      }
    });
    return expandedGroupIds;
  }
};
_PrimaryColsListPanel.TEMPLATE = /* html */
`<div class="${PRIMARY_COLS_LIST_PANEL_CLASS}" role="presentation"></div>`;
__decorateClass([
  (0, import_core7.Autowired)("columnModel")
], _PrimaryColsListPanel.prototype, "columnModel", 2);
__decorateClass([
  (0, import_core7.Autowired)("toolPanelColDefService")
], _PrimaryColsListPanel.prototype, "colDefService", 2);
__decorateClass([
  (0, import_core7.Autowired)("modelItemUtils")
], _PrimaryColsListPanel.prototype, "modelItemUtils", 2);
__decorateClass([
  import_core7.PreDestroy
], _PrimaryColsListPanel.prototype, "destroyColumnTree", 1);
var PrimaryColsListPanel = _PrimaryColsListPanel;

// enterprise-modules/column-tool-panel/src/columnToolPanel/columnToolPanel.ts
var import_core10 = require("@ag-grid-community/core");

// enterprise-modules/column-tool-panel/src/columnToolPanel/pivotModePanel.ts
var import_core8 = require("@ag-grid-community/core");
var PivotModePanel = class extends import_core8.Component {
  createTemplate() {
    return (
      /* html */
      `<div class="ag-pivot-mode-panel">
                <ag-toggle-button ref="cbPivotMode" class="ag-pivot-mode-select"></ag-toggle-button>
            </div>`
    );
  }
  init() {
    this.setTemplate(this.createTemplate());
    this.cbPivotMode.setValue(this.columnModel.isPivotMode());
    const localeTextFunc = this.localeService.getLocaleTextFunc();
    this.cbPivotMode.setLabel(localeTextFunc("pivotMode", "Pivot Mode"));
    this.addManagedListener(this.cbPivotMode, import_core8.Events.EVENT_FIELD_VALUE_CHANGED, this.onBtPivotMode.bind(this));
    this.addManagedListener(this.eventService, import_core8.Events.EVENT_NEW_COLUMNS_LOADED, this.onPivotModeChanged.bind(this));
    this.addManagedListener(this.eventService, import_core8.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.onPivotModeChanged.bind(this));
  }
  onBtPivotMode() {
    const newValue = !!this.cbPivotMode.getValue();
    if (newValue !== this.columnModel.isPivotMode()) {
      this.gridOptionsService.updateGridOptions({ options: { pivotMode: newValue }, source: "toolPanelUi" });
      const { api } = this;
      if (api) {
        api.refreshHeader();
      }
    }
  }
  onPivotModeChanged() {
    const pivotModeActive = this.columnModel.isPivotMode();
    this.cbPivotMode.setValue(pivotModeActive);
  }
};
__decorateClass([
  (0, import_core8.Autowired)("columnModel")
], PivotModePanel.prototype, "columnModel", 2);
__decorateClass([
  (0, import_core8.Autowired)("gridApi")
], PivotModePanel.prototype, "api", 2);
__decorateClass([
  (0, import_core8.RefSelector)("cbPivotMode")
], PivotModePanel.prototype, "cbPivotMode", 2);
__decorateClass([
  import_core8.PreConstruct
], PivotModePanel.prototype, "init", 1);

// enterprise-modules/column-tool-panel/src/columnToolPanel/columnToolPanel.ts
var import_row_grouping = require("@ag-grid-enterprise/row-grouping");

// enterprise-modules/column-tool-panel/src/columnToolPanel/primaryColsPanel.ts
var import_core9 = require("@ag-grid-community/core");
var _PrimaryColsPanel = class _PrimaryColsPanel extends import_core9.Component {
  constructor() {
    super(_PrimaryColsPanel.TEMPLATE);
  }
  // we allow dragging in the toolPanel, but not when this component appears in the column menu
  init(allowDragging, params, eventType) {
    this.allowDragging = allowDragging;
    this.params = params;
    this.eventType = eventType;
    this.primaryColsHeaderPanel.init(this.params);
    const hideFilter = this.params.suppressColumnFilter;
    const hideSelect = this.params.suppressColumnSelectAll;
    const hideExpand = this.params.suppressColumnExpandAll;
    if (hideExpand && hideFilter && hideSelect) {
      this.primaryColsHeaderPanel.setDisplayed(false);
    }
    this.addManagedListener(this.primaryColsListPanel, "groupExpanded", this.onGroupExpanded.bind(this));
    this.addManagedListener(this.primaryColsListPanel, "selectionChanged", this.onSelectionChange.bind(this));
    this.primaryColsListPanel.init(this.params, this.allowDragging, this.eventType);
    this.addManagedListener(this.primaryColsHeaderPanel, "expandAll", this.onExpandAll.bind(this));
    this.addManagedListener(this.primaryColsHeaderPanel, "collapseAll", this.onCollapseAll.bind(this));
    this.addManagedListener(this.primaryColsHeaderPanel, "selectAll", this.onSelectAll.bind(this));
    this.addManagedListener(this.primaryColsHeaderPanel, "unselectAll", this.onUnselectAll.bind(this));
    this.addManagedListener(this.primaryColsHeaderPanel, "filterChanged", this.onFilterChanged.bind(this));
    this.positionableFeature = new import_core9.PositionableFeature(this.getGui(), { minHeight: 100 });
    this.createManagedBean(this.positionableFeature);
  }
  toggleResizable(resizable) {
    this.positionableFeature.setResizable(resizable ? { bottom: true } : false);
  }
  onExpandAll() {
    this.primaryColsListPanel.doSetExpandedAll(true);
  }
  onCollapseAll() {
    this.primaryColsListPanel.doSetExpandedAll(false);
  }
  expandGroups(groupIds) {
    this.primaryColsListPanel.setGroupsExpanded(true, groupIds);
  }
  collapseGroups(groupIds) {
    this.primaryColsListPanel.setGroupsExpanded(false, groupIds);
  }
  setColumnLayout(colDefs) {
    this.primaryColsListPanel.setColumnLayout(colDefs);
  }
  onFilterChanged(event) {
    this.primaryColsListPanel.setFilterText(event.filterText);
  }
  syncLayoutWithGrid() {
    this.primaryColsListPanel.onColumnsChanged();
  }
  onSelectAll() {
    this.primaryColsListPanel.doSetSelectedAll(true);
  }
  onUnselectAll() {
    this.primaryColsListPanel.doSetSelectedAll(false);
  }
  onGroupExpanded(event) {
    this.primaryColsHeaderPanel.setExpandState(event.state);
    this.params.onStateUpdated();
  }
  onSelectionChange(event) {
    this.primaryColsHeaderPanel.setSelectionState(event.state);
  }
  getExpandedGroups() {
    return this.primaryColsListPanel.getExpandedGroups();
  }
};
_PrimaryColsPanel.TEMPLATE = /* html */
`<div class="ag-column-select">
            <ag-primary-cols-header ref="primaryColsHeaderPanel"></ag-primary-cols-header>
            <ag-primary-cols-list ref="primaryColsListPanel"></ag-primary-cols-list>
        </div>`;
__decorateClass([
  (0, import_core9.RefSelector)("primaryColsHeaderPanel")
], _PrimaryColsPanel.prototype, "primaryColsHeaderPanel", 2);
__decorateClass([
  (0, import_core9.RefSelector)("primaryColsListPanel")
], _PrimaryColsPanel.prototype, "primaryColsListPanel", 2);
var PrimaryColsPanel = _PrimaryColsPanel;

// enterprise-modules/column-tool-panel/src/columnToolPanel/columnToolPanel.ts
var _ColumnToolPanel = class _ColumnToolPanel extends import_core10.Component {
  constructor() {
    super(_ColumnToolPanel.TEMPLATE);
    this.initialised = false;
    this.childDestroyFuncs = [];
  }
  // lazy initialise the panel
  setVisible(visible) {
    super.setDisplayed(visible);
    if (visible && !this.initialised) {
      this.init(this.params);
    }
  }
  init(params) {
    const defaultParams = this.gridOptionsService.addGridCommonParams({
      suppressColumnMove: false,
      suppressColumnSelectAll: false,
      suppressColumnFilter: false,
      suppressColumnExpandAll: false,
      contractColumnSelection: false,
      suppressPivotMode: false,
      suppressRowGroups: false,
      suppressValues: false,
      suppressPivots: false,
      suppressSyncLayoutWithGrid: false
    });
    this.params = __spreadValues(__spreadValues({}, defaultParams), params);
    if (this.isRowGroupingModuleLoaded() && !this.params.suppressPivotMode) {
      this.pivotModePanel = this.createBean(new PivotModePanel());
      this.childDestroyFuncs.push(() => this.destroyBean(this.pivotModePanel));
      this.appendChild(this.pivotModePanel);
    }
    this.primaryColsPanel = this.createBean(new PrimaryColsPanel());
    this.childDestroyFuncs.push(() => this.destroyBean(this.primaryColsPanel));
    this.primaryColsPanel.init(true, this.params, "toolPanelUi");
    this.primaryColsPanel.addCssClass("ag-column-panel-column-select");
    this.appendChild(this.primaryColsPanel);
    if (this.isRowGroupingModuleLoaded()) {
      if (!this.params.suppressRowGroups) {
        this.rowGroupDropZonePanel = this.createBean(new import_row_grouping.RowGroupDropZonePanel(false));
        this.childDestroyFuncs.push(() => this.destroyBean(this.rowGroupDropZonePanel));
        this.appendChild(this.rowGroupDropZonePanel);
      }
      if (!this.params.suppressValues) {
        this.valuesDropZonePanel = this.createBean(new import_row_grouping.ValuesDropZonePanel(false));
        this.childDestroyFuncs.push(() => this.destroyBean(this.valuesDropZonePanel));
        this.appendChild(this.valuesDropZonePanel);
      }
      if (!this.params.suppressPivots) {
        this.pivotDropZonePanel = this.createBean(new import_row_grouping.PivotDropZonePanel(false));
        this.childDestroyFuncs.push(() => this.destroyBean(this.pivotDropZonePanel));
        this.appendChild(this.pivotDropZonePanel);
      }
      this.setLastVisible();
      const pivotModeListener = this.addManagedListener(this.eventService, import_core10.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, () => {
        this.resetChildrenHeight();
        this.setLastVisible();
      });
      this.childDestroyFuncs.push(() => pivotModeListener());
    }
    this.initialised = true;
  }
  setPivotModeSectionVisible(visible) {
    if (!this.isRowGroupingModuleLoaded()) {
      return;
    }
    if (this.pivotModePanel) {
      this.pivotModePanel.setDisplayed(visible);
    } else if (visible) {
      this.pivotModePanel = this.createBean(new PivotModePanel());
      this.getGui().insertBefore(this.pivotModePanel.getGui(), this.getGui().firstChild);
      this.childDestroyFuncs.push(() => this.destroyBean(this.pivotModePanel));
    }
    this.setLastVisible();
  }
  setRowGroupsSectionVisible(visible) {
    if (!this.isRowGroupingModuleLoaded()) {
      return;
    }
    if (this.rowGroupDropZonePanel) {
      this.rowGroupDropZonePanel.setDisplayed(visible);
    } else if (visible) {
      this.rowGroupDropZonePanel = this.createManagedBean(new import_row_grouping.RowGroupDropZonePanel(false));
      this.appendChild(this.rowGroupDropZonePanel);
    }
    this.setLastVisible();
  }
  setValuesSectionVisible(visible) {
    if (!this.isRowGroupingModuleLoaded()) {
      return;
    }
    if (this.valuesDropZonePanel) {
      this.valuesDropZonePanel.setDisplayed(visible);
    } else if (visible) {
      this.valuesDropZonePanel = this.createManagedBean(new import_row_grouping.ValuesDropZonePanel(false));
      this.appendChild(this.valuesDropZonePanel);
    }
    this.setLastVisible();
  }
  setPivotSectionVisible(visible) {
    if (!this.isRowGroupingModuleLoaded()) {
      return;
    }
    if (this.pivotDropZonePanel) {
      this.pivotDropZonePanel.setDisplayed(visible);
    } else if (visible) {
      this.pivotDropZonePanel = this.createManagedBean(new import_row_grouping.PivotDropZonePanel(false));
      this.appendChild(this.pivotDropZonePanel);
      this.pivotDropZonePanel.setDisplayed(visible);
    }
    this.setLastVisible();
  }
  setResizers() {
    [
      this.primaryColsPanel,
      this.rowGroupDropZonePanel,
      this.valuesDropZonePanel,
      this.pivotDropZonePanel
    ].forEach((panel) => {
      if (!panel) {
        return;
      }
      const eGui = panel.getGui();
      panel.toggleResizable(!eGui.classList.contains("ag-last-column-drop") && !eGui.classList.contains("ag-hidden"));
    });
  }
  setLastVisible() {
    const eGui = this.getGui();
    const columnDrops = Array.prototype.slice.call(eGui.querySelectorAll(".ag-column-drop"));
    columnDrops.forEach((columnDrop) => columnDrop.classList.remove("ag-last-column-drop"));
    const columnDropEls = eGui.querySelectorAll(".ag-column-drop:not(.ag-hidden)");
    const lastVisible = import_core10._.last(columnDropEls);
    if (lastVisible) {
      lastVisible.classList.add("ag-last-column-drop");
    }
    this.setResizers();
  }
  resetChildrenHeight() {
    const eGui = this.getGui();
    const children = eGui.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      child.style.removeProperty("height");
      child.style.removeProperty("flex");
    }
  }
  isRowGroupingModuleLoaded() {
    return import_core10.ModuleRegistry.__assertRegistered(import_core10.ModuleNames.RowGroupingModule, "Row Grouping", this.context.getGridId());
  }
  expandColumnGroups(groupIds) {
    this.primaryColsPanel.expandGroups(groupIds);
  }
  collapseColumnGroups(groupIds) {
    this.primaryColsPanel.collapseGroups(groupIds);
  }
  setColumnLayout(colDefs) {
    this.primaryColsPanel.setColumnLayout(colDefs);
  }
  syncLayoutWithGrid() {
    this.primaryColsPanel.syncLayoutWithGrid();
  }
  destroyChildren() {
    this.childDestroyFuncs.forEach((func) => func());
    this.childDestroyFuncs.length = 0;
    import_core10._.clearElement(this.getGui());
  }
  refresh(params) {
    this.destroyChildren();
    this.init(params);
    return true;
  }
  getState() {
    return {
      expandedGroupIds: this.primaryColsPanel.getExpandedGroups()
    };
  }
  // this is a user component, and IComponent has "public destroy()" as part of the interface.
  // so this must be public.
  destroy() {
    this.destroyChildren();
    super.destroy();
  }
};
_ColumnToolPanel.TEMPLATE = `<div class="ag-column-panel"></div>`;
var ColumnToolPanel = _ColumnToolPanel;

// enterprise-modules/column-tool-panel/src/columnsToolPanelModule.ts
var import_row_grouping2 = require("@ag-grid-enterprise/row-grouping");
var import_side_bar = require("@ag-grid-enterprise/side-bar");

// enterprise-modules/column-tool-panel/src/columnToolPanel/modelItemUtils.ts
var import_core11 = require("@ag-grid-community/core");
var ModelItemUtils = class {
  selectAllChildren(colTree, selectAllChecked, eventType) {
    const cols = this.extractAllLeafColumns(colTree);
    this.setAllColumns(cols, selectAllChecked, eventType);
  }
  setColumn(col, selectAllChecked, eventType) {
    this.setAllColumns([col], selectAllChecked, eventType);
  }
  setAllColumns(cols, selectAllChecked, eventType) {
    if (this.columnModel.isPivotMode()) {
      this.setAllPivot(cols, selectAllChecked, eventType);
    } else {
      this.setAllVisible(cols, selectAllChecked, eventType);
    }
  }
  extractAllLeafColumns(allItems) {
    const res = [];
    const recursiveFunc = (items) => {
      items.forEach((item) => {
        if (!item.isPassesFilter()) {
          return;
        }
        if (item.isGroup()) {
          recursiveFunc(item.getChildren());
        } else {
          res.push(item.getColumn());
        }
      });
    };
    recursiveFunc(allItems);
    return res;
  }
  setAllVisible(columns, visible, eventType) {
    const colStateItems = [];
    columns.forEach((col) => {
      if (col.getColDef().lockVisible) {
        return;
      }
      if (col.isVisible() != visible) {
        colStateItems.push({
          colId: col.getId(),
          hide: !visible
        });
      }
    });
    if (colStateItems.length > 0) {
      this.columnModel.applyColumnState({ state: colStateItems }, eventType);
    }
  }
  setAllPivot(columns, value, eventType) {
    if (this.gridOptionsService.get("functionsPassive")) {
      this.setAllPivotPassive(columns, value);
    } else {
      this.setAllPivotActive(columns, value, eventType);
    }
  }
  setAllPivotPassive(columns, value) {
    const copyOfPivotColumns = this.columnModel.getPivotColumns().slice();
    const copyOfValueColumns = this.columnModel.getValueColumns().slice();
    const copyOfRowGroupColumns = this.columnModel.getRowGroupColumns().slice();
    let pivotChanged = false;
    let valueChanged = false;
    let rowGroupChanged = false;
    const turnOnAction = (col) => {
      if (col.isAnyFunctionActive()) {
        return;
      }
      if (col.isAllowValue()) {
        copyOfValueColumns.push(col);
        valueChanged = true;
      } else if (col.isAllowRowGroup()) {
        copyOfRowGroupColumns.push(col);
        pivotChanged = true;
      } else if (col.isAllowPivot()) {
        copyOfPivotColumns.push(col);
        rowGroupChanged = true;
      }
    };
    const turnOffAction = (col) => {
      if (!col.isAnyFunctionActive()) {
        return;
      }
      if (copyOfPivotColumns.indexOf(col) >= 0) {
        import_core11._.removeFromArray(copyOfPivotColumns, col);
        pivotChanged = true;
      }
      if (copyOfValueColumns.indexOf(col) >= 0) {
        import_core11._.removeFromArray(copyOfValueColumns, col);
        valueChanged = true;
      }
      if (copyOfRowGroupColumns.indexOf(col) >= 0) {
        import_core11._.removeFromArray(copyOfRowGroupColumns, col);
        rowGroupChanged = true;
      }
    };
    const action = value ? turnOnAction : turnOffAction;
    columns.forEach(action);
    if (pivotChanged) {
      const event = {
        type: import_core11.Events.EVENT_COLUMN_PIVOT_CHANGE_REQUEST,
        columns: copyOfPivotColumns
      };
      this.eventService.dispatchEvent(event);
    }
    if (rowGroupChanged) {
      const event = {
        type: import_core11.Events.EVENT_COLUMN_ROW_GROUP_CHANGE_REQUEST,
        columns: copyOfRowGroupColumns
      };
      this.eventService.dispatchEvent(event);
    }
    if (valueChanged) {
      const event = {
        type: import_core11.Events.EVENT_COLUMN_VALUE_CHANGE_REQUEST,
        columns: copyOfRowGroupColumns
      };
      this.eventService.dispatchEvent(event);
    }
  }
  setAllPivotActive(columns, value, eventType) {
    const colStateItems = [];
    const turnOnAction = (col) => {
      if (col.isAnyFunctionActive()) {
        return;
      }
      if (col.isAllowValue()) {
        const aggFunc = typeof col.getAggFunc() === "string" ? col.getAggFunc() : this.aggFuncService.getDefaultAggFunc(col);
        colStateItems.push({
          colId: col.getId(),
          aggFunc
        });
      } else if (col.isAllowRowGroup()) {
        colStateItems.push({
          colId: col.getId(),
          rowGroup: true
        });
      } else if (col.isAllowPivot()) {
        colStateItems.push({
          colId: col.getId(),
          pivot: true
        });
      }
    };
    const turnOffAction = (col) => {
      const isActive = col.isPivotActive() || col.isRowGroupActive() || col.isValueActive();
      if (isActive) {
        colStateItems.push({
          colId: col.getId(),
          pivot: false,
          rowGroup: false,
          aggFunc: null
        });
      }
    };
    const action = value ? turnOnAction : turnOffAction;
    columns.forEach(action);
    if (colStateItems.length > 0) {
      this.columnModel.applyColumnState({ state: colStateItems }, eventType);
    }
  }
  updateColumns(params) {
    const { columns, visibleState, pivotState, eventType } = params;
    const state = columns.map((column) => {
      const colId = column.getColId();
      if (this.columnModel.isPivotMode()) {
        const pivotStateForColumn = pivotState == null ? void 0 : pivotState[colId];
        return {
          colId,
          pivot: pivotStateForColumn == null ? void 0 : pivotStateForColumn.pivot,
          rowGroup: pivotStateForColumn == null ? void 0 : pivotStateForColumn.rowGroup,
          aggFunc: pivotStateForColumn == null ? void 0 : pivotStateForColumn.aggFunc
        };
      } else {
        return {
          colId,
          hide: !(visibleState == null ? void 0 : visibleState[colId])
        };
      }
    });
    this.columnModel.applyColumnState({ state }, eventType);
  }
  createPivotState(column) {
    return {
      pivot: column.isPivotActive(),
      rowGroup: column.isRowGroupActive(),
      aggFunc: column.isValueActive() ? column.getAggFunc() : void 0
    };
  }
};
__decorateClass([
  (0, import_core11.Autowired)("aggFuncService")
], ModelItemUtils.prototype, "aggFuncService", 2);
__decorateClass([
  (0, import_core11.Autowired)("columnModel")
], ModelItemUtils.prototype, "columnModel", 2);
__decorateClass([
  (0, import_core11.Autowired)("gridOptionsService")
], ModelItemUtils.prototype, "gridOptionsService", 2);
__decorateClass([
  (0, import_core11.Autowired)("eventService")
], ModelItemUtils.prototype, "eventService", 2);
ModelItemUtils = __decorateClass([
  (0, import_core11.Bean)("modelItemUtils")
], ModelItemUtils);

// enterprise-modules/column-tool-panel/src/version.ts
var VERSION = "31.2.1";

// enterprise-modules/column-tool-panel/src/columnsToolPanelModule.ts
var ColumnsToolPanelModule = {
  version: VERSION,
  moduleName: import_core12.ModuleNames.ColumnsToolPanelModule,
  beans: [ModelItemUtils],
  agStackComponents: [
    { componentName: "AgPrimaryColsHeader", componentClass: PrimaryColsHeaderPanel },
    { componentName: "AgPrimaryColsList", componentClass: PrimaryColsListPanel },
    { componentName: "AgPrimaryCols", componentClass: PrimaryColsPanel }
  ],
  userComponents: [
    { componentName: "agColumnsToolPanel", componentClass: ColumnToolPanel }
  ],
  dependantModules: [
    import_core13.EnterpriseCoreModule,
    import_row_grouping2.RowGroupingModule,
    import_side_bar.SideBarModule
  ]
};
