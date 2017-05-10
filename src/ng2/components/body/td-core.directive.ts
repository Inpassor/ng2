import {Directive, ElementRef, Input, OnDestroy, OnInit, ViewContainerRef} from '@angular/core';
//import cellBuilder from '../cell/cell.build';
import {VIEW_CORE_NAME, TD_CORE_NAME} from 'ng/definition';
import {GRID_PREFIX} from 'core/definition';
import {ViewCoreService} from "../view/view-core.service";
import {RootService} from '../root.service';
import {TemplateCacheService} from '../../services/template-cache.service';

export class TdCoreContext {
  constructor(public $implicit: TdCoreDirective) {
  }
}

@Directive({
  selector: '[q-grid-core-td]',
})
export class TdCoreDirective implements OnInit, OnDestroy {
  @Input('q-grid-core-row-index') rowIndex: number;
  @Input('q-grid-core-column-index') columnIndex: number;
  private element: HTMLElement = null;

  constructor(public $view: ViewCoreService,
              private root: RootService,
              private templateCache: TemplateCacheService,
              private viewContainerRef: ViewContainerRef,
              element: ElementRef) {

    this.element = element.nativeElement.parentElement;
  }

  ngOnInit() {
    const column = this.column;
    const element = this.element;

    this.$view.style.monitor.cell.add(element);

    element.classList.add(`${GRID_PREFIX}-${column.key}`);
    element.classList.add(`${GRID_PREFIX}-${column.type}`);
    if (column.hasOwnProperty('editor')) {
      element.classList.add(`${GRID_PREFIX}-${column.editor}`);
    }

    const context = new TdCoreContext(this);
    const template = this.templateCache.get('body.cell.text.tpl.html');
    this.viewContainerRef.createEmbeddedView(template, context);

    this.mode('init');
  }

  mode(value) {
    const model = this.root.model;

    // switch (value) {
    //   case 'view':
    //   case 'init': {
    //     let link = cache.find(column.key);
    //     if (!link) {
    //       const build = cellBuilder(this.view.template);
    //       link = build('body', model, column);
    //       cache.set(column.key, link);
    //     }
    //
    //     link(this.$element, templateScope);
    //     if (value !== 'init') {
    //       element.classList.remove(`${GRID_PREFIX}-edit`);
    //     }
    //     break;
    //   }
    //   case 'edit': {
    //     let link = cache.find(`${column.key}.edit`);
    //     if (!link) {
    //       const build = cellBuilder(this.view.template, 'edit');
    //       link = build('body', model, column);
    //       cache.set(`${column.key}.edit`, link);
    //     }
    //
    //     link(this.$element, templateScope);
    //     element.classList.add(`${GRID_PREFIX}-edit`);
    //   }
    //     break;
    //   default:
    //     throw new AppError('td.core', `Invalid mode ${value}`);
    // }
  }

  get value() {
    const column = this.column;
    const row = this.row;
    return this.$view.body.value(row, column);
  }

  set value(value) {
    const column = this.column;
    const row = this.row;
    this.$view.body.value(row, column, value);
  }

  get label() {
    const column = this.column;
    const row = this.row;
    return this.$view.body.label(row, column);
  }

  set label(label) {
    const column = this.column;
    const row = this.row;
    this.$view.body.label(row, column, label);
  }

  get column() {
    return this.$view.body.columns[this.columnIndex].model;
  }

  get row() {
    return this.$view.body.rows[this.rowIndex];
  }

  ngOnDestroy() {
    this.$view.style.monitor.cell.remove(this.element);
  }
}