var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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

// community-modules/client-side-row-model/src/main.ts
var main_exports = {};
__export(main_exports, {
  ClientSideRowModelModule: () => ClientSideRowModelModule
});
module.exports = __toCommonJS(main_exports);

// community-modules/client-side-row-model/src/clientSideRowModelModule.ts
var import_core9 = require("@ag-grid-community/core");

// community-modules/client-side-row-model/src/clientSideRowModel/clientSideRowModel.ts
var import_core2 = require("@ag-grid-community/core");

// community-modules/client-side-row-model/src/clientSideRowModel/clientSideNodeManager.ts
var import_core = require("@ag-grid-community/core");
var ROOT_NODE_ID = "ROOT_NODE_ID";
var TOP_LEVEL = 0;
var ClientSideNodeManager = class {
  constructor(rootNode, gos, eventService, funcColsService, selectionService, beans) {
    this.nextId = 0;
    // has row data actually been set
    this.rowCountReady = false;
    // when user is provide the id's, we also keep a map of ids to row nodes for convenience
    this.allNodesMap = {};
    this.rootNode = rootNode;
    this.gos = gos;
    this.eventService = eventService;
    this.funcColsService = funcColsService;
    this.beans = beans;
    this.selectionService = selectionService;
    this.rootNode.group = true;
    this.rootNode.level = -1;
    this.rootNode.id = ROOT_NODE_ID;
    this.rootNode.allLeafChildren = [];
    this.rootNode.childrenAfterGroup = [];
    this.rootNode.childrenAfterSort = [];
    this.rootNode.childrenAfterAggFilter = [];
    this.rootNode.childrenAfterFilter = [];
  }
  getCopyOfNodesMap() {
    return (0, import_core._cloneObject)(this.allNodesMap);
  }
  getRowNode(id) {
    return this.allNodesMap[id];
  }
  setRowData(rowData) {
    if (typeof rowData === "string") {
      (0, import_core._warnOnce)("rowData must be an array.");
      return;
    }
    this.rowCountReady = true;
    this.dispatchRowDataUpdateStartedEvent(rowData);
    const rootNode = this.rootNode;
    const sibling = this.rootNode.sibling;
    rootNode.childrenAfterFilter = null;
    rootNode.childrenAfterGroup = null;
    rootNode.childrenAfterAggFilter = null;
    rootNode.childrenAfterSort = null;
    rootNode.childrenMapped = null;
    rootNode.updateHasChildren();
    this.nextId = 0;
    this.allNodesMap = {};
    if (rowData) {
      rootNode.allLeafChildren = rowData.map((dataItem) => this.createNode(dataItem, this.rootNode, TOP_LEVEL));
    } else {
      rootNode.allLeafChildren = [];
      rootNode.childrenAfterGroup = [];
    }
    if (sibling) {
      sibling.childrenAfterFilter = rootNode.childrenAfterFilter;
      sibling.childrenAfterGroup = rootNode.childrenAfterGroup;
      sibling.childrenAfterAggFilter = rootNode.childrenAfterAggFilter;
      sibling.childrenAfterSort = rootNode.childrenAfterSort;
      sibling.childrenMapped = rootNode.childrenMapped;
      sibling.allLeafChildren = rootNode.allLeafChildren;
    }
  }
  updateRowData(rowDataTran, rowNodeOrder) {
    this.rowCountReady = true;
    this.dispatchRowDataUpdateStartedEvent(rowDataTran.add);
    const rowNodeTransaction = {
      remove: [],
      update: [],
      add: []
    };
    const nodesToUnselect = [];
    this.executeRemove(rowDataTran, rowNodeTransaction, nodesToUnselect);
    this.executeUpdate(rowDataTran, rowNodeTransaction, nodesToUnselect);
    this.executeAdd(rowDataTran, rowNodeTransaction);
    this.updateSelection(nodesToUnselect, "rowDataChanged");
    if (rowNodeOrder) {
      (0, import_core._sortRowNodesByOrder)(this.rootNode.allLeafChildren, rowNodeOrder);
    }
    return rowNodeTransaction;
  }
  isRowCountReady() {
    return this.rowCountReady;
  }
  dispatchRowDataUpdateStartedEvent(rowData) {
    const event = {
      type: "rowDataUpdateStarted",
      firstRowData: rowData?.length ? rowData[0] : null
    };
    this.eventService.dispatchEvent(event);
  }
  updateSelection(nodesToUnselect, source) {
    const selectionChanged = nodesToUnselect.length > 0;
    if (selectionChanged) {
      this.selectionService.setNodesSelected({
        newValue: false,
        nodes: nodesToUnselect,
        suppressFinishActions: true,
        source
      });
    }
    this.selectionService.updateGroupsFromChildrenSelections(source);
    if (selectionChanged) {
      const event = {
        type: "selectionChanged",
        source
      };
      this.eventService.dispatchEvent(event);
    }
  }
  executeAdd(rowDataTran, rowNodeTransaction) {
    const { add, addIndex } = rowDataTran;
    if ((0, import_core._missingOrEmpty)(add)) {
      return;
    }
    const newNodes = add.map((item) => this.createNode(item, this.rootNode, TOP_LEVEL));
    const allLeafChildren = this.rootNode.allLeafChildren;
    if (typeof addIndex === "number" && addIndex >= 0) {
      const len = allLeafChildren.length;
      let normalisedAddIndex = addIndex;
      const isTreeData = this.gos.get("treeData");
      if (isTreeData && addIndex > 0 && len > 0) {
        for (let i = 0; i < len; i++) {
          if (allLeafChildren[i]?.rowIndex == addIndex - 1) {
            normalisedAddIndex = i + 1;
            break;
          }
        }
      }
      const nodesBeforeIndex = allLeafChildren.slice(0, normalisedAddIndex);
      const nodesAfterIndex = allLeafChildren.slice(normalisedAddIndex, allLeafChildren.length);
      this.rootNode.allLeafChildren = [...nodesBeforeIndex, ...newNodes, ...nodesAfterIndex];
    } else {
      this.rootNode.allLeafChildren = [...allLeafChildren, ...newNodes];
    }
    if (this.rootNode.sibling) {
      this.rootNode.sibling.allLeafChildren = allLeafChildren;
    }
    rowNodeTransaction.add = newNodes;
  }
  executeRemove(rowDataTran, rowNodeTransaction, nodesToUnselect) {
    const { remove } = rowDataTran;
    if ((0, import_core._missingOrEmpty)(remove)) {
      return;
    }
    const rowIdsRemoved = {};
    remove.forEach((item) => {
      const rowNode = this.lookupRowNode(item);
      if (!rowNode) {
        return;
      }
      if (rowNode.isSelected()) {
        nodesToUnselect.push(rowNode);
      }
      rowNode.clearRowTopAndRowIndex();
      rowIdsRemoved[rowNode.id] = true;
      delete this.allNodesMap[rowNode.id];
      rowNodeTransaction.remove.push(rowNode);
    });
    this.rootNode.allLeafChildren = this.rootNode.allLeafChildren?.filter((rowNode) => !rowIdsRemoved[rowNode.id]) ?? null;
    if (this.rootNode.sibling) {
      this.rootNode.sibling.allLeafChildren = this.rootNode.allLeafChildren;
    }
  }
  executeUpdate(rowDataTran, rowNodeTransaction, nodesToUnselect) {
    const { update } = rowDataTran;
    if ((0, import_core._missingOrEmpty)(update)) {
      return;
    }
    update.forEach((item) => {
      const rowNode = this.lookupRowNode(item);
      if (!rowNode) {
        return;
      }
      rowNode.updateData(item);
      if (!rowNode.selectable && rowNode.isSelected()) {
        nodesToUnselect.push(rowNode);
      }
      this.setMasterForRow(rowNode, item, TOP_LEVEL, false);
      rowNodeTransaction.update.push(rowNode);
    });
  }
  lookupRowNode(data) {
    const getRowIdFunc = this.gos.getRowIdCallback();
    let rowNode;
    if (getRowIdFunc) {
      const id = getRowIdFunc({ data, level: 0 });
      rowNode = this.allNodesMap[id];
      if (!rowNode) {
        (0, import_core._errorOnce)(`could not find row id=${id}, data item was not found for this id`);
        return null;
      }
    } else {
      rowNode = this.rootNode.allLeafChildren?.find((node) => node.data === data);
      if (!rowNode) {
        (0, import_core._errorOnce)(`could not find data item as object was not found`, data);
        (0, import_core._errorOnce)(`Consider using getRowId to help the Grid find matching row data`);
        return null;
      }
    }
    return rowNode || null;
  }
  createNode(dataItem, parent, level) {
    const node = new import_core.RowNode(this.beans);
    node.group = false;
    this.setMasterForRow(node, dataItem, level, true);
    if (parent) {
      node.parent = parent;
    }
    node.level = level;
    node.setDataAndId(dataItem, this.nextId.toString());
    if (this.allNodesMap[node.id]) {
      (0, import_core._warnOnce)(
        `duplicate node id '${node.id}' detected from getRowId callback, this could cause issues in your grid.`
      );
    }
    this.allNodesMap[node.id] = node;
    this.nextId++;
    return node;
  }
  setMasterForRow(rowNode, data, level, setExpanded) {
    const isTreeData = this.gos.get("treeData");
    if (isTreeData) {
      rowNode.setMaster(false);
      if (setExpanded) {
        rowNode.expanded = false;
      }
    } else {
      const masterDetail = this.gos.get("masterDetail");
      if (masterDetail) {
        const isRowMasterFunc = this.gos.get("isRowMaster");
        if (isRowMasterFunc) {
          rowNode.setMaster(isRowMasterFunc(data));
        } else {
          rowNode.setMaster(true);
        }
      } else {
        rowNode.setMaster(false);
      }
      if (setExpanded) {
        const rowGroupColumns = this.funcColsService.getRowGroupColumns();
        const numRowGroupColumns = rowGroupColumns ? rowGroupColumns.length : 0;
        const masterRowLevel = level + numRowGroupColumns;
        rowNode.expanded = rowNode.master ? this.isExpanded(masterRowLevel) : false;
      }
    }
  }
  isExpanded(level) {
    const expandByDefault = this.gos.get("groupDefaultExpanded");
    if (expandByDefault === -1) {
      return true;
    }
    return level < expandByDefault;
  }
};

