import { Component, OnInit, Output } from '@angular/core';

import { MetaFormService } from '../meta-form.service';
import { MFOptionControl } from '../meta-form';
import { MetaFormOptionType } from '../meta-form-enums';
import { MetaFormOptionControlBase } from './mf-option-control-base';

@Component({
    selector: 'app-mf-option',
    template: `
<div *ngIf="ro; else edit" class="mf-readonly">
    {{readonlyValue}}
</div>
<ng-template #edit>
    <div *ngIf="loaded && hasOptions">
        <ng-container [ngSwitch]="optionType">
            <ng-container *ngSwitchCase="'single'">
                <ng-container *ngIf="expandOptions; else dropdown">
                    <div class="mf-options" [ngClass]="{'opt-horiz': isHorizontal, 'opt-vert': isVertical, 'error': inError }">
                        <button type="button" *ngFor="let o of options" class="mfc mf-option-item"
                        [ngClass]="{'opt-selected': isSelected(o.code)}" (click)="selectItem(o.code)">{{o.description}}</button>
                    </div>
                </ng-container>
                <ng-template #dropdown>
                    <select class="mfc mf-option-select" [ngClass]="{'error': inError }" (change)="onChange($event.target.value)"
                    (blur)="onFocusLost()">
                        <option *ngFor="let o of options" class="mf-option-select-item"
                        [selected]="isSelected(o.code)"
                        [ngClass]="{'opt-selected': isSelected(o.code)}">{{o.description}}</option>
                    </select>
                </ng-template>
            </ng-container>
        </ng-container>
    </div>
</ng-template>`,
    styleUrls: ['./mf.components.css']
})
export class MetaFormOptionComponent extends MetaFormOptionControlBase implements OnInit {

    optionType: string;
    expandOptions = false;

    constructor(formService: MetaFormService) { super(formService); }

    ngOnInit(): void {
        super.ngOnInit();

        if (this.control) {
            const optionControl = this.control as MFOptionControl;

            switch (optionControl.optionType) {
                case MetaFormOptionType.SingleSelect:
                    this.optionType = 'single';
                    this.expandOptions = optionControl.options.expandOptions ?? true;
                    break;
                case MetaFormOptionType.Typeahead:
                    this.optionType = 'typeahead';
                    break;
                default:
                    this.optionType = 'single';
                    break;
            }
        }
    }

    postOptionLoadProcessing(): void {
        const value = this.form.getValue(this.name);

        if (this.hasOptions) {
            this.selectItem(value ?? '', false);
        } else {
            // If there are no options, clear this data item
            this.selectItem('', false);
        }

        this.setReadonlyValue();
    }

    protected setReadonlyValue(): void {
        if (this.readonly || this.control.readonly) {
            this.ro = true;
            if (this.control.hasValue(this.form)) {
                const c = this.control as MFOptionControl;
                const opts = c.options.list;
                const value = this.form.getValue(this.name);
                const selected = opts.find(o => o.code === value);
                this.readonlyValue = selected.description;
            } else {
                this.readonlyValue = 'N/A';
            }
        }
    }

    isSelected(code: string): boolean {
        const item = this.form.getValue(this.control.name);

        if (item && item.length > 0) {
            return item === code;
        }
        return false;
    }

    onChange(event) {
        // console.log(`got '${event}'`);
        for (const o of this.options) {
            if (o.description === event) {
                // console.log(`selected ${o.code}`);
                this.selectItem(o.code);
                return;
            }
        }

        this.selectItem('');
    }

    selectItem(code: string, updateStatus = true): void {
        // console.log(`Selecting item ${code}`);
        let found = false;
        if (code.length > 0) {
            // Check whether the value exists!
            for (const opt of this.options) {
                if (opt.code === code) {
                    found = true;
                    break;
                }
            }
        }

        if (found) {
            this.form.setValue(this.control.name, code);
        } else {
            this.form.setValue(this.control.name, '');
        }

        this.checkControlStatus(updateStatus);
    }

}
