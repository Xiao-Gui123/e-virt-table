import type { Rule } from "async-validator";
import type {
  Column,
  OverflowTooltipPlacement,
  Fixed,
  Type,
  Align,
  VerticalAlign,
  CellType,
  Render,
  formatterMethod,
  CellTypeMethod,
  CellRenderMethod,
  // SpanMethod,
  CellEditorTypeMethod,
  SpanMethod,
} from "./types";
import Context from "./Context";
import BaseCell from "./BaseCell";
export default class Cell extends BaseCell {
  formatter: formatterMethod | undefined;
  align: Align;
  verticalAlign: VerticalAlign;
  fixed: Fixed | undefined;
  type: Type;
  editorType: string;
  cellType: CellType;
  level: number;
  colspan = 1;
  rowspan = 1;
  key: string;
  overflowTooltipShow = false;
  overflowTooltipWidth = 0;
  overflowTooltipPlacement: OverflowTooltipPlacement;
  column: Column;
  rowIndex: number;
  colIndex: number;
  rowKey: string;
  row: any;
  private value: any;
  render: Render;
  renderFooter: Render;
  style: any = {};
  rules: Rule = {};
  message: string = "";
  text: string = "";
  displayText: string = "";
  constructor(
    ctx: Context,
    rowIndex: number,
    colIndex: number,
    x: number,
    y: number,
    width: number,
    height: number,
    column: Column,
    row: any,
    cellType: CellType = "body"
  ) {
    super(ctx, x, y, width, height, column.fixed);
    this.colIndex = colIndex;
    this.rowIndex = rowIndex;
    this.key = column.key;
    this.type = column.type || "text";
    this.editorType = column.editorType || "text";
    this.cellType = cellType;
    this.overflowTooltipShow = column.overflowTooltipShow || false;
    this.overflowTooltipWidth = column.overflowTooltipWidth || 0;
    this.overflowTooltipPlacement = column.overflowTooltipPlacement || "top";
    this.align = column.align || "center";
    this.verticalAlign = column.verticalAlign || "middle";
    this.fixed = column.fixed;
    this.level = column.level;
    this.column = column;
    // this.layerX = this.getLayerX();
    // this.layerY = this.getLayerY();
    this.rules = column.rules;
    this.row = row;
    this.rowKey = this.ctx.database.getRowKeyForRowIndex(rowIndex);
    this.value = this.getValue();
    this.render = column.render;
    this.renderFooter = column.renderFooter;
    this.formatter = column.formatter;
    this.update();
    this.getValidationMessage();
  }
  getValidationMessage() {
    const errors = this.ctx.database.getValidationError(this.rowKey, this.key);
    if (Array.isArray(errors) && errors.length) {
      const [err] = errors;
      this.message = err.message;
    }
    return this.message;
  }
  update() {
    // this.updateSpan();
    // this.updateStyle();
    // this.updateType();
    // this.updateEditorType();
    // this.updateRender();
    this.text = this.getText();
    this.displayText = this.getDisplayText();
  }
  // updateSpan() {
  //   // 合计不合并
  //   if (this.cellType === "footer") {
  //     return;
  //   }
  //   const { SPAN_METHOD } = this.ctx.config;
  //   if (typeof SPAN_METHOD === "function") {
  //     const spanMethod: SpanMethod = SPAN_METHOD;
  //     const { colspan = 1, rowspan = 1 } =
  //       spanMethod({
  //         row: this.row,
  //         rowIndex: this.rowIndex,
  //         colIndex: this.colIndex,
  //         column: this.column,
  //         value: this.getValue(),
  //         headIndex: this.ctx.body.headIndex,
  //         headPosition: this.ctx.database.getPositionForRowIndex(
  //           this.ctx.body.headIndex
  //         ),
  //         visibleRows: this.ctx.body.headIndex,
  //         visibleLeafColumns: this.ctx.header.visibleLeafColumns,
  //         rows: this.ctx.body.data,
  //       }) || {};
  //     this.colspan = colspan;
  //     this.rowspan = rowspan;
  //     this.visibleWidth = this.ctx.header.getWidthByColIndexColSpan(
  //       this.colIndex,
  //       this.colspan
  //     );
  //     this.visibleHeight = this.ctx.database.getHeightByRowIndexRowSpan(
  //       this.rowIndex,
  //       this.rowspan
  //     );
  //   }
  // }
  updateType() {
    // 更改类型
    const { CELL_TYPE_METHOD } = this.ctx.config;
    if (typeof CELL_TYPE_METHOD === "function") {
      const cellTypeMethod: CellTypeMethod = CELL_TYPE_METHOD;
      const type = cellTypeMethod({
        row: this.row,
        rowIndex: this.rowIndex,
        colIndex: this.colIndex,
        column: this.column,
        value: this.getValue(),
      });
      // 可以动态改变类型
      if (type !== undefined) {
        this.type = type;
      }
    }
  }
  updateEditorType() {
    // 更改类型
    const { CELL_EDITOR_TYPE_METHOD } = this.ctx.config;
    if (typeof CELL_EDITOR_TYPE_METHOD === "function") {
      const cellEditorTypeMethod: CellEditorTypeMethod =
        CELL_EDITOR_TYPE_METHOD;
      const editorType = cellEditorTypeMethod({
        row: this.row,
        rowIndex: this.rowIndex,
        colIndex: this.colIndex,
        column: this.column,
        value: this.getValue(),
      });
      // 可以动态改变类型
      if (editorType !== undefined) {
        this.editorType = editorType;
      }
    }
  }
  updateRender() {
    const { CELL_RENDER_METHOD } = this.ctx.config;
    if (typeof CELL_RENDER_METHOD === "function") {
      const cellRenderMethod: CellRenderMethod = CELL_RENDER_METHOD;
      const render = cellRenderMethod({
        row: this.row,
        rowIndex: this.rowIndex,
        colIndex: this.colIndex,
        column: this.column,
        value: this.getValue(),
      });
      // 可以动态改变类型
      if (render !== undefined) {
        this.render = render;
      }
    }
  }
  validate() {
    this.ctx.database
      .getValidator(this.rowKey, this.key)
      .then(() => {
        this.ctx.database.setValidationError(this.rowKey, this.key, []);
        this.message = "";
      })
      .catch((errors) => {
        if (Array.isArray(errors) && errors.length) {
          const [err] = errors;
          this.message = err.message;
          this.ctx.database.setValidationError(this.rowKey, this.key, errors);
        }
      })
      .finally(() => {
        this.ctx.emit("asyncDrawBody");
      });
  }