// community-modules/client-side-row-model/src/clientSideRowModel/clientSideRowModel.ts
var ClientSideRowModel = class extends import_core2.BeanStub {
  constructor() {
    super(...arguments);
    this.beanName = "rowModel";
    this.onRowHeightChanged_debounced = (0, import_core2._debounce)(this.onRowHeightChanged.bind(this), 100);
    this.rowsToDisplay = [];
    /** Has the start method been called */
    this.hasStarted = false;
    /** E.g. data has been set into the node manager already */
    this.shouldSkipSettingDataOnStart = false;
    /**
     * This is to prevent refresh model being called when it's already being called.
     * E.g. the group stage can trigger initial state filter model to be applied. This fires onFilterChanged,
     * which then triggers the listener here that calls refresh model again but at the filter stage
     * (which is about to be run by the original call).
     */
    this.isRefreshingModel = false;
    this.rowCountReady = false;
  }
  wireBeans(beans) {
    this.beans = beans;
    this.columnModel = beans.columnModel;
    this.funcColsService = beans.funcColsService;
    this.selectionService = beans.selectionService;
    this.valueCache = beans.valueCache;
    this.environment = beans.environment;
    this.filterStage = beans.filterStage;
    this.sortStage = beans.sortStage;
    this.flattenStage = beans.flattenStage;
    this.groupStage = beans.groupStage;
    this.aggregationStage = beans.aggregationStage;
    this.pivotStage = beans.pivotStage;
    this.filterAggregatesStage = beans.filterAggregatesStage;
  }
  postConstruct() {
    const refreshEverythingFunc = this.refreshModel.bind(this, { step: import_core2.ClientSideRowModelSteps.EVERYTHING });
    const animate = !this.gos.get("suppressAnimationFrame");
    const refreshEverythingAfterColsChangedFunc = this.refreshModel.bind(this, {
      step: import_core2.ClientSideRowModelSteps.EVERYTHING,
      // after cols change, row grouping (the first stage) could of changed
      afterColumnsChanged: true,
      keepRenderedRows: true,
      // we want animations cos sorting or filtering could be applied
      animate
    });
    this.addManagedEventListeners({
      newColumnsLoaded: refreshEverythingAfterColsChangedFunc,
      columnRowGroupChanged: refreshEverythingFunc,
      columnValueChanged: this.onValueChanged.bind(this),
      columnPivotChanged: this.refreshModel.bind(this, { step: import_core2.ClientSideRowModelSteps.PIVOT }),
      filterChanged: this.onFilterChanged.bind(this),
      sortChanged: this.onSortChanged.bind(this),
      columnPivotModeChanged: refreshEverythingFunc,
      gridStylesChanged: this.onGridStylesChanges.bind(this),
      gridReady: this.onGridReady.bind(this)
    });
    this.addPropertyListeners();
    this.rootNode = new import_core2.RowNode(this.beans);
    this.nodeManager = new ClientSideNodeManager(
      this.rootNode,
      this.gos,
      this.eventService,
      this.funcColsService,
      this.selectionService,
      this.beans
    );
  }
  addPropertyListeners() {
    const resetProps = /* @__PURE__ */ new Set(["treeData", "masterDetail"]);
    const groupStageRefreshProps = /* @__PURE__ */ new Set([
      "groupDefaultExpanded",
      "groupAllowUnbalanced",
      "initialGroupOrderComparator",
      "groupHideOpenParents",
      "groupDisplayType"
    ]);
    const filterStageRefreshProps = /* @__PURE__ */ new Set(["excludeChildrenWhenTreeDataFiltering"]);
    const pivotStageRefreshProps = /* @__PURE__ */ new Set([
      "removePivotHeaderRowWhenSingleValueColumn",
      "pivotRowTotals",
      "pivotColumnGroupTotals",
      "suppressExpandablePivotGroups"
    ]);
    const aggregateStageRefreshProps = /* @__PURE__ */ new Set([
      "getGroupRowAgg",
      "alwaysAggregateAtRootLevel",
      "groupIncludeTotalFooter",
      "suppressAggFilteredOnly",
      "grandTotalRow"
    ]);
    const sortStageRefreshProps = /* @__PURE__ */ new Set([
      "postSortRows",
      "groupDisplayType",
      "accentedSort"
    ]);
    const filterAggStageRefreshProps = /* @__PURE__ */ new Set([]);
    const flattenStageRefreshProps = /* @__PURE__ */ new Set([
      "groupRemoveSingleChildren",
      "groupRemoveLowestSingleChildren",
      "groupIncludeFooter",
      "groupTotalRow"
    ]);
    const allProps = [
      ...resetProps,
      ...groupStageRefreshProps,
      ...filterStageRefreshProps,
      ...pivotStageRefreshProps,
      ...pivotStageRefreshProps,
      ...aggregateStageRefreshProps,
      ...sortStageRefreshProps,
      ...filterAggStageRefreshProps,
      ...flattenStageRefreshProps
    ];
    this.addManagedPropertyListeners(allProps, (params) => {
      const properties = params.changeSet?.properties;
      if (!properties) {
        return;
      }
      const arePropertiesImpacted = (propSet) => properties.some((prop) => propSet.has(prop));
      if (arePropertiesImpacted(resetProps)) {
        this.setRowData(this.rootNode.allLeafChildren.map((child) => child.data));
        return;
      }
      if (arePropertiesImpacted(groupStageRefreshProps)) {
        this.refreshModel({ step: import_core2.ClientSideRowModelSteps.EVERYTHING });
        return;
      }
      if (arePropertiesImpacted(filterStageRefreshProps)) {
        this.refreshModel({ step: import_core2.ClientSideRowModelSteps.FILTER });
        return;
      }
      if (arePropertiesImpacted(pivotStageRefreshProps)) {
        this.refreshModel({ step: import_core2.ClientSideRowModelSteps.PIVOT });
        return;
      }
      if (arePropertiesImpacted(aggregateStageRefreshProps)) {
        this.refreshModel({ step: import_core2.ClientSideRowModelSteps.AGGREGATE });
        return;
      }
      if (arePropertiesImpacted(sortStageRefreshProps)) {
        this.refreshModel({ step: import_core2.ClientSideRowModelSteps.SORT });
        return;
      }
      if (arePropertiesImpacted(filterAggStageRefreshProps)) {
        this.refreshModel({ step: import_core2.ClientSideRowModelSteps.FILTER_AGGREGATES });
        return;
      }
      if (arePropertiesImpacted(flattenStageRefreshProps)) {
        this.refreshModel({ step: import_core2.ClientSideRowModelSteps.MAP });
      }
    });
    this.addManagedPropertyListener("rowHeight", () => this.resetRowHeights());
  }
  start() {
    this.hasStarted = true;
    if (this.shouldSkipSettingDataOnStart) {
      this.dispatchUpdateEventsAndRefresh();
    } else {
      this.setInitialData();
    }
  }
  setInitialData() {
    const rowData = this.gos.get("rowData");
    if (rowData) {
      this.shouldSkipSettingDataOnStart = true;
      this.setRowData(rowData);
    }
  }
  ensureRowHeightsValid(startPixel, endPixel, startLimitIndex, endLimitIndex) {
    let atLeastOneChange;
    let res = false;
    do {
      atLeastOneChange = false;
      const rowAtStartPixel = this.getRowIndexAtPixel(startPixel);
      const rowAtEndPixel = this.getRowIndexAtPixel(endPixel);
      const firstRow = Math.max(rowAtStartPixel, startLimitIndex);
      const lastRow = Math.min(rowAtEndPixel, endLimitIndex);
      for (let rowIndex = firstRow; rowIndex <= lastRow; rowIndex++) {
        const rowNode = this.getRow(rowIndex);
        if (rowNode.rowHeightEstimated) {
          const rowHeight = this.gos.getRowHeightForNode(rowNode);
          rowNode.setRowHeight(rowHeight.height);
          atLeastOneChange = true;
          res = true;
        }
      }
      if (atLeastOneChange) {
        this.setRowTopAndRowIndex();
      }
    } while (atLeastOneChange);
    return res;
  }
  setRowTopAndRowIndex() {
    const defaultRowHeight = this.environment.getDefaultRowHeight();
    let nextRowTop = 0;
    const displayedRowsMapped = /* @__PURE__ */ new Set();
    const allowEstimate = this.gos.isDomLayout("normal");
    for (let i = 0; i < this.rowsToDisplay.length; i++) {
      const rowNode = this.rowsToDisplay[i];
      if (rowNode.id != null) {
        displayedRowsMapped.add(rowNode.id);
      }
      if (rowNode.rowHeight == null) {
        const rowHeight = this.gos.getRowHeightForNode(rowNode, allowEstimate, defaultRowHeight);
        rowNode.setRowHeight(rowHeight.height, rowHeight.estimated);
      }
      rowNode.setRowTop(nextRowTop);
      rowNode.setRowIndex(i);
      nextRowTop += rowNode.rowHeight;
    }
    return displayedRowsMapped;
  }
  clearRowTopAndRowIndex(changedPath, displayedRowsMapped) {
    const changedPathActive = changedPath.isActive();
    const clearIfNotDisplayed = (rowNode) => {
      if (rowNode && rowNode.id != null && !displayedRowsMapped.has(rowNode.id)) {
        rowNode.clearRowTopAndRowIndex();
      }
    };
    const recurse = (rowNode) => {
      clearIfNotDisplayed(rowNode);
      clearIfNotDisplayed(rowNode.detailNode);
      clearIfNotDisplayed(rowNode.sibling);
      if (rowNode.hasChildren()) {
        if (rowNode.childrenAfterGroup) {
          const isRootNode = rowNode.level == -1;
          const skipChildren = changedPathActive && !isRootNode && !rowNode.expanded;
          if (!skipChildren) {
            rowNode.childrenAfterGroup.forEach(recurse);
          }
        }
      }
    };
    recurse(this.rootNode);
  }
  // returns false if row was moved, otherwise true
  ensureRowsAtPixel(rowNodes, pixel, increment = 0) {
    const indexAtPixelNow = this.getRowIndexAtPixel(pixel);
    const rowNodeAtPixelNow = this.getRow(indexAtPixelNow);
    const animate = !this.gos.get("suppressAnimationFrame");
    if (rowNodeAtPixelNow === rowNodes[0]) {
      return false;
    }
    rowNodes.forEach((rowNode) => {
      (0, import_core2._removeFromArray)(this.rootNode.allLeafChildren, rowNode);
    });
    rowNodes.forEach((rowNode, idx) => {
      (0, import_core2._insertIntoArray)(this.rootNode.allLeafChildren, rowNode, Math.max(indexAtPixelNow + increment, 0) + idx);
    });
    this.refreshModel({
      step: import_core2.ClientSideRowModelSteps.EVERYTHING,
      keepRenderedRows: true,
      keepEditingRows: true,
      animate
    });
    return true;
  }
  highlightRowAtPixel(rowNode, pixel) {
    const indexAtPixelNow = pixel != null ? this.getRowIndexAtPixel(pixel) : null;
    const rowNodeAtPixelNow = indexAtPixelNow != null ? this.getRow(indexAtPixelNow) : null;
    if (!rowNodeAtPixelNow || !rowNode || rowNodeAtPixelNow === rowNode || pixel == null) {
      if (this.lastHighlightedRow) {
        this.lastHighlightedRow.setHighlighted(null);
        this.lastHighlightedRow = null;
      }
      return;
    }
    const highlight = this.getHighlightPosition(pixel, rowNodeAtPixelNow);
    if (this.lastHighlightedRow && this.lastHighlightedRow !== rowNodeAtPixelNow) {
      this.lastHighlightedRow.setHighlighted(null);
      this.lastHighlightedRow = null;
    }
    rowNodeAtPixelNow.setHighlighted(highlight);
    this.lastHighlightedRow = rowNodeAtPixelNow;
  }
  getHighlightPosition(pixel, rowNode) {
    if (!rowNode) {
      const index = this.getRowIndexAtPixel(pixel);
      rowNode = this.getRow(index || 0);
      if (!rowNode) {
        return import_core2.RowHighlightPosition.Below;
      }
    }
    const { rowTop, rowHeight } = rowNode;
    return pixel - rowTop < rowHeight / 2 ? import_core2.RowHighlightPosition.Above : import_core2.RowHighlightPosition.Below;
  }
  getLastHighlightedRowNode() {
    return this.lastHighlightedRow;
  }
  isLastRowIndexKnown() {
    return true;
  }
  getRowCount() {
    if (this.rowsToDisplay) {
      return this.rowsToDisplay.length;
    }
    return 0;
  }
  getTopLevelRowCount() {
    const showingRootNode = this.rowsToDisplay && this.rowsToDisplay[0] === this.rootNode;
    if (showingRootNode) {
      return 1;
    }
    const totalFooterInc = this.rootNode.sibling ? 1 : 0;
    const filteredChildren = this.rootNode.childrenAfterAggFilter;
    return (filteredChildren ? filteredChildren.length : 0) + totalFooterInc;
  }
  getTopLevelRowDisplayedIndex(topLevelIndex) {
    const showingRootNode = this.rowsToDisplay && this.rowsToDisplay[0] === this.rootNode;
    if (showingRootNode) {
      return topLevelIndex;
    }
    let adjustedIndex = topLevelIndex;
    if (this.rowsToDisplay[0].footer) {
      if (topLevelIndex === 0) {
        return 0;
      }
      adjustedIndex -= 1;
    }
    let rowNode = this.rootNode.childrenAfterSort[adjustedIndex];
    if (this.gos.get("groupHideOpenParents")) {
      while (rowNode.expanded && rowNode.childrenAfterSort && rowNode.childrenAfterSort.length > 0) {
        rowNode = rowNode.childrenAfterSort[0];
      }
    }
    return rowNode.rowIndex;
  }
  getRowBounds(index) {
    if ((0, import_core2._missing)(this.rowsToDisplay)) {
      return null;
    }
    const rowNode = this.rowsToDisplay[index];
    if (rowNode) {
      return {
        rowTop: rowNode.rowTop,
        rowHeight: rowNode.rowHeight
      };
    }
    return null;
  }
  onRowGroupOpened() {
    const animate = this.gos.isAnimateRows();
    this.refreshModel({ step: import_core2.ClientSideRowModelSteps.MAP, keepRenderedRows: true, animate });
  }
  onFilterChanged(event) {
    if (event.afterDataChange) {
      return;
    }
    const animate = this.gos.isAnimateRows();
    const primaryOrQuickFilterChanged = event.columns.length === 0 || event.columns.some((col) => col.isPrimary());
    const step = primaryOrQuickFilterChanged ? import_core2.ClientSideRowModelSteps.FILTER : import_core2.ClientSideRowModelSteps.FILTER_AGGREGATES;
    this.refreshModel({ step, keepRenderedRows: true, animate });
  }
  onSortChanged() {
    const animate = this.gos.isAnimateRows();
    this.refreshModel({
      step: import_core2.ClientSideRowModelSteps.SORT,
      keepRenderedRows: true,
      animate,
      keepEditingRows: true
    });
  }
  getType() {
    return "clientSide";
  }
  onValueChanged() {
    if (this.columnModel.isPivotActive()) {
      this.refreshModel({ step: import_core2.ClientSideRowModelSteps.PIVOT });
    } else {
      this.refreshModel({ step: import_core2.ClientSideRowModelSteps.AGGREGATE });
    }
  }
  createChangePath(rowNodeTransactions) {
    const noTransactions = (0, import_core2._missingOrEmpty)(rowNodeTransactions);
    const changedPath = new import_core2.ChangedPath(false, this.rootNode);
    if (noTransactions || this.gos.get("treeData")) {
      changedPath.setInactive();
    }
    return changedPath;
  }
  isSuppressModelUpdateAfterUpdateTransaction(params) {
    if (!this.gos.get("suppressModelUpdateAfterUpdateTransaction")) {
      return false;
    }
    if (params.rowNodeTransactions == null) {
      return false;
    }
    const transWithAddsOrDeletes = params.rowNodeTransactions.filter(
      (tx) => tx.add != null && tx.add.length > 0 || tx.remove != null && tx.remove.length > 0
    );
    const transactionsContainUpdatesOnly = transWithAddsOrDeletes == null || transWithAddsOrDeletes.length == 0;
    return transactionsContainUpdatesOnly;
  }
  buildRefreshModelParams(step) {
    let paramsStep = import_core2.ClientSideRowModelSteps.EVERYTHING;
    const stepsMapped = {
      everything: import_core2.ClientSideRowModelSteps.EVERYTHING,
      group: import_core2.ClientSideRowModelSteps.EVERYTHING,
      filter: import_core2.ClientSideRowModelSteps.FILTER,
      map: import_core2.ClientSideRowModelSteps.MAP,
      aggregate: import_core2.ClientSideRowModelSteps.AGGREGATE,
      sort: import_core2.ClientSideRowModelSteps.SORT,
      pivot: import_core2.ClientSideRowModelSteps.PIVOT
    };
    if ((0, import_core2._exists)(step)) {
      paramsStep = stepsMapped[step];
    }
    if ((0, import_core2._missing)(paramsStep)) {
      (0, import_core2._errorOnce)(`invalid step ${step}, available steps are ${Object.keys(stepsMapped).join(", ")}`);
      return void 0;
    }
    const animate = !this.gos.get("suppressAnimationFrame");
    const modelParams = {
      step: paramsStep,
      keepRenderedRows: true,
      keepEditingRows: true,
      animate
    };
    return modelParams;
  }
  refreshModel(paramsOrStep) {
    if (!this.hasStarted || this.isRefreshingModel || this.columnModel.isChangeEventsDispatching()) {
      return;
    }
    const params = typeof paramsOrStep === "object" && "step" in paramsOrStep ? paramsOrStep : this.buildRefreshModelParams(paramsOrStep);
    if (!params) {
      return;
    }
    if (this.isSuppressModelUpdateAfterUpdateTransaction(params)) {
      return;
    }
    const changedPath = this.createChangePath(params.rowNodeTransactions);
    this.isRefreshingModel = true;
    switch (params.step) {
      case import_core2.ClientSideRowModelSteps.EVERYTHING:
        this.doRowGrouping(
          params.rowNodeTransactions,
          params.rowNodeOrder,
          changedPath,
          !!params.afterColumnsChanged
        );
      case import_core2.ClientSideRowModelSteps.FILTER:
        this.doFilter(changedPath);
      case import_core2.ClientSideRowModelSteps.PIVOT:
        this.doPivot(changedPath);
      case import_core2.ClientSideRowModelSteps.AGGREGATE:
        this.doAggregate(changedPath);
      case import_core2.ClientSideRowModelSteps.FILTER_AGGREGATES:
        this.doFilterAggregates(changedPath);
      case import_core2.ClientSideRowModelSteps.SORT:
        this.doSort(params.rowNodeTransactions, changedPath);
      case import_core2.ClientSideRowModelSteps.MAP:
        this.doRowsToDisplay();
    }
    const displayedNodesMapped = this.setRowTopAndRowIndex();
    this.clearRowTopAndRowIndex(changedPath, displayedNodesMapped);
    this.isRefreshingModel = false;
    const event = {
      type: "modelUpdated",
      animate: params.animate,
      keepRenderedRows: params.keepRenderedRows,
      newData: params.newData,
      newPage: false,
      keepUndoRedoStack: params.keepUndoRedoStack
    };
    this.eventService.dispatchEvent(event);
  }
  isEmpty() {
    const rowsMissing = (0, import_core2._missing)(this.rootNode.allLeafChildren) || this.rootNode.allLeafChildren.length === 0;
    return (0, import_core2._missing)(this.rootNode) || rowsMissing || !this.columnModel.isReady();
  }
  isRowsToRender() {
    return (0, import_core2._exists)(this.rowsToDisplay) && this.rowsToDisplay.length > 0;
  }
  getNodesInRangeForSelection(firstInRange, lastInRange) {
    let started = false;
    let finished = false;
    const result = [];
    const groupsSelectChildren = this.gos.get("groupSelectsChildren");
    this.forEachNodeAfterFilterAndSort((rowNode) => {
      if (finished) {
        return;
      }
      if (started) {
        if (rowNode === lastInRange || rowNode === firstInRange) {
          finished = true;
          if (rowNode.group && groupsSelectChildren) {
            result.push(...rowNode.allLeafChildren);
            return;
          }
        }
      }
      if (!started) {
        if (rowNode !== lastInRange && rowNode !== firstInRange) {
          return;
        }
        started = true;
      }
      const includeThisNode = !rowNode.group || !groupsSelectChildren;
      if (includeThisNode) {
        result.push(rowNode);
        return;
      }
    });
    return result;
  }
  // eslint-disable-next-line
  setDatasource(datasource) {
    (0, import_core2._errorOnce)("should never call setDatasource on clientSideRowController");
  }
  getTopLevelNodes() {
    return this.rootNode ? this.rootNode.childrenAfterGroup : null;
  }
  getRootNode() {
    return this.rootNode;
  }
  getRow(index) {
    return this.rowsToDisplay[index];
  }
  isRowPresent(rowNode) {
    return this.rowsToDisplay.indexOf(rowNode) >= 0;
  }
  getRowIndexAtPixel(pixelToMatch) {
    if (this.isEmpty() || this.rowsToDisplay.length === 0) {
      return -1;
    }
    let bottomPointer = 0;
    let topPointer = this.rowsToDisplay.length - 1;
    if (pixelToMatch <= 0) {
      return 0;
    }
    const lastNode = (0, import_core2._last)(this.rowsToDisplay);
    if (lastNode.rowTop <= pixelToMatch) {
      return this.rowsToDisplay.length - 1;
    }
    let oldBottomPointer = -1;
    let oldTopPointer = -1;
    while (true) {
      const midPointer = Math.floor((bottomPointer + topPointer) / 2);
      const currentRowNode = this.rowsToDisplay[midPointer];
      if (this.isRowInPixel(currentRowNode, pixelToMatch)) {
        return midPointer;
      }
      if (currentRowNode.rowTop < pixelToMatch) {
        bottomPointer = midPointer + 1;
      } else if (currentRowNode.rowTop > pixelToMatch) {
        topPointer = midPointer - 1;
      }
      const caughtInInfiniteLoop = oldBottomPointer === bottomPointer && oldTopPointer === topPointer;
      if (caughtInInfiniteLoop) {
        return midPointer;
      }
      oldBottomPointer = bottomPointer;
      oldTopPointer = topPointer;
    }
  }
  isRowInPixel(rowNode, pixelToMatch) {
    const topPixel = rowNode.rowTop;
    const bottomPixel = rowNode.rowTop + rowNode.rowHeight;
    const pixelInRow = topPixel <= pixelToMatch && bottomPixel > pixelToMatch;
    return pixelInRow;
  }
  forEachLeafNode(callback) {
    if (this.rootNode.allLeafChildren) {
      this.rootNode.allLeafChildren.forEach((rowNode, index) => callback(rowNode, index));
    }
  }
  forEachNode(callback, includeFooterNodes = false) {
    this.recursivelyWalkNodesAndCallback({
      nodes: [...this.rootNode.childrenAfterGroup || []],
      callback,
      recursionType: 0 /* Normal */,
      index: 0,
      includeFooterNodes
    });
  }
  forEachNodeAfterFilter(callback, includeFooterNodes = false) {
    this.recursivelyWalkNodesAndCallback({
      nodes: [...this.rootNode.childrenAfterAggFilter || []],
      callback,
      recursionType: 1 /* AfterFilter */,
      index: 0,
      includeFooterNodes
    });
  }
  forEachNodeAfterFilterAndSort(callback, includeFooterNodes = false) {
    this.recursivelyWalkNodesAndCallback({
      nodes: [...this.rootNode.childrenAfterSort || []],
      callback,
      recursionType: 2 /* AfterFilterAndSort */,
      index: 0,
      includeFooterNodes
    });
  }
  forEachPivotNode(callback, includeFooterNodes = false) {
    this.recursivelyWalkNodesAndCallback({
      nodes: [this.rootNode],
      callback,
      recursionType: 3 /* PivotNodes */,
      index: 0,
      includeFooterNodes
    });
  }
  // iterates through each item in memory, and calls the callback function
  // nodes - the rowNodes to traverse
  // callback - the user provided callback
  // recursion type - need this to know what child nodes to recurse, eg if looking at all nodes, or filtered notes etc
  // index - works similar to the index in forEach in javascript's array function
  recursivelyWalkNodesAndCallback(params) {
    const { nodes, callback, recursionType, includeFooterNodes } = params;
    let { index } = params;
    const addFooters = (position) => {
      const parentNode = nodes[0]?.parent;
      if (!parentNode)
        return;
      const grandTotal = includeFooterNodes && this.gos.getGrandTotalRow();
      const isGroupIncludeFooter = this.gos.getGroupTotalRowCallback();
      const groupTotal = includeFooterNodes && isGroupIncludeFooter({ node: parentNode });
      const isRootNode = parentNode === this.rootNode;
      if (isRootNode) {
        if (grandTotal === position) {
          parentNode.createFooter();
          callback(parentNode.sibling, index++);
        }
        return;
      }
      if (groupTotal === position) {
        parentNode.createFooter();
        callback(parentNode.sibling, index++);
      }
    };
    addFooters("top");
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      callback(node, index++);
      if (node.hasChildren() && !node.footer) {
        let nodeChildren = null;
        switch (recursionType) {
          case 0 /* Normal */:
            nodeChildren = node.childrenAfterGroup;
            break;
          case 1 /* AfterFilter */:
            nodeChildren = node.childrenAfterAggFilter;
            break;
          case 2 /* AfterFilterAndSort */:
            nodeChildren = node.childrenAfterSort;
            break;
          case 3 /* PivotNodes */:
            nodeChildren = !node.leafGroup ? node.childrenAfterSort : null;
            break;
        }
        if (nodeChildren) {
          index = this.recursivelyWalkNodesAndCallback({
            nodes: [...nodeChildren],
            callback,
            recursionType,
            index,
            includeFooterNodes
          });
        }
      }
    }
    addFooters("bottom");
    return index;
  }
  // it's possible to recompute the aggregate without doing the other parts
  // + api.refreshClientSideRowModel('aggregate')
  doAggregate(changedPath) {
    this.aggregationStage?.execute({ rowNode: this.rootNode, changedPath });
  }
  doFilterAggregates(changedPath) {
    if (this.filterAggregatesStage) {
      this.filterAggregatesStage.execute({ rowNode: this.rootNode, changedPath });
    } else {
      this.rootNode.childrenAfterAggFilter = this.rootNode.childrenAfterFilter;
    }
  }
  // + gridApi.expandAll()
  // + gridApi.collapseAll()
  expandOrCollapseAll(expand) {
    const usingTreeData = this.gos.get("treeData");
    const usingPivotMode = this.columnModel.isPivotActive();
    const recursiveExpandOrCollapse = (rowNodes) => {
      if (!rowNodes) {
        return;
      }
      rowNodes.forEach((rowNode) => {
        const actionRow = () => {
          rowNode.expanded = expand;
          recursiveExpandOrCollapse(rowNode.childrenAfterGroup);
        };
        if (usingTreeData) {
          const hasChildren = (0, import_core2._exists)(rowNode.childrenAfterGroup);
          if (hasChildren) {
            actionRow();
          }
          return;
        }
        if (usingPivotMode) {
          const notLeafGroup = !rowNode.leafGroup;
          if (notLeafGroup) {
            actionRow();
          }
          return;
        }
        const isRowGroup = rowNode.group;
        if (isRowGroup) {
          actionRow();
        }
      });
    };
    if (this.rootNode) {
      recursiveExpandOrCollapse(this.rootNode.childrenAfterGroup);
    }
    this.refreshModel({ step: import_core2.ClientSideRowModelSteps.MAP });
    const eventSource = expand ? "expandAll" : "collapseAll";
    const event = {
      type: "expandOrCollapseAll",
      source: eventSource
    };
    this.eventService.dispatchEvent(event);
  }
  doSort(rowNodeTransactions, changedPath) {
    this.sortStage.execute({
      rowNode: this.rootNode,
      rowNodeTransactions,
      changedPath
    });
  }
  doRowGrouping(rowNodeTransactions, rowNodeOrder, changedPath, afterColumnsChanged) {
    if (this.groupStage) {
      if (rowNodeTransactions) {
        this.groupStage.execute({
          rowNode: this.rootNode,
          rowNodeTransactions,
          rowNodeOrder,
          changedPath
        });
      } else {
        this.groupStage.execute({
          rowNode: this.rootNode,
          changedPath,
          afterColumnsChanged
        });
      }
      if (this.gos.get("groupSelectsChildren")) {
        const selectionChanged = this.selectionService.updateGroupsFromChildrenSelections(
          "rowGroupChanged",
          changedPath
        );
        if (selectionChanged) {
          const event = {
            type: "selectionChanged",
            source: "rowGroupChanged"
          };
          this.eventService.dispatchEvent(event);
        }
      }
    } else {
      this.rootNode.childrenAfterGroup = this.rootNode.allLeafChildren;
      if (this.rootNode.sibling) {
        this.rootNode.sibling.childrenAfterGroup = this.rootNode.childrenAfterGroup;
      }
      this.rootNode.updateHasChildren();
    }
    if (this.nodeManager.isRowCountReady()) {
      this.rowCountReady = true;
      this.eventService.dispatchEventOnce({
        type: "rowCountReady"
      });
    }
  }
  doFilter(changedPath) {
    this.filterStage.execute({ rowNode: this.rootNode, changedPath });
  }
  doPivot(changedPath) {
    this.pivotStage?.execute({ rowNode: this.rootNode, changedPath });
  }
  getCopyOfNodesMap() {
    return this.nodeManager.getCopyOfNodesMap();
  }
  getRowNode(id) {
    const idIsGroup = typeof id == "string" && id.indexOf(import_core2.RowNode.ID_PREFIX_ROW_GROUP) == 0;
    if (idIsGroup) {
      let res = void 0;
      this.forEachNode((node) => {
        if (node.id === id) {
          res = node;
        }
      });
      return res;
    }
    return this.nodeManager.getRowNode(id);
  }
  // rows: the rows to put into the model
  setRowData(rowData) {
    this.selectionService.reset("rowDataChanged");
    this.nodeManager.setRowData(rowData);
    if (this.hasStarted) {
      this.dispatchUpdateEventsAndRefresh();
    }
  }
  dispatchUpdateEventsAndRefresh() {
    const rowDataUpdatedEvent = {
      type: "rowDataUpdated"
    };
    this.eventService.dispatchEvent(rowDataUpdatedEvent);
    this.refreshModel({
      step: import_core2.ClientSideRowModelSteps.EVERYTHING,
      newData: true
    });
  }
  batchUpdateRowData(rowDataTransaction, callback) {
    if (this.applyAsyncTransactionsTimeout == null) {
      this.rowDataTransactionBatch = [];
      const waitMillis = this.gos.getAsyncTransactionWaitMillis();
      this.applyAsyncTransactionsTimeout = window.setTimeout(() => {
        this.executeBatchUpdateRowData();
      }, waitMillis);
    }
    this.rowDataTransactionBatch.push({ rowDataTransaction, callback });
  }
  flushAsyncTransactions() {
    if (this.applyAsyncTransactionsTimeout != null) {
      clearTimeout(this.applyAsyncTransactionsTimeout);
      this.executeBatchUpdateRowData();
    }
  }
  executeBatchUpdateRowData() {
    this.valueCache.onDataChanged();
    const callbackFuncsBound = [];
    const rowNodeTrans = [];
    let forceRowNodeOrder = false;
    if (this.rowDataTransactionBatch) {
      this.rowDataTransactionBatch.forEach((tranItem) => {
        const rowNodeTran = this.nodeManager.updateRowData(tranItem.rowDataTransaction, void 0);
        rowNodeTrans.push(rowNodeTran);
        if (tranItem.callback) {
          callbackFuncsBound.push(tranItem.callback.bind(null, rowNodeTran));
        }
        if (typeof tranItem.rowDataTransaction.addIndex === "number") {
          forceRowNodeOrder = true;
        }
      });
    }
    this.commonUpdateRowData(rowNodeTrans, void 0, forceRowNodeOrder);
    if (callbackFuncsBound.length > 0) {
      window.setTimeout(() => {
        callbackFuncsBound.forEach((func) => func());
      }, 0);
    }
    if (rowNodeTrans.length > 0) {
      const event = {
        type: "asyncTransactionsFlushed",
        results: rowNodeTrans
      };
      this.eventService.dispatchEvent(event);
    }
    this.rowDataTransactionBatch = null;
    this.applyAsyncTransactionsTimeout = void 0;
  }
  updateRowData(rowDataTran, rowNodeOrder) {
    this.valueCache.onDataChanged();
    const rowNodeTran = this.nodeManager.updateRowData(rowDataTran, rowNodeOrder);
    const forceRowNodeOrder = typeof rowDataTran.addIndex === "number";
    this.commonUpdateRowData([rowNodeTran], rowNodeOrder, forceRowNodeOrder);
    return rowNodeTran;
  }
  createRowNodeOrder() {
    const suppressSortOrder = this.gos.get("suppressMaintainUnsortedOrder");
    if (suppressSortOrder) {
      return;
    }
    const orderMap = {};
    if (this.rootNode && this.rootNode.allLeafChildren) {
      for (let index = 0; index < this.rootNode.allLeafChildren.length; index++) {
        const node = this.rootNode.allLeafChildren[index];
        orderMap[node.id] = index;
      }
    }
    return orderMap;
  }
  // common to updateRowData and batchUpdateRowData
  commonUpdateRowData(rowNodeTrans, rowNodeOrder, forceRowNodeOrder) {
    if (!this.hasStarted) {
      return;
    }
    const animate = !this.gos.get("suppressAnimationFrame");
    if (forceRowNodeOrder) {
      rowNodeOrder = this.createRowNodeOrder();
    }
    const event = {
      type: "rowDataUpdated"
    };
    this.eventService.dispatchEvent(event);
    this.refreshModel({
      step: import_core2.ClientSideRowModelSteps.EVERYTHING,
      rowNodeTransactions: rowNodeTrans,
      rowNodeOrder,
      keepRenderedRows: true,
      keepEditingRows: true,
      animate
    });
  }
  doRowsToDisplay() {
    this.rowsToDisplay = this.flattenStage.execute({ rowNode: this.rootNode });
  }
  onRowHeightChanged() {
    this.refreshModel({
      step: import_core2.ClientSideRowModelSteps.MAP,
      keepRenderedRows: true,
      keepEditingRows: true,
      keepUndoRedoStack: true
    });
  }
  /** This method is debounced. It is used for row auto-height. If we don't debounce,
   * then the Row Models will end up recalculating each row position
   * for each row height change and result in the Row Renderer laying out rows.
   * This is particularly bad if using print layout, and showing eg 1,000 rows,
   * each row will change it's height, causing Row Model to update 1,000 times.
   */
  onRowHeightChangedDebounced() {
    this.onRowHeightChanged_debounced();
  }
  resetRowHeights() {
    const atLeastOne = this.resetRowHeightsForAllRowNodes();
    this.rootNode.setRowHeight(this.rootNode.rowHeight, true);
    if (this.rootNode.sibling) {
      this.rootNode.sibling.setRowHeight(this.rootNode.sibling.rowHeight, true);
    }
    if (atLeastOne) {
      this.onRowHeightChanged();
    }
  }
  resetRowHeightsForAllRowNodes() {
    let atLeastOne = false;
    this.forEachNode((rowNode) => {
      rowNode.setRowHeight(rowNode.rowHeight, true);
      const detailNode = rowNode.detailNode;
      if (detailNode) {
        detailNode.setRowHeight(detailNode.rowHeight, true);
      }
      if (rowNode.sibling) {
        rowNode.sibling.setRowHeight(rowNode.sibling.rowHeight, true);
      }
      atLeastOne = true;
    });
    return atLeastOne;
  }
  onGridStylesChanges(e) {
    if (e.rowHeightChanged) {
      if (this.columnModel.isAutoRowHeightActive()) {
        return;
      }
      this.resetRowHeights();
    }
  }
  onGridReady() {
    if (this.hasStarted) {
      return;
    }
    this.setInitialData();
  }
  isRowDataLoaded() {
    return this.rowCountReady;
  }
};

