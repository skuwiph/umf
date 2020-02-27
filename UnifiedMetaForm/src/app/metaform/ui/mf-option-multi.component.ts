import { Component, OnInit } from '@angular/core';

import { MetaFormService } from '../meta-form.service';
import { MetaFormOptionControlBase } from './mf-option-control-base';

@Component({
    selector: 'app-mf-option-multi',
    template: `
<ng-container *ngIf="loaded; else loading">
    <div class="mf-options" [ngClass]="{'opt-horiz': isHorizontal, 'opt-vert': isVertical, 'error': inError }">
        <button type="button" *ngFor="let o of options" class="mfc mf-option-item"
            [ngClass]="{'opt-selected': isSelected(o.code)}" (click)="selectItem(o.code)">{{o.description}}</button>
    </div>
</ng-container>
<ng-template #loading>
    <p>Loading data...</p>
</ng-template>`,
    styleUrls: ['./mf.components.css']
})
export class MetaFormOptionMultiComponent extends MetaFormOptionControlBase implements OnInit {

    selectedItems: Map<string, boolean> = new Map<string, boolean>();

    constructor(formService: MetaFormService) { super(formService); }

    ngOnInit(): void {
        console.log(`Option Multi`);
        super.ngOnInit();
    }

    postOptionLoadProcessing(): void {
        this.extractSelectedOptions();
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
        if (currentlySelected && currentlySelected.indexOf(',') > -1) {
            const split = currentlySelected.split(',');
            for (const sel of split) {
                this.selectedItems.set(sel, true);
            }
        }
    }
}