  /**
   * 更新样式
   */
  updateStyle() {
    this.style = this.getOverlayerViewsStyle();
  }

  /**
   * 获取显示文本
   * @returns
   */
  getDisplayText() {
    if (this.cellType === "footer") {
      // 插槽不显示文本
      if (this.renderFooter) {
        return "";
      }
      const text = this.row[this.key];
      if ([null, undefined].includes(text)) {
        return "";
      }
      return text;
    } else {
      // cellType === "body"
      // 被跨度单元格
      if (this.rowspan === 0 || this.colspan === 0) {
        return "";
      }
      // 插槽不显示文本
      if (this.render) {
        return "";
      }
      return this.text;
    }
  }
  /**
   * 获取文本
   * @returns
   */
  getText() {
    if (typeof this.formatter === "function") {
      const _text = this.formatter({
        row: this.row,
        rowIndex: this.rowIndex,
        colIndex: this.colIndex,
        column: this.column,
        value: this.getValue(),
      });
      return _text;
    }
    if (["index-selection", "index"].includes(this.type)) {
      const str = `${this.rowIndex + 1}`; // 索引
      return str; // 索引
    }
    this.value = this.ctx.database.getItemValue(this.rowKey, this.key);
    return this.value;
  }
  getValue() {
    return this.ctx.database.getItemValue(this.rowKey, this.key);
  }
  /**
   * 文本是否溢出
   * @returns
   */
  isTextOverflowing() {
    // 创建一个虚拟文本节点来测量实际文本宽度
    // const {
    //   CELL_PADDING,
    //   READONLY_TEXT_COLOR,
    //   BODY_FONTFAMILY,
    //   BODY_FONT_SIZE,
    //   BODY_LINE_HEIGHT,
    //   BODY_FONT_STYLE,
    // } = this.ctx.config;
    // const virtualText = new Konva.Text({
    //   name: "virtual-text-node",
    //   text: this.getDisplayText(),
    //   width: this.visibleWidth,
    //   fontFamily: BODY_FONTFAMILY,
    //   lineHeight: BODY_LINE_HEIGHT,
    //   fontSize: BODY_FONT_SIZE,
    //   fontStyle: BODY_FONT_STYLE,
    //   padding: CELL_PADDING,
    //   align: this.align,
    //   ellipsis: false,
    //   verticalAlign: this.verticalAlign,
    //   fill: READONLY_TEXT_COLOR,
    //   visible: false, // 不显示虚拟文本节点
    // });
    // // 添加虚拟文本节点到层并绘制一次以计算宽度
    // this.ctx.layer.add(virtualText);
    // const isTextOverflowing = virtualText.height() > this.height;
    // virtualText.destroy(); // 移除虚拟文本节点
    // return isTextOverflowing;
  }
  /**
   * 获取样式
   */
  getOverlayerViewsStyle() {
    // let left = `${this.getClientX() - this.ctx.header.fixedLeftWidth}px`;
    // let top = `${this.getClientY() - this.ctx.body.y}px`;
    // // 固定列
    // if (this.fixed === "left") {
    //   left = `${this.getClientX()}px`;
    // } else if (this.fixed === "right") {
    //   left = `${
    //     this.getClientX() -
    //     (this.ctx.stage.width() - this.ctx.header.fixedRightWidth)
    //   }px`;
    // }
    // // 合计
    // if (this.cellType === "footer") {
    //   if (this.ctx.config.FOOTER_FIXED) {
    //     top = `${this.getClientY() - this.ctx.footer.y}px`;
    //   }
    // }
    // return {
    //   position: "absolute",
    //   overflow: "hidden",
    //   left,
    //   top,
    //   width: `${this.visibleWidth}px`,
    //   height: `${this.visibleHeight}px`,
    //   pointerEvents: "none",
    // };
  }
  draw() {
    this.update();
    const drawX = this.getDrawX();
    const drawY = this.getDrawY();
    // const displayText = this.getText();
    const {
      paint,
      config: {
        BORDER_COLOR,
        BODY_BG_COLOR,
        CELL_PADDING,
        HEAD_FONTFAMILY,
        HEAD_FONT_SIZE,
        HEAD_FONT_STYLE,
      },
    } = this.ctx;
    paint.drawRect(drawX, drawY, this.width, this.height, {
      borderColor: BORDER_COLOR,
      fillColor: BODY_BG_COLOR,
    });
    const font = `${HEAD_FONT_SIZE}px ${HEAD_FONT_STYLE} ${HEAD_FONTFAMILY}`;
    paint.drawText(this.displayText, drawX, drawY, this.width, this.height, {
      font,
      padding: CELL_PADDING,
      align: this.align,
      verticalAlign: this.verticalAlign,
    });
  }
}