// community-modules/client-side-row-model/src/clientSideRowModel/clientSideRowModelApi.ts
var import_core3 = require("@ag-grid-community/core");
function onGroupExpandedOrCollapsed(beans) {
  beans.expansionService.onGroupExpandedOrCollapsed();
}
function refreshClientSideRowModel(beans, step) {
  beans.rowModelHelperService?.getClientSideRowModel()?.refreshModel(step);
}
function forEachLeafNode(beans, callback) {
  beans.rowModelHelperService?.getClientSideRowModel()?.forEachLeafNode(callback);
}
function forEachNodeAfterFilter(beans, callback) {
  beans.rowModelHelperService?.getClientSideRowModel()?.forEachNodeAfterFilter(callback);
}
function forEachNodeAfterFilterAndSort(beans, callback) {
  beans.rowModelHelperService?.getClientSideRowModel()?.forEachNodeAfterFilterAndSort(callback);
}
function resetRowHeights(beans) {
  if (beans.columnModel.isAutoRowHeightActive()) {
    (0, import_core3._warnOnce)("calling gridApi.resetRowHeights() makes no sense when using Auto Row Height.");
    return;
  }
  beans.rowModelHelperService?.getClientSideRowModel()?.resetRowHeights();
}
function applyTransaction(beans, rowDataTransaction) {
  return beans.frameworkOverrides.wrapIncoming(
    () => beans.rowModelHelperService?.getClientSideRowModel()?.updateRowData(rowDataTransaction)
  );
}
function applyTransactionAsync(beans, rowDataTransaction, callback) {
  beans.frameworkOverrides.wrapIncoming(
    () => beans.rowModelHelperService?.getClientSideRowModel()?.batchUpdateRowData(rowDataTransaction, callback)
  );
}
function flushAsyncTransactions(beans) {
  beans.frameworkOverrides.wrapIncoming(
    () => beans.rowModelHelperService?.getClientSideRowModel()?.flushAsyncTransactions()
  );
}
function getBestCostNodeSelection(beans) {
  return beans.selectionService.getBestCostNodeSelection();
}

