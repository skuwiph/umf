import { Component, OnInit, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { filter } from 'rxjs/operators';

import { MetaFormService } from '../meta-form.service';
import { MetaFormControlBase } from './mf-control-base';
import { MFControlValidityChange, MFOptionControl, MFOptionValue, MFValueChange, MFOptionsChanged } from '../meta-form';
import { ControlLayoutStyle } from '../meta-form-enums';

@Component({
    selector: 'app-mf-option-multi',
    templateUrl: './mf-option-multi.component.html',
    styleUrls: ['./mf-option.component.css']
})
export class MetaFormOptionMultiComponent extends MetaFormControlBase implements OnInit {

    @Output() optionLoadComplete: EventEmitter<MFOptionsChanged> = new EventEmitter<MFOptionsChanged>();

    formControl: FormControl;
    optionType: string;

    loaded = false;

    isHorizontal = false;
    isVertical = true;

    options: MFOptionValue[];
    selectedItems: Map<string, boolean> = new Map<string, boolean>();
    selectedItem: string;

    constructor(private mfService: MetaFormService) { super(); }

    ngOnInit(): void {
        this.formControl = new FormControl('');
        if (this.control) {
            const optionControl = this.control as MFOptionControl;
            this.name = this.control.name;

            this.isHorizontal = optionControl.optionLayout === ControlLayoutStyle.Horizontal;
            this.isVertical = !this.isHorizontal;

            if (optionControl.hasOptionList) {
                this.options = optionControl.optionList;
                this.loaded = true;
                this.extractSelectedOptions();
            } else if (optionControl.hasUrl) {
                this.loadOptions(optionControl);
            }
            this.checkControlDependencies();
        }
    }

    checkControlDependencies(): void {
        if (this.control.dependencies) {
            for (const dep of this.control.dependencies) {
                this.form.change
                    .pipe(
                        filter((c: MFValueChange) => c.name === dep)
                    )
                    .subscribe((chg: MFValueChange) => {
                        this.loadOptions(this.control as MFOptionControl);
                    });
            }
        }
    }

    loadOptions(optionControl: MFOptionControl): void {
        const url = optionControl.urlForService(this.form, this.control);
        if (url) {
            this.mfService.loadOptionsFromUrl(this.form, url)
                .subscribe((data: MFOptionValue[]) => {
                    const nv: MFOptionValue[] = [];
                    if (data.length > 0) {
                        if (optionControl.options.nullItem) {
                            nv.push(new MFOptionValue('', optionControl.options.nullItem));
                        }
                        this.options = nv.concat(data).slice();
                    } else {
                        this.options = [];
                    }

                    optionControl.options.list = this.options.slice();

                    this.optionLoadComplete.emit(new MFOptionsChanged(this.name, this.options.length));

                    this.loaded = true;
                    this.extractSelectedOptions();
                });
        } else {
            this.options = [];
            optionControl.options.list = [];

            this.optionLoadComplete.emit(new MFOptionsChanged(this.name, 0));
            this.loaded = true;
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
                selection += `${this.selectedItems.get(key)},`;
            }
        }

        this.form.setValue(this.control.name, selection);

        this.checkControlStatus();
    }

    onControlValidityChange(event: MFControlValidityChange): void {
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
