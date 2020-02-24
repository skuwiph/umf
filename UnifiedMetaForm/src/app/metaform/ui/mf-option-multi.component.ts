import { Component, OnInit, Input, Output } from '@angular/core';
import { MFControl, MetaForm, MFControlValidityChange, MFOptionControl, MFOptionValue, MFValueChange } from '../meta-form';
import { MetaFormService } from '../meta-form.service';
import { FormControl } from '@angular/forms';
import { EventEmitter } from '@angular/core';
import { ControlLayoutStyle } from '../meta-form-enums';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-mf-option-multi',
    templateUrl: './mf-option-multi.component.html',
    styleUrls: ['./mf-option.component.css']
})
export class MetaFormOptionMultiComponent implements OnInit {

    @Input() form: MetaForm;
    @Input() control: MFControl;
    @Output() changeValidity: EventEmitter<MFControlValidityChange> = new EventEmitter<MFControlValidityChange>();

    formControl: FormControl;
    name: string;
    optionType: string;

    inError = false;
    loaded = false;

    isHorizontal = false;
    isVertical = true;

    options: MFOptionValue[];
    selectedItems: Map<string, boolean> = new Map<string, boolean>();
    selectedItem: string;

    constructor(private mfService: MetaFormService) { }

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
                    if (optionControl.options.nullItem) {
                        nv.push(new MFOptionValue('', optionControl.options.nullItem));
                    }

                    this.options = nv.concat(data);
                    this.extractSelectedOptions();
                });
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

    private checkControlStatus() {
        this.inError = !this.control.isValid(this.form);
        if (!this.inError) {
            this.control.isValidAsync(this.form).subscribe(
                (valid: boolean) => {
                    // console.log(`async validator finished: ${valid}`);
                    this.inError = !valid;
                    this.changeValidity.emit(new MFControlValidityChange(this.control.controlId, !this.inError));
                }
            );
        }
        this.changeValidity.emit(new MFControlValidityChange(this.control.controlId, !this.inError));
    }

}