// community-modules/client-side-row-model/src/clientSideRowModel/filterStage.ts
var import_core4 = require("@ag-grid-community/core");
var FilterStage = class extends import_core4.BeanStub {
  constructor() {
    super(...arguments);
    this.beanName = "filterStage";
  }
  wireBeans(beans) {
    this.filterManager = beans.filterManager;
  }
  execute(params) {
    const { changedPath } = params;
    this.filter(changedPath);
  }
  filter(changedPath) {
    const filterActive = !!this.filterManager?.isChildFilterPresent();
    this.filterNodes(filterActive, changedPath);
  }
  filterNodes(filterActive, changedPath) {
    const filterCallback = (rowNode, includeChildNodes) => {
      if (rowNode.hasChildren()) {
        if (filterActive && !includeChildNodes) {
          rowNode.childrenAfterFilter = rowNode.childrenAfterGroup.filter((childNode) => {
            const passBecauseChildren = childNode.childrenAfterFilter && childNode.childrenAfterFilter.length > 0;
            const passBecauseDataPasses = childNode.data && this.filterManager.doesRowPassFilter({ rowNode: childNode });
            return passBecauseChildren || passBecauseDataPasses;
          });
        } else {
          rowNode.childrenAfterFilter = rowNode.childrenAfterGroup;
        }
      } else {
        rowNode.childrenAfterFilter = rowNode.childrenAfterGroup;
      }
      if (rowNode.sibling) {
        rowNode.sibling.childrenAfterFilter = rowNode.childrenAfterFilter;
      }
    };
    if (this.doingTreeDataFiltering()) {
      const treeDataDepthFirstFilter = (rowNode, alreadyFoundInParent) => {
        if (rowNode.childrenAfterGroup) {
          for (let i = 0; i < rowNode.childrenAfterGroup.length; i++) {
            const childNode = rowNode.childrenAfterGroup[i];
            const foundInParent = alreadyFoundInParent || this.filterManager.doesRowPassFilter({ rowNode: childNode });
            if (childNode.childrenAfterGroup) {
              treeDataDepthFirstFilter(rowNode.childrenAfterGroup[i], foundInParent);
            } else {
              filterCallback(childNode, foundInParent);
            }
          }
        }
        filterCallback(rowNode, alreadyFoundInParent);
      };
      const treeDataFilterCallback = (rowNode) => treeDataDepthFirstFilter(rowNode, false);
      changedPath.executeFromRootNode(treeDataFilterCallback);
    } else {
      const defaultFilterCallback = (rowNode) => filterCallback(rowNode, false);
      changedPath.forEachChangedNodeDepthFirst(defaultFilterCallback, true);
    }
  }
  doingTreeDataFiltering() {
    return this.gos.get("treeData") && !this.gos.get("excludeChildrenWhenTreeDataFiltering");
  }
};

// community-modules/client-side-row-model/src/clientSideRowModel/flattenStage.ts
var import_core5 = require("@ag-grid-community/core");
var FlattenStage = class extends import_core5.BeanStub {
  constructor() {
    super(...arguments);
    this.beanName = "flattenStage";
  }
  wireBeans(beans) {
    this.beans = beans;
    this.columnModel = beans.columnModel;
  }
  execute(params) {
    const rootNode = params.rowNode;
    const result = [];
    const skipLeafNodes = this.columnModel.isPivotMode();
    const showRootNode = skipLeafNodes && rootNode.leafGroup;
    const topList = showRootNode ? [rootNode] : rootNode.childrenAfterSort;
    const details = this.getFlattenDetails();
    this.recursivelyAddToRowsToDisplay(details, topList, result, skipLeafNodes, 0);
    const atLeastOneRowPresent = result.length > 0;
    const includeGrandTotalRow = !showRootNode && // don't show total footer when showRootNode is true (i.e. in pivot mode and no groups)
    atLeastOneRowPresent && details.grandTotalRow;
    if (includeGrandTotalRow) {
      rootNode.createFooter();
      const addToTop = details.grandTotalRow === "top";
      this.addRowNodeToRowsToDisplay(details, rootNode.sibling, result, 0, addToTop);
    }
    return result;
  }
  getFlattenDetails() {
    const groupRemoveSingleChildren = this.gos.get("groupRemoveSingleChildren");
    const groupRemoveLowestSingleChildren = !groupRemoveSingleChildren && this.gos.get("groupRemoveLowestSingleChildren");
    return {
      groupRemoveLowestSingleChildren,
      groupRemoveSingleChildren,
      isGroupMultiAutoColumn: this.gos.isGroupMultiAutoColumn(),
      hideOpenParents: this.gos.get("groupHideOpenParents"),
      grandTotalRow: this.gos.getGrandTotalRow(),
      groupTotalRow: this.gos.getGroupTotalRowCallback()
    };
  }
  recursivelyAddToRowsToDisplay(details, rowsToFlatten, result, skipLeafNodes, uiLevel) {
    if ((0, import_core5._missingOrEmpty)(rowsToFlatten)) {
      return;
    }
    for (let i = 0; i < rowsToFlatten.length; i++) {
      const rowNode = rowsToFlatten[i];
      const isParent = rowNode.hasChildren();
      const isSkippedLeafNode = skipLeafNodes && !isParent;
      const isRemovedSingleChildrenGroup = details.groupRemoveSingleChildren && isParent && rowNode.childrenAfterGroup.length === 1;
      const isRemovedLowestSingleChildrenGroup = details.groupRemoveLowestSingleChildren && isParent && rowNode.leafGroup && rowNode.childrenAfterGroup.length === 1;
      const neverAllowToExpand = skipLeafNodes && rowNode.leafGroup;
      const isHiddenOpenParent = details.hideOpenParents && rowNode.expanded && !rowNode.master && !neverAllowToExpand;
      const thisRowShouldBeRendered = !isSkippedLeafNode && !isHiddenOpenParent && !isRemovedSingleChildrenGroup && !isRemovedLowestSingleChildrenGroup;
      if (thisRowShouldBeRendered) {
        this.addRowNodeToRowsToDisplay(details, rowNode, result, uiLevel);
      }
      if (skipLeafNodes && rowNode.leafGroup) {
        continue;
      }
      if (isParent) {
        const excludedParent = isRemovedSingleChildrenGroup || isRemovedLowestSingleChildrenGroup;
        if (rowNode.expanded || excludedParent) {
          const doesRowShowFooter = details.groupTotalRow({ node: rowNode });
          if (!doesRowShowFooter) {
            rowNode.destroyFooter();
          }
          const uiLevelForChildren = excludedParent ? uiLevel : uiLevel + 1;
          if (doesRowShowFooter === "top") {
            rowNode.createFooter();
            this.addRowNodeToRowsToDisplay(details, rowNode.sibling, result, uiLevelForChildren);
          }
          this.recursivelyAddToRowsToDisplay(
            details,
            rowNode.childrenAfterSort,
            result,
            skipLeafNodes,
            uiLevelForChildren
          );
          if (doesRowShowFooter === "bottom") {
            rowNode.createFooter();
            this.addRowNodeToRowsToDisplay(details, rowNode.sibling, result, uiLevelForChildren);
          }
        }
      } else if (rowNode.master && rowNode.expanded) {
        const detailNode = this.createDetailNode(rowNode);
        this.addRowNodeToRowsToDisplay(details, detailNode, result, uiLevel);
      }
    }
  }
  // duplicated method, it's also in floatingRowModel
  addRowNodeToRowsToDisplay(details, rowNode, result, uiLevel, addToTop) {
    if (addToTop) {
      result.unshift(rowNode);
    } else {
      result.push(rowNode);
    }
    rowNode.setUiLevel(details.isGroupMultiAutoColumn ? 0 : uiLevel);
  }
  createDetailNode(masterNode) {
    if ((0, import_core5._exists)(masterNode.detailNode)) {
      return masterNode.detailNode;
    }
    const detailNode = new import_core5.RowNode(this.beans);
    detailNode.detail = true;
    detailNode.selectable = false;
    detailNode.parent = masterNode;
    if ((0, import_core5._exists)(masterNode.id)) {
      detailNode.id = "detail_" + masterNode.id;
    }
    detailNode.data = masterNode.data;
    detailNode.level = masterNode.level + 1;
    masterNode.detailNode = detailNode;
    return detailNode;
  }
};

// community-modules/client-side-row-model/src/clientSideRowModel/immutableService.ts
var import_core6 = require("@ag-grid-community/core");
var ImmutableService = class extends import_core6.BeanStub {
  constructor() {
    super(...arguments);
    this.beanName = "immutableService";
  }
  wireBeans(beans) {
    this.rowModel = beans.rowModel;
    this.selectionService = beans.selectionService;
  }
  postConstruct() {
    if (this.rowModel.getType() === "clientSide") {
      this.clientSideRowModel = this.rowModel;
      this.addManagedPropertyListener("rowData", () => this.onRowDataUpdated());
    }
  }
  isActive() {
    const getRowIdProvided = this.gos.exists("getRowId");
    const resetRowDataOnUpdate = this.gos.get("resetRowDataOnUpdate");
    if (resetRowDataOnUpdate) {
      return false;
    }
    return getRowIdProvided;
  }
  setRowData(rowData) {
    const transactionAndMap = this.createTransactionForRowData(rowData);
    if (!transactionAndMap) {
      return;
    }
    const [transaction, orderIdMap] = transactionAndMap;
    this.clientSideRowModel.updateRowData(transaction, orderIdMap);
  }
  // converts the setRowData() command to a transaction
  createTransactionForRowData(rowData) {
    if ((0, import_core6._missing)(this.clientSideRowModel)) {
      (0, import_core6._errorOnce)("ImmutableService only works with ClientSideRowModel");
      return;
    }
    const getRowIdFunc = this.gos.getRowIdCallback();
    if (getRowIdFunc == null) {
      (0, import_core6._errorOnce)("ImmutableService requires getRowId() callback to be implemented, your row data needs IDs!");
      return;
    }
    const transaction = {
      remove: [],
      update: [],
      add: []
    };
    const existingNodesMap = this.clientSideRowModel.getCopyOfNodesMap();
    const suppressSortOrder = this.gos.get("suppressMaintainUnsortedOrder");
    const orderMap = suppressSortOrder ? void 0 : {};
    if ((0, import_core6._exists)(rowData)) {
      rowData.forEach((data, index) => {
        const id = getRowIdFunc({ data, level: 0 });
        const existingNode = existingNodesMap[id];
        if (orderMap) {
          orderMap[id] = index;
        }
        if (existingNode) {
          const dataHasChanged = existingNode.data !== data;
          if (dataHasChanged) {
            transaction.update.push(data);
          }
          existingNodesMap[id] = void 0;
        } else {
          transaction.add.push(data);
        }
      });
    }
    (0, import_core6._iterateObject)(existingNodesMap, (id, rowNode) => {
      if (rowNode) {
        transaction.remove.push(rowNode.data);
      }
    });
    return [transaction, orderMap];
  }
  onRowDataUpdated() {
    const rowData = this.gos.get("rowData");
    if (!rowData) {
      return;
    }
    if (this.isActive()) {
      this.setRowData(rowData);
    } else {
      this.selectionService.reset("rowDataChanged");
      this.clientSideRowModel.setRowData(rowData);
    }
  }
};

