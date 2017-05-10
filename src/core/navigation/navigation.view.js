import View from 'core/view/view';
import Command from 'core/infrastructure/command';
import Shortcut from 'core/infrastructure/shortcut';
import Navigation from 'core/navigation/navigation';
import {GRID_PREFIX} from 'core/definition';

export default class NavigationView extends View {
	constructor(model, table, applyFactory) {
		super(model);

		this.table = table;
		const shortcut = new Shortcut(table, applyFactory('async'));
		const navigation = new Navigation(model, table);

		this.shortcutOff = shortcut.register('navigation', navigation.commands);

		this.blur = new Command({
			execute: (row, column) => table.body.cell(row, column).removeClass(`${GRID_PREFIX}-focus`),
			canExecute: (row, column, cell) => {
				return (cell && table.data.columns().indexOf(cell.column) >= 0)
					|| (!cell && table.body.cell(row, column).model !== null);
			}
		});

		this.focus = new Command({
			execute: (row, column) => table.body.cell(row, column).addClass(`${GRID_PREFIX}-focus`),
			canExecute: (row, column, cell) => {
				cell = cell || table.body.cell(row, column).model;
				return cell
					&& cell.column.canFocus
					&& table.data.columns().indexOf(cell.column) >= 0;
			}
		});

		this.focusCell = new Command({
			execute: cell => model.navigation({cell: cell}),
			canExecute: cell => {
				return cell
					&& cell.column.canFocus
					&& table.data.columns().indexOf(cell.column) >= 0
					&& cell !== model.navigation().cell;
			}
		});

		this.scrollTo = new Command({
			execute: (row, column) => this.scroll(table.body, table.body.cell(row, column)),
			canExecute: (row, column) => table.body.cell(row, column).model !== null
		});

		model.navigationChanged.watch(e => {
			if (e.hasChanges('cell')) {
				const navState = model.navigation();
				const newTarget = e.changes.cell.newValue;
				const oldTarget = e.changes.cell.oldValue;
				const newRow = navState.rowIndex;
				const newColumn = navState.columnIndex;
				const oldRow = e.changes.cell.oldValue ? e.changes.cell.oldValue.rowIndex : -1;
				const oldColumn = e.changes.cell.oldValue ? e.changes.cell.oldValue.columnIndex : -1;

				if (this.blur.canExecute(oldRow, oldColumn, oldTarget)) {
					this.blur.execute(oldRow, oldColumn);
				}

				if (this.focus.canExecute(newRow, newColumn, newTarget)) {
					this.focus.execute(newRow, newColumn);
				}

				if (e.tag.source !== 'navigation.scroll' && this.scrollTo.canExecute(newRow, newColumn)) {
					this.scrollTo.execute(newRow, newColumn);
				}
			}
		});

		model.viewChanged.watch(() => {
			model.navigation({cell: null});
		});
	}

	scroll(body, target) {
		const tr = target.rect();
		const cr = body.rect();
		const scrollState = this.model.scroll();

		if (cr.left > tr.left
			|| cr.left > tr.right
			|| cr.right < tr.left
			|| cr.right < tr.right) {
			if (cr.left < tr.left
				|| cr.right < tr.right) {
				body.scrollLeft(tr.right - cr.right + scrollState.left);
			} else if (cr.left > tr.left
				|| cr.left > tr.right) {
				body.scrollLeft(tr.left - cr.left + scrollState.left);
			}
		}

		if (cr.top > tr.top
			|| cr.top > tr.bottom
			|| cr.bottom < tr.top
			|| cr.bottom < tr.bottom) {
			if (cr.top < tr.top
				|| cr.bottom < tr.bottom) {
				body.scrollTop(tr.bottom - cr.bottom + scrollState.top);
			} else if (cr.top > tr.top
				|| cr.top > tr.bottom) {
				body.scrollTop(tr.top - cr.top + scrollState.top);
			}
		}
	}

	destroy() {
		this.shortcutOff();
	}
}