var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp(target, key, result);
  return result;
};

// enterprise-modules/clipboard/src/clipboardModule.ts
import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { CsvExportModule } from "@ag-grid-community/csv-export";

// enterprise-modules/clipboard/src/clipboard/clipboardService.ts
import {
  _,
  Autowired,
  Bean,
  BeanStub,
  ChangedPath,
  Events,
  PostConstruct,
  Optional
} from "@ag-grid-community/core";
var SOURCE_PASTE = "paste";
var EXPORT_TYPE_DRAG_COPY = "dragCopy";
var EXPORT_TYPE_CLIPBOARD = "clipboard";
var apiError = (method) => `AG Grid: Unable to use the Clipboard API (navigator.clipboard.${method}()). The reason why it could not be used has been logged in the previous line. For this reason the grid has defaulted to using a workaround which doesn't perform as well. Either fix why Clipboard API is blocked, OR stop this message from appearing by setting grid property suppressClipboardApi=true (which will default the grid to using the workaround rather than the API.`;
var ClipboardService = class extends BeanStub {
  constructor() {
    super(...arguments);
    this.lastPasteOperationTime = 0;
    this.navigatorApiFailed = false;
  }
  init() {
    this.logger = this.loggerFactory.create("ClipboardService");
    if (this.rowModel.getType() === "clientSide") {
      this.clientSideRowModel = this.rowModel;
    }
    this.ctrlsService.whenReady((p) => {
      this.gridCtrl = p.gridCtrl;
    });
  }
  pasteFromClipboard() {
    this.logger.log("pasteFromClipboard");
    const allowNavigator = !this.gridOptionsService.get("suppressClipboardApi");
    if (allowNavigator && !this.navigatorApiFailed && navigator.clipboard && navigator.clipboard.readText) {
      navigator.clipboard.readText().then(this.processClipboardData.bind(this)).catch((e) => {
        _.doOnce(() => {
          console.warn(e);
          console.warn(apiError("readText"));
        }, "clipboardApiError");
        this.navigatorApiFailed = true;
        this.pasteFromClipboardLegacy();
      });
    } else {
      this.pasteFromClipboardLegacy();
    }
  }
  pasteFromClipboardLegacy() {
    let defaultPrevented = false;
    const handlePasteEvent = (e) => {
      const currentPastOperationTime = (/* @__PURE__ */ new Date()).getTime();
      if (currentPastOperationTime - this.lastPasteOperationTime < 50) {
        defaultPrevented = true;
        e.preventDefault();
      }
      this.lastPasteOperationTime = currentPastOperationTime;
    };
    this.executeOnTempElement(
      (textArea) => {
        textArea.addEventListener("paste", handlePasteEvent);
        textArea.focus({ preventScroll: true });
      },
      (element) => {
        const data = element.value;
        if (!defaultPrevented) {
          this.processClipboardData(data);
        } else {
          this.refocusLastFocusedCell();
        }
        element.removeEventListener("paste", handlePasteEvent);
      }
    );
  }
  refocusLastFocusedCell() {
    const focusedCell = this.focusService.getFocusedCell();
    if (focusedCell) {
      this.focusService.setFocusedCell({
        rowIndex: focusedCell.rowIndex,
        column: focusedCell.column,
        rowPinned: focusedCell.rowPinned,
        forceBrowserFocus: true
      });
    }
  }
  getClipboardDelimiter() {
    const delimiter = this.gridOptionsService.get("clipboardDelimiter");
    return _.exists(delimiter) ? delimiter : "	";
  }
  processClipboardData(data) {
    if (data == null) {
      return;
    }
    let parsedData = ClipboardService.stringToArray(data, this.getClipboardDelimiter());
    const userFunc = this.gridOptionsService.getCallback("processDataFromClipboard");
    if (userFunc) {
      parsedData = userFunc({ data: parsedData });
    }
    if (parsedData == null) {
      return;
    }
    if (this.gridOptionsService.get("suppressLastEmptyLineOnPaste")) {
      this.removeLastLineIfBlank(parsedData);
    }
    const pasteOperation = (cellsToFlash, updatedRowNodes, focusedCell, changedPath) => {
      const rangeActive = this.rangeService && this.rangeService.isMoreThanOneCell();
      const pasteIntoRange = rangeActive && !this.hasOnlyOneValueToPaste(parsedData);
      if (pasteIntoRange) {
        this.pasteIntoActiveRange(parsedData, cellsToFlash, updatedRowNodes, changedPath);
      } else {
        this.pasteStartingFromFocusedCell(parsedData, cellsToFlash, updatedRowNodes, focusedCell, changedPath);
      }
    };
    this.doPasteOperation(pasteOperation);
  }
  // This will parse a delimited string into an array of arrays.
  static stringToArray(strData, delimiter = ",") {
    const data = [];
    const isNewline = (char) => char === "\r" || char === "\n";
    let insideQuotedField = false;
    if (strData === "") {
      return [[""]];
    }
    for (let row = 0, column = 0, position = 0; position < strData.length; position++) {
      const previousChar = strData[position - 1];
      const currentChar = strData[position];
      const nextChar = strData[position + 1];
      const ensureDataExists = () => {
        if (!data[row]) {
          data[row] = [];
        }
        if (!data[row][column]) {
          data[row][column] = "";
        }
      };
      ensureDataExists();
      if (currentChar === '"') {
        if (insideQuotedField) {
          if (nextChar === '"') {
            data[row][column] += '"';
            position++;
          } else {
            insideQuotedField = false;
          }
        } else if (previousChar === void 0 || previousChar === delimiter || isNewline(previousChar)) {
          insideQuotedField = true;
        }
      }
      if (!insideQuotedField && currentChar !== '"') {
        if (currentChar === delimiter) {
          column++;
          ensureDataExists();
          continue;
        } else if (isNewline(currentChar)) {
          column = 0;
          row++;
          ensureDataExists();
          if (currentChar === "\r" && nextChar === "\n") {
            position++;
          }
          continue;
        }
      }
      data[row][column] += currentChar;
    }
    return data;
  }
  // common code to paste operations, e.g. paste to cell, paste to range, and copy range down
  doPasteOperation(pasteOperationFunc) {
    const source = "clipboard";
    this.eventService.dispatchEvent({
      type: Events.EVENT_PASTE_START,
      source
    });
    let changedPath;
    if (this.clientSideRowModel) {
      const onlyChangedColumns = this.gridOptionsService.get("aggregateOnlyChangedColumns");
      changedPath = new ChangedPath(onlyChangedColumns, this.clientSideRowModel.getRootNode());
    }
    const cellsToFlash = {};
    const updatedRowNodes = [];
    const focusedCell = this.focusService.getFocusedCell();
    pasteOperationFunc(cellsToFlash, updatedRowNodes, focusedCell, changedPath);
    const nodesToRefresh = [...updatedRowNodes];
    if (changedPath) {
      this.clientSideRowModel.doAggregate(changedPath);
      changedPath.forEachChangedNodeDepthFirst((rowNode) => {
        nodesToRefresh.push(rowNode);
      });
    }
    this.rowRenderer.refreshCells({ rowNodes: nodesToRefresh });
    this.dispatchFlashCells(cellsToFlash);
    this.fireRowChanged(updatedRowNodes);
    this.refocusLastFocusedCell();
    const event = {
      type: Events.EVENT_PASTE_END,
      source
    };
    this.eventService.dispatchEvent(event);
  }
  pasteIntoActiveRange(clipboardData, cellsToFlash, updatedRowNodes, changedPath) {
    const abortRepeatingPasteIntoRows = this.getRangeSize() % clipboardData.length != 0;
    let indexOffset = 0;
    let dataRowIndex = 0;
    const rowCallback = (currentRow, rowNode, columns, index) => {
      const atEndOfClipboardData = index - indexOffset >= clipboardData.length;
      if (atEndOfClipboardData) {
        if (abortRepeatingPasteIntoRows) {
          return;
        }
        indexOffset += dataRowIndex;
        dataRowIndex = 0;
      }
      const currentRowData = clipboardData[index - indexOffset];
      updatedRowNodes.push(rowNode);
      const processCellFromClipboardFunc = this.gridOptionsService.getCallback("processCellFromClipboard");
      columns.forEach((column, idx) => {
        if (!column.isCellEditable(rowNode) || column.isSuppressPaste(rowNode)) {
          return;
        }
        if (idx >= currentRowData.length) {
          idx = idx % currentRowData.length;
        }
        const newValue = this.processCell(
          rowNode,
          column,
          currentRowData[idx],
          EXPORT_TYPE_DRAG_COPY,
          processCellFromClipboardFunc,
          true
        );
        rowNode.setDataValue(column, newValue, SOURCE_PASTE);
        if (changedPath) {
          changedPath.addParentNode(rowNode.parent, [column]);
        }
        const { rowIndex, rowPinned } = currentRow;
        const cellId = this.cellPositionUtils.createIdFromValues({ rowIndex, column, rowPinned });
        cellsToFlash[cellId] = true;
      });
      dataRowIndex++;
    };
    this.iterateActiveRanges(false, rowCallback);
  }
  pasteStartingFromFocusedCell(parsedData, cellsToFlash, updatedRowNodes, focusedCell, changedPath) {
    if (!focusedCell) {
      return;
    }
    const currentRow = { rowIndex: focusedCell.rowIndex, rowPinned: focusedCell.rowPinned };
    const columnsToPasteInto = this.columnModel.getDisplayedColumnsStartingAt(focusedCell.column);
    if (this.isPasteSingleValueIntoRange(parsedData)) {
      this.pasteSingleValueIntoRange(parsedData, updatedRowNodes, cellsToFlash, changedPath);
    } else {
      this.pasteMultipleValues(
        parsedData,
        currentRow,
        updatedRowNodes,
        columnsToPasteInto,
        cellsToFlash,
        EXPORT_TYPE_CLIPBOARD,
        changedPath
      );
    }
  }
  // if range is active, and only one cell, then we paste this cell into all cells in the active range.
  isPasteSingleValueIntoRange(parsedData) {
    return this.hasOnlyOneValueToPaste(parsedData) && this.rangeService != null && !this.rangeService.isEmpty();
  }
  pasteSingleValueIntoRange(parsedData, updatedRowNodes, cellsToFlash, changedPath) {
    const value = parsedData[0][0];
    const rowCallback = (currentRow, rowNode, columns) => {
      updatedRowNodes.push(rowNode);
      columns.forEach((column) => this.updateCellValue(rowNode, column, value, cellsToFlash, EXPORT_TYPE_CLIPBOARD, changedPath));
    };
    this.iterateActiveRanges(false, rowCallback);
  }
  hasOnlyOneValueToPaste(parsedData) {
    return parsedData.length === 1 && parsedData[0].length === 1;
  }
  copyRangeDown() {
    if (!this.rangeService || this.rangeService.isEmpty()) {
      return;
    }
    const firstRowValues = [];
    const pasteOperation = (cellsToFlash, updatedRowNodes, focusedCell, changedPath) => {
      const processCellForClipboardFunc = this.gridOptionsService.getCallback("processCellForClipboard");
      const processCellFromClipboardFunc = this.gridOptionsService.getCallback("processCellFromClipboard");
      const rowCallback = (currentRow, rowNode, columns) => {
        if (!firstRowValues.length) {
          columns.forEach((column) => {
            const value = this.processCell(
              rowNode,
              column,
              this.valueService.getValue(column, rowNode),
              EXPORT_TYPE_DRAG_COPY,
              processCellForClipboardFunc,
              false,
              true
            );
            firstRowValues.push(value);
          });
        } else {
          updatedRowNodes.push(rowNode);
          columns.forEach((column, index) => {
            if (!column.isCellEditable(rowNode) || column.isSuppressPaste(rowNode)) {
              return;
            }
            const firstRowValue = this.processCell(
              rowNode,
              column,
              firstRowValues[index],
              EXPORT_TYPE_DRAG_COPY,
              processCellFromClipboardFunc,
              true
            );
            rowNode.setDataValue(column, firstRowValue, SOURCE_PASTE);
            if (changedPath) {
              changedPath.addParentNode(rowNode.parent, [column]);
            }
            const { rowIndex, rowPinned } = currentRow;
            const cellId = this.cellPositionUtils.createIdFromValues({ rowIndex, column, rowPinned });
            cellsToFlash[cellId] = true;
          });
        }
      };
      this.iterateActiveRanges(true, rowCallback);
    };
    this.doPasteOperation(pasteOperation);
  }
  removeLastLineIfBlank(parsedData) {
    const lastLine = _.last(parsedData);
    const lastLineIsBlank = lastLine && lastLine.length === 1 && lastLine[0] === "";
    if (lastLineIsBlank) {
      if (parsedData.length === 1) {
        return;
      }
      _.removeFromArray(parsedData, lastLine);
    }
  }
  fireRowChanged(rowNodes) {
    if (this.gridOptionsService.get("editType") !== "fullRow") {
      return;
    }
    rowNodes.forEach((rowNode) => {
      const event = {
        type: Events.EVENT_ROW_VALUE_CHANGED,
        node: rowNode,
        data: rowNode.data,
        rowIndex: rowNode.rowIndex,
        rowPinned: rowNode.rowPinned
      };
      this.eventService.dispatchEvent(event);
    });
  }
  pasteMultipleValues(clipboardGridData, currentRow, updatedRowNodes, columnsToPasteInto, cellsToFlash, type, changedPath) {
    let rowPointer = currentRow;
    const skipGroupRows = this.clientSideRowModel != null && !this.gridOptionsService.get("enableGroupEdit") && !this.gridOptionsService.get("treeData");
    const getNextGoodRowNode = () => {
      while (true) {
        if (!rowPointer) {
          return null;
        }
        const res = this.rowPositionUtils.getRowNode(rowPointer);
        rowPointer = this.cellNavigationService.getRowBelow({ rowPinned: rowPointer.rowPinned, rowIndex: rowPointer.rowIndex });
        if (res == null) {
          return null;
        }
        const skipRow = res.detail || res.footer || skipGroupRows && res.group;
        if (!skipRow) {
          return res;
        }
      }
    };
    clipboardGridData.forEach((clipboardRowData) => {
      const rowNode = getNextGoodRowNode();
      if (!rowNode) {
        return;
      }
      clipboardRowData.forEach((value, index) => this.updateCellValue(rowNode, columnsToPasteInto[index], value, cellsToFlash, type, changedPath));
      updatedRowNodes.push(rowNode);
    });
  }
  updateCellValue(rowNode, column, value, cellsToFlash, type, changedPath) {
    if (!rowNode || !column || !column.isCellEditable(rowNode) || column.isSuppressPaste(rowNode)) {
      return;
    }
    if (rowNode.group && column.isValueActive()) {
      return;
    }
    const processedValue = this.processCell(rowNode, column, value, type, this.gridOptionsService.getCallback("processCellFromClipboard"), true);
    rowNode.setDataValue(column, processedValue, SOURCE_PASTE);
    const { rowIndex, rowPinned } = rowNode;
    const cellId = this.cellPositionUtils.createIdFromValues({ rowIndex, column, rowPinned });
    cellsToFlash[cellId] = true;
    if (changedPath) {
      changedPath.addParentNode(rowNode.parent, [column]);
    }
  }
  copyToClipboard(params = {}) {
    this.copyOrCutToClipboard(params);
  }
  cutToClipboard(params = {}, source = "api") {
    if (this.gridOptionsService.get("suppressCutToClipboard")) {
      return;
    }
    const startEvent = {
      type: Events.EVENT_CUT_START,
      source
    };
    this.eventService.dispatchEvent(startEvent);
    this.copyOrCutToClipboard(params, true);
    const endEvent = {
      type: Events.EVENT_CUT_END,
      source
    };
    this.eventService.dispatchEvent(endEvent);
  }
  copyOrCutToClipboard(params, cut) {
    let { includeHeaders, includeGroupHeaders } = params;
    this.logger.log(`copyToClipboard: includeHeaders = ${includeHeaders}`);
    if (includeHeaders == null) {
      includeHeaders = this.gridOptionsService.get("copyHeadersToClipboard");
    }
    if (includeGroupHeaders == null) {
      includeGroupHeaders = this.gridOptionsService.get("copyGroupHeadersToClipboard");
    }
    const copyParams = { includeHeaders, includeGroupHeaders };
    const shouldCopyRows = !this.gridOptionsService.get("suppressCopyRowsToClipboard");
    let cellClearType = null;
    if (this.rangeService && !this.rangeService.isEmpty() && !this.shouldSkipSingleCellRange()) {
      this.copySelectedRangeToClipboard(copyParams);
      cellClearType = 0 /* CellRange */;
    } else if (shouldCopyRows && !this.selectionService.isEmpty()) {
      this.copySelectedRowsToClipboard(copyParams);
      cellClearType = 1 /* SelectedRows */;
    } else if (this.focusService.isAnyCellFocused()) {
      this.copyFocusedCellToClipboard(copyParams);
      cellClearType = 2 /* FocusedCell */;
    }
    if (cut && cellClearType !== null) {
      this.clearCellsAfterCopy(cellClearType);
    }
  }
  clearCellsAfterCopy(type) {
    this.eventService.dispatchEvent({ type: Events.EVENT_KEY_SHORTCUT_CHANGED_CELL_START });
    if (type === 0 /* CellRange */) {
      this.rangeService.clearCellRangeCellValues({ cellEventSource: "clipboardService" });
    } else if (type === 1 /* SelectedRows */) {
      this.clearSelectedRows();
    } else {
      const focusedCell = this.focusService.getFocusedCell();
      if (focusedCell == null) {
        return;
      }
      const rowNode = this.rowPositionUtils.getRowNode(focusedCell);
      if (rowNode) {
        this.clearCellValue(rowNode, focusedCell.column);
      }
    }
    this.eventService.dispatchEvent({ type: Events.EVENT_KEY_SHORTCUT_CHANGED_CELL_END });
  }
  clearSelectedRows() {
    const selected = this.selectionService.getSelectedNodes();
    const columns = this.columnModel.getAllDisplayedColumns();
    for (const row of selected) {
      for (const col of columns) {
        this.clearCellValue(row, col);
      }
    }
  }
  clearCellValue(rowNode, column) {
    if (!column.isCellEditable(rowNode)) {
      return;
    }
    rowNode.setDataValue(column, null, "clipboardService");
  }
  shouldSkipSingleCellRange() {
    return this.gridOptionsService.get("suppressCopySingleCellRanges") && !this.rangeService.isMoreThanOneCell();
  }
  iterateActiveRanges(onlyFirst, rowCallback, columnCallback) {
    if (!this.rangeService || this.rangeService.isEmpty()) {
      return;
    }
    const cellRanges = this.rangeService.getCellRanges();
    if (onlyFirst) {
      this.iterateActiveRange(cellRanges[0], rowCallback, columnCallback, true);
    } else {
      cellRanges.forEach((range, idx) => this.iterateActiveRange(range, rowCallback, columnCallback, idx === cellRanges.length - 1));
    }
  }
  iterateActiveRange(range, rowCallback, columnCallback, isLastRange) {
    if (!this.rangeService) {
      return;
    }
    let currentRow = this.rangeService.getRangeStartRow(range);
    const lastRow = this.rangeService.getRangeEndRow(range);
    if (columnCallback && range.columns) {
      columnCallback(range.columns);
    }
    let rangeIndex = 0;
    let isLastRow = false;
    while (!isLastRow && currentRow != null) {
      const rowNode = this.rowPositionUtils.getRowNode(currentRow);
      isLastRow = this.rowPositionUtils.sameRow(currentRow, lastRow);
      rowCallback(currentRow, rowNode, range.columns, rangeIndex++, isLastRow && isLastRange);
      currentRow = this.cellNavigationService.getRowBelow(currentRow);
    }
  }
  copySelectedRangeToClipboard(params = {}) {
    if (!this.rangeService || this.rangeService.isEmpty()) {
      return;
    }
    const allRangesMerge = this.rangeService.areAllRangesAbleToMerge();
    const { data, cellsToFlash } = allRangesMerge ? this.buildDataFromMergedRanges(params) : this.buildDataFromRanges(params);
    this.copyDataToClipboard(data);
    this.dispatchFlashCells(cellsToFlash);
  }
  buildDataFromMergedRanges(params) {
    const columnsSet = /* @__PURE__ */ new Set();
    const ranges = this.rangeService.getCellRanges();
    const rowPositionsMap = /* @__PURE__ */ new Map();
    const allRowPositions = [];
    const allCellsToFlash = {};
    ranges.forEach((range) => {
      range.columns.forEach((col) => columnsSet.add(col));
      const { rowPositions, cellsToFlash } = this.getRangeRowPositionsAndCellsToFlash(range);
      rowPositions.forEach((rowPosition) => {
        const rowPositionAsString = `${rowPosition.rowIndex}-${rowPosition.rowPinned || "null"}`;
        if (!rowPositionsMap.get(rowPositionAsString)) {
          rowPositionsMap.set(rowPositionAsString, true);
          allRowPositions.push(rowPosition);
        }
      });
      Object.assign(allCellsToFlash, cellsToFlash);
    });
    const allColumns = this.columnModel.getAllDisplayedColumns();
    const exportedColumns = Array.from(columnsSet);
    exportedColumns.sort((a, b) => {
      const posA = allColumns.indexOf(a);
      const posB = allColumns.indexOf(b);
      return posA - posB;
    });
    const data = this.buildExportParams({
      columns: exportedColumns,
      rowPositions: allRowPositions,
      includeHeaders: params.includeHeaders,
      includeGroupHeaders: params.includeGroupHeaders
    });
    return { data, cellsToFlash: allCellsToFlash };
  }
  buildDataFromRanges(params) {
    const ranges = this.rangeService.getCellRanges();
    const data = [];
    const allCellsToFlash = {};
    ranges.forEach((range) => {
      const { rowPositions, cellsToFlash } = this.getRangeRowPositionsAndCellsToFlash(range);
      Object.assign(allCellsToFlash, cellsToFlash);
      data.push(this.buildExportParams({
        columns: range.columns,
        rowPositions,
        includeHeaders: params.includeHeaders,
        includeGroupHeaders: params.includeGroupHeaders
      }));
    });
    return { data: data.join("\n"), cellsToFlash: allCellsToFlash };
  }
  getRangeRowPositionsAndCellsToFlash(range) {
    const rowPositions = [];
    const cellsToFlash = {};
    const startRow = this.rangeService.getRangeStartRow(range);
    const lastRow = this.rangeService.getRangeEndRow(range);
    let node = startRow;
    while (node) {
      rowPositions.push(node);
      range.columns.forEach((column) => {
        const { rowIndex, rowPinned } = node;
        const cellId = this.cellPositionUtils.createIdFromValues({ rowIndex, column, rowPinned });
        cellsToFlash[cellId] = true;
      });
      if (this.rowPositionUtils.sameRow(node, lastRow)) {
        break;
      }
      node = this.cellNavigationService.getRowBelow(node);
    }
    return { rowPositions, cellsToFlash };
  }
  getCellsToFlashFromRowNodes(rowNodes) {
    const allDisplayedColumns = this.columnModel.getAllDisplayedColumns();
    const cellsToFlash = {};
    for (let i = 0; i < rowNodes.length; i++) {
      const { rowIndex, rowPinned } = rowNodes[i];
      if (rowIndex == null) {
        continue;
      }
      for (let j = 0; j < allDisplayedColumns.length; j++) {
        const column = allDisplayedColumns[j];
        const cellId = this.cellPositionUtils.createIdFromValues({ rowIndex, column, rowPinned });
        cellsToFlash[cellId] = true;
      }
    }
    return cellsToFlash;
  }
  copyFocusedCellToClipboard(params = {}) {
    const focusedCell = this.focusService.getFocusedCell();
    if (focusedCell == null) {
      return;
    }
    const cellId = this.cellPositionUtils.createId(focusedCell);
    const currentRow = { rowPinned: focusedCell.rowPinned, rowIndex: focusedCell.rowIndex };
    const column = focusedCell.column;
    const data = this.buildExportParams({
      columns: [column],
      rowPositions: [currentRow],
      includeHeaders: params.includeHeaders,
      includeGroupHeaders: params.includeGroupHeaders
    });
    this.copyDataToClipboard(data);
    this.dispatchFlashCells({ [cellId]: true });
  }
  copySelectedRowsToClipboard(params = {}) {
    const { columnKeys, includeHeaders, includeGroupHeaders } = params;
    const data = this.buildExportParams({
      columns: columnKeys,
      includeHeaders,
      includeGroupHeaders
    });
    this.copyDataToClipboard(data);
    const rowNodes = this.selectionService.getSelectedNodes() || [];
    this.dispatchFlashCells(this.getCellsToFlashFromRowNodes(rowNodes));
  }
  buildExportParams(params) {
    const { columns, rowPositions, includeHeaders = false, includeGroupHeaders = false } = params;
    const exportParams = {
      columnKeys: columns,
      rowPositions,
      skipColumnHeaders: !includeHeaders,
      skipColumnGroupHeaders: !includeGroupHeaders,
      suppressQuotes: true,
      columnSeparator: this.getClipboardDelimiter(),
      onlySelected: !rowPositions,
      processCellCallback: this.gridOptionsService.getCallback("processCellForClipboard"),
      processRowGroupCallback: (params2) => this.processRowGroupCallback(params2),
      processHeaderCallback: this.gridOptionsService.getCallback("processHeaderForClipboard"),
      processGroupHeaderCallback: this.gridOptionsService.getCallback("processGroupHeaderForClipboard")
    };
    return this.csvCreator.getDataAsCsv(exportParams, true);
  }
  processRowGroupCallback(params) {
    const { node, column } = params;
    const isTreeData = this.gridOptionsService.get("treeData");
    const isSuppressGroupMaintainValueType = this.gridOptionsService.get("suppressGroupMaintainValueType");
    const getValueFromNode = () => {
      var _a, _b;
      if (isTreeData || isSuppressGroupMaintainValueType || !column) {
        return node.key;
      }
      const value2 = (_a = node.groupData) == null ? void 0 : _a[column.getId()];
      if (!value2 || !node.rowGroupColumn || node.rowGroupColumn.getColDef().useValueFormatterForExport === false) {
        return value2;
      }
      return (_b = this.valueFormatterService.formatValue(node.rowGroupColumn, node, value2)) != null ? _b : value2;
    };
    let value = getValueFromNode();
    if (params.node.footer) {
      let suffix = "";
      if (value && value.length) {
        suffix = ` ${value}`;
      }
      value = `Total${suffix}`;
    }
    const processCellForClipboard = this.gridOptionsService.getCallback("processCellForClipboard");
    if (processCellForClipboard) {
      let column2 = node.rowGroupColumn;
      if (!column2 && node.footer && node.level === -1) {
        column2 = this.columnModel.getRowGroupColumns()[0];
      }
      return processCellForClipboard({
        value,
        node,
        column: column2,
        type: "clipboard",
        formatValue: (valueToFormat) => {
          var _a;
          return (_a = this.valueFormatterService.formatValue(column2, node, valueToFormat)) != null ? _a : valueToFormat;
        },
        parseValue: (valueToParse) => this.valueParserService.parseValue(column2, node, valueToParse, this.valueService.getValue(column2, node))
      });
    }
    return value;
  }
  dispatchFlashCells(cellsToFlash) {
    window.setTimeout(() => {
      const event = {
        type: Events.EVENT_FLASH_CELLS,
        cells: cellsToFlash
      };
      this.eventService.dispatchEvent(event);
    }, 0);
  }
  processCell(rowNode, column, value, type, func, canParse, canFormat) {
    var _a;
    if (func) {
      const params = {
        column,
        node: rowNode,
        value,
        type,
        formatValue: (valueToFormat) => {
          var _a2;
          return (_a2 = this.valueFormatterService.formatValue(column, rowNode != null ? rowNode : null, valueToFormat)) != null ? _a2 : valueToFormat;
        },
        parseValue: (valueToParse) => this.valueParserService.parseValue(column, rowNode != null ? rowNode : null, valueToParse, this.valueService.getValue(column, rowNode))
      };
      return func(params);
    }
    if (canParse && column.getColDef().useValueParserForImport !== false) {
      return this.valueParserService.parseValue(column, rowNode != null ? rowNode : null, value, this.valueService.getValue(column, rowNode));
    } else if (canFormat && column.getColDef().useValueFormatterForExport !== false) {
      return (_a = this.valueFormatterService.formatValue(column, rowNode != null ? rowNode : null, value)) != null ? _a : value;
    }
    return value;
  }
  copyDataToClipboard(data) {
    const userProvidedFunc = this.gridOptionsService.getCallback("sendToClipboard");
    if (userProvidedFunc) {
      userProvidedFunc({ data });
      return;
    }
    const allowNavigator = !this.gridOptionsService.get("suppressClipboardApi");
    if (allowNavigator && navigator.clipboard) {
      navigator.clipboard.writeText(data).catch((e) => {
        _.doOnce(() => {
          console.warn(e);
          console.warn(apiError("writeText"));
        }, "clipboardApiError");
        this.copyDataToClipboardLegacy(data);
      });
      return;
    }
    this.copyDataToClipboardLegacy(data);
  }
  copyDataToClipboardLegacy(data) {
    this.executeOnTempElement((element) => {
      const eDocument = this.gridOptionsService.getDocument();
      const focusedElementBefore = eDocument.activeElement;
      element.value = data || " ";
      element.select();
      element.focus({ preventScroll: true });
      const result = eDocument.execCommand("copy");
      if (!result) {
        console.warn("AG Grid: Browser did not allow document.execCommand('copy'). Ensure api.copySelectedRowsToClipboard() is invoked via a user event, i.e. button click, otherwise the browser will prevent it for security reasons.");
      }
      if (focusedElementBefore != null && focusedElementBefore.focus != null) {
        focusedElementBefore.focus({ preventScroll: true });
      }
    });
  }
  executeOnTempElement(callbackNow, callbackAfter) {
    const eDoc = this.gridOptionsService.getDocument();
    const eTempInput = eDoc.createElement("textarea");
    eTempInput.style.width = "1px";
    eTempInput.style.height = "1px";
    eTempInput.style.top = eDoc.documentElement.scrollTop + "px";
    eTempInput.style.left = eDoc.documentElement.scrollLeft + "px";
    eTempInput.style.position = "absolute";
    eTempInput.style.opacity = "0";
    const guiRoot = this.gridCtrl.getGui();
    guiRoot.appendChild(eTempInput);
    try {
      callbackNow(eTempInput);
    } catch (err) {
      console.warn("AG Grid: Browser does not support document.execCommand('copy') for clipboard operations");
    }
    if (callbackAfter) {
      window.setTimeout(() => {
        callbackAfter(eTempInput);
        guiRoot.removeChild(eTempInput);
      }, 100);
    } else {
      guiRoot.removeChild(eTempInput);
    }
  }
  getRangeSize() {
    const ranges = this.rangeService.getCellRanges();
    let startRangeIndex = 0;
    let endRangeIndex = 0;
    if (ranges.length > 0) {
      startRangeIndex = this.rangeService.getRangeStartRow(ranges[0]).rowIndex;
      endRangeIndex = this.rangeService.getRangeEndRow(ranges[0]).rowIndex;
    }
    return startRangeIndex - endRangeIndex + 1;
  }
};
__decorateClass([
  Autowired("csvCreator")
], ClipboardService.prototype, "csvCreator", 2);
__decorateClass([
  Autowired("loggerFactory")
], ClipboardService.prototype, "loggerFactory", 2);
__decorateClass([
  Autowired("selectionService")
], ClipboardService.prototype, "selectionService", 2);
__decorateClass([
  Optional("rangeService")
], ClipboardService.prototype, "rangeService", 2);
__decorateClass([
  Autowired("rowModel")
], ClipboardService.prototype, "rowModel", 2);
__decorateClass([
  Autowired("ctrlsService")
], ClipboardService.prototype, "ctrlsService", 2);
__decorateClass([
  Autowired("valueService")
], ClipboardService.prototype, "valueService", 2);
__decorateClass([
  Autowired("focusService")
], ClipboardService.prototype, "focusService", 2);
__decorateClass([
  Autowired("rowRenderer")
], ClipboardService.prototype, "rowRenderer", 2);
__decorateClass([
  Autowired("columnModel")
], ClipboardService.prototype, "columnModel", 2);
__decorateClass([
  Autowired("cellNavigationService")
], ClipboardService.prototype, "cellNavigationService", 2);
__decorateClass([
  Autowired("cellPositionUtils")
], ClipboardService.prototype, "cellPositionUtils", 2);
__decorateClass([
  Autowired("rowPositionUtils")
], ClipboardService.prototype, "rowPositionUtils", 2);
__decorateClass([
  Autowired("valueFormatterService")
], ClipboardService.prototype, "valueFormatterService", 2);
__decorateClass([
  Autowired("valueParserService")
], ClipboardService.prototype, "valueParserService", 2);
__decorateClass([
  PostConstruct
], ClipboardService.prototype, "init", 1);
ClipboardService = __decorateClass([
  Bean("clipboardService")
], ClipboardService);

// enterprise-modules/clipboard/src/version.ts
var VERSION = "31.2.1";

// enterprise-modules/clipboard/src/clipboardModule.ts
var ClipboardModule = {
  version: VERSION,
  moduleName: ModuleNames.ClipboardModule,
  beans: [ClipboardService],
  dependantModules: [
    EnterpriseCoreModule,
    CsvExportModule
  ]
};
export {
  ClipboardModule
};