// community-modules/client-side-row-model/src/clientSideRowModel/sortService.ts
var import_core7 = require("@ag-grid-community/core");
var SortService = class extends import_core7.BeanStub {
  constructor() {
    super(...arguments);
    this.beanName = "sortService";
  }
  wireBeans(beans) {
    this.columnModel = beans.columnModel;
    this.funcColsService = beans.funcColsService;
    this.rowNodeSorter = beans.rowNodeSorter;
    this.showRowGroupColsService = beans.showRowGroupColsService;
  }
  sort(sortOptions, sortActive, useDeltaSort, rowNodeTransactions, changedPath, sortContainsGroupColumns) {
    const groupMaintainOrder = this.gos.get("groupMaintainOrder");
    const groupColumnsPresent = this.columnModel.getCols().some((c) => c.isRowGroupActive());
    let allDirtyNodes = {};
    if (useDeltaSort && rowNodeTransactions) {
      allDirtyNodes = this.calculateDirtyNodes(rowNodeTransactions);
    }
    const isPivotMode = this.columnModel.isPivotMode();
    const postSortFunc = this.gos.getCallback("postSortRows");
    const callback = (rowNode) => {
      this.pullDownGroupDataForHideOpenParents(rowNode.childrenAfterAggFilter, true);
      const skipSortingPivotLeafs = isPivotMode && rowNode.leafGroup;
      const skipSortingGroups = groupMaintainOrder && groupColumnsPresent && !rowNode.leafGroup && !sortContainsGroupColumns;
      if (skipSortingGroups) {
        const nextGroup = this.funcColsService.getRowGroupColumns()?.[rowNode.level + 1];
        const wasSortExplicitlyRemoved = nextGroup?.getSort() === null;
        const childrenToBeSorted = rowNode.childrenAfterAggFilter.slice(0);
        if (rowNode.childrenAfterSort && !wasSortExplicitlyRemoved) {
          const indexedOrders = {};
          rowNode.childrenAfterSort.forEach((node, idx) => {
            indexedOrders[node.id] = idx;
          });
          childrenToBeSorted.sort(
            (row1, row2) => (indexedOrders[row1.id] ?? 0) - (indexedOrders[row2.id] ?? 0)
          );
        }
        rowNode.childrenAfterSort = childrenToBeSorted;
      } else if (!sortActive || skipSortingPivotLeafs) {
        rowNode.childrenAfterSort = rowNode.childrenAfterAggFilter.slice(0);
      } else if (useDeltaSort) {
        rowNode.childrenAfterSort = this.doDeltaSort(rowNode, allDirtyNodes, changedPath, sortOptions);
      } else {
        rowNode.childrenAfterSort = this.rowNodeSorter.doFullSort(rowNode.childrenAfterAggFilter, sortOptions);
      }
      if (rowNode.sibling) {
        rowNode.sibling.childrenAfterSort = rowNode.childrenAfterSort;
      }
      this.updateChildIndexes(rowNode);
      if (postSortFunc) {
        const params = { nodes: rowNode.childrenAfterSort };
        postSortFunc(params);
      }
    };
    if (changedPath) {
      changedPath.forEachChangedNodeDepthFirst(callback);
    }
    this.updateGroupDataForHideOpenParents(changedPath);
  }
  calculateDirtyNodes(rowNodeTransactions) {
    const dirtyNodes = {};
    const addNodesFunc = (rowNodes) => {
      if (rowNodes) {
        rowNodes.forEach((rowNode) => dirtyNodes[rowNode.id] = true);
      }
    };
    if (rowNodeTransactions) {
      rowNodeTransactions.forEach((tran) => {
        addNodesFunc(tran.add);
        addNodesFunc(tran.update);
        addNodesFunc(tran.remove);
      });
    }
    return dirtyNodes;
  }
  doDeltaSort(rowNode, allTouchedNodes, changedPath, sortOptions) {
    const unsortedRows = rowNode.childrenAfterAggFilter;
    const oldSortedRows = rowNode.childrenAfterSort;
    if (!oldSortedRows) {
      return this.rowNodeSorter.doFullSort(unsortedRows, sortOptions);
    }
    const untouchedRowsMap = {};
    const touchedRows = [];
    unsortedRows.forEach((row) => {
      if (allTouchedNodes[row.id] || !changedPath.canSkip(row)) {
        touchedRows.push(row);
      } else {
        untouchedRowsMap[row.id] = true;
      }
    });
    const sortedUntouchedRows = oldSortedRows.filter((child) => untouchedRowsMap[child.id]);
    const mapNodeToSortedNode = (rowNode2, pos) => ({
      currentPos: pos,
      rowNode: rowNode2
    });
    const sortedChangedRows = touchedRows.map(mapNodeToSortedNode).sort((a, b) => this.rowNodeSorter.compareRowNodes(sortOptions, a, b));
    return this.mergeSortedArrays(sortOptions, sortedChangedRows, sortedUntouchedRows.map(mapNodeToSortedNode)).map(
      ({ rowNode: rowNode2 }) => rowNode2
    );
  }
  // Merge two sorted arrays into each other
  mergeSortedArrays(sortOptions, arr1, arr2) {
    const res = [];
    let i = 0;
    let j = 0;
    while (i < arr1.length && j < arr2.length) {
      const compareResult = this.rowNodeSorter.compareRowNodes(sortOptions, arr1[i], arr2[j]);
      if (compareResult < 0) {
        res.push(arr1[i++]);
      } else {
        res.push(arr2[j++]);
      }
    }
    while (i < arr1.length) {
      res.push(arr1[i++]);
    }
    while (j < arr2.length) {
      res.push(arr2[j++]);
    }
    return res;
  }
  updateChildIndexes(rowNode) {
    if ((0, import_core7._missing)(rowNode.childrenAfterSort)) {
      return;
    }
    const listToSort = rowNode.childrenAfterSort;
    for (let i = 0; i < listToSort.length; i++) {
      const child = listToSort[i];
      const firstChild = i === 0;
      const lastChild = i === rowNode.childrenAfterSort.length - 1;
      child.setFirstChild(firstChild);
      child.setLastChild(lastChild);
      child.setChildIndex(i);
    }
  }
  updateGroupDataForHideOpenParents(changedPath) {
    if (!this.gos.get("groupHideOpenParents")) {
      return;
    }
    if (this.gos.get("treeData")) {
      (0, import_core7._warnOnce)(
        `The property hideOpenParents dose not work with Tree Data. This is because Tree Data has values at the group level, it doesn't make sense to hide them.`
      );
      return false;
    }
    const callback = (rowNode) => {
      this.pullDownGroupDataForHideOpenParents(rowNode.childrenAfterSort, false);
      rowNode.childrenAfterSort.forEach((child) => {
        if (child.hasChildren()) {
          callback(child);
        }
      });
    };
    if (changedPath) {
      changedPath.executeFromRootNode((rowNode) => callback(rowNode));
    }
  }
  pullDownGroupDataForHideOpenParents(rowNodes, clearOperation) {
    if (!this.gos.get("groupHideOpenParents") || (0, import_core7._missing)(rowNodes)) {
      return;
    }
    rowNodes.forEach((childRowNode) => {
      const groupDisplayCols = this.showRowGroupColsService?.getShowRowGroupCols() ?? [];
      groupDisplayCols.forEach((groupDisplayCol) => {
        const showRowGroup = groupDisplayCol.getColDef().showRowGroup;
        if (typeof showRowGroup !== "string") {
          (0, import_core7._errorOnce)(
            "groupHideOpenParents only works when specifying specific columns for colDef.showRowGroup"
          );
          return;
        }
        const displayingGroupKey = showRowGroup;
        const rowGroupColumn = this.columnModel.getColDefCol(displayingGroupKey);
        const thisRowNodeMatches = rowGroupColumn === childRowNode.rowGroupColumn;
        if (thisRowNodeMatches) {
          return;
        }
        if (clearOperation) {
          childRowNode.setGroupValue(groupDisplayCol.getId(), void 0);
        } else {
          const parentToStealFrom = childRowNode.getFirstChildOfFirstChild(rowGroupColumn);
          if (parentToStealFrom) {
            childRowNode.setGroupValue(groupDisplayCol.getId(), parentToStealFrom.key);
          }
        }
      });
    });
  }
};

