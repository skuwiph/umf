import { Component, OnInit } from '@angular/core';

import { MetaFormService } from '../metaform.service';
import { MetaFormOptionControlBase } from './mf-option-control-base';
import { MFOptionMultiControl } from '../metaform';

@Component({
    selector: 'lib-mf-option-multi',
    template: `
<div *ngIf="ro; else edit" class="mf-readonly">
    <ul class="nobullet"><li *ngFor="let selected of readonlyItems">{{selected}}</li></ul>
</div>
<ng-template #edit>
    <ng-container *ngIf="loaded; else loading">
        <div class="mf-options" [ngClass]="{'opt-horiz': isHorizontal, 'opt-vert': isVertical, 'error': inError }">
            <button type="button" *ngFor="let o of options" class="mfc mf-option-item"
                [ngClass]="{'opt-selected': isSelected(o.code)}" (click)="selectItem(o.code)">{{o.description}}</button>
        </div>
    </ng-container>
    <ng-template #loading>
        <p>Loading data...</p>
    </ng-template>
</ng-template>`,
    styleUrls: ['./mf.components.css']
})
export class MetaFormOptionMultiComponent extends MetaFormOptionControlBase implements OnInit {

    selectedItems: Map<string, boolean> = new Map<string, boolean>();
    readonlyItems: string[] = [];
    constructor(formService: MetaFormService) { super(formService); }

    ngOnInit(): void {
        super.ngOnInit();
    }

    postOptionLoadProcessing(): void {
        this.extractSelectedOptions();

        this.setReadonlyValue();
    }

    protected setReadonlyValue(): void {
        if (this.readonly || this.control.readonly) {
            this.ro = true;
            if (this.control.hasValue(this.form)) {
                const c = this.control as MFOptionMultiControl;
                const opts = c.options.list;

                const currentlySelected = this.form.getValue(this.control.name);
                let displayValue = '';
                if (currentlySelected.indexOf(',') > -1) {
                    const split = currentlySelected.split(',');
                    for (const sel of split) {
                        const selected = opts.find(o => o.code === sel);
                        if (selected) {
                            this.readonlyItems.push(selected.description);
                            displayValue += `${selected.description}\r\n`;
                        }
                    }
                } else {
                    // Only one selected?
                    const selected = opts.find(o => o.code === currentlySelected);
                    if (selected) {
                        this.readonlyItems.push(selected.description);
                        displayValue += `${selected.description}\r\n`;
                    }
                }

                this.readonlyValue = displayValue;
            } else {
                this.readonlyValue = 'N/A';
            }
        }
    }

    isSelected(code: string): boolean {
        const item = this.form.getValue(this.control.name);

        if (item && item.length > 0) {
            return this.selectedItems.get(code);
        }
        return false;
    }

    selectItem(code: string): void {
        const current = this.selectedItems.get(code);
        const toggled = !current;
        this.selectedItems.set(code, toggled);

        let selection = '';

        // Concat all selected items
        for (const [key, value] of this.selectedItems) {
            if (this.selectedItems.get(key)) {
                selection += `${key},`;
            }
        }

        if (selection.length > 1) {
            selection = selection.slice(0, -1);
        }

        this.form.setValue(this.control.name, selection);

        this.checkControlStatus();
    }

    private extractSelectedOptions() {

        // Set up the selection array
        for (const o of this.options) {
            this.selectedItems.set(o.code, false);
        }

        // This will be a comma-separated list
        const currentlySelected = this.form.getValue(this.control.name);
        if (currentlySelected) {
            if (currentlySelected.indexOf(',') > -1) {
                const split = currentlySelected.split(',');
                for (const sel of split) {
                    this.selectedItems.set(sel, true);
                }
            } else {
                this.selectedItems.set(currentlySelected, true);
            }
        }
    }
}