// community-modules/client-side-row-model/src/clientSideRowModel/sortStage.ts
var import_core8 = require("@ag-grid-community/core");
var SortStage = class extends import_core8.BeanStub {
  constructor() {
    super(...arguments);
    this.beanName = "sortStage";
  }
  wireBeans(beans) {
    this.sortService = beans.sortService;
    this.sortController = beans.sortController;
  }
  execute(params) {
    const sortOptions = this.sortController.getSortOptions();
    const sortActive = (0, import_core8._exists)(sortOptions) && sortOptions.length > 0;
    const deltaSort = sortActive && (0, import_core8._exists)(params.rowNodeTransactions) && // in time we can remove this check, so that delta sort is always
    // on if transactions are present. it's off for now so that we can
    // selectively turn it on and test it with some select users before
    // rolling out to everyone.
    this.gos.get("deltaSort");
    const sortContainsGroupColumns = sortOptions.some((opt) => {
      const isSortingCoupled = this.gos.isColumnsSortingCoupledToGroup();
      if (isSortingCoupled) {
        return opt.column.isPrimary() && opt.column.isRowGroupActive();
      }
      return !!opt.column.getColDef().showRowGroup;
    });
    this.sortService.sort(
      sortOptions,
      sortActive,
      deltaSort,
      params.rowNodeTransactions,
      params.changedPath,
      sortContainsGroupColumns
    );
  }
};

// community-modules/client-side-row-model/src/version.ts
var VERSION = "32.0.0";

// community-modules/client-side-row-model/src/clientSideRowModelModule.ts
var ClientSideRowModelCoreModule = {
  version: VERSION,
  moduleName: `${import_core9.ModuleNames.ClientSideRowModelModule}-core`,
  rowModel: "clientSide",
  beans: [ClientSideRowModel, FilterStage, SortStage, FlattenStage, SortService, ImmutableService]
};
var ClientSideRowModelApiModule = {
  version: VERSION,
  moduleName: `${import_core9.ModuleNames.ClientSideRowModelModule}-api`,
  beans: [import_core9.RowModelHelperService],
  apiFunctions: {
    onGroupExpandedOrCollapsed,
    refreshClientSideRowModel,
    forEachLeafNode,
    forEachNodeAfterFilter,
    forEachNodeAfterFilterAndSort,
    resetRowHeights,
    applyTransaction,
    applyTransactionAsync,
    flushAsyncTransactions,
    getBestCostNodeSelection
  },
  dependantModules: [ClientSideRowModelCoreModule, import_core9._CsrmSsrmSharedApiModule]
};
var ClientSideRowModelModule = {
  version: VERSION,
  moduleName: import_core9.ModuleNames.ClientSideRowModelModule,
  dependantModules: [ClientSideRowModelCoreModule, ClientSideRowModelApiModule]
};
