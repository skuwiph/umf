import { Component, OnInit, Input, Output } from '@angular/core';
import { MFControl, MetaForm, MFLabelControl, MFControlValidityChange, MFOptionControl, MFOptionValue, MFValueChange } from '../meta-form';
import { MetaFormService } from '../meta-form.service';
import { FormControl } from '@angular/forms';
import { EventEmitter } from '@angular/core';
import { MetaFormOptionType, ControlLayoutStyle } from '../meta-form-enums';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-mf-option',
    templateUrl: './mf-option.component.html',
    styleUrls: ['./mf-option.component.css']
})
export class MetaFormOptionComponent implements OnInit {

    @Input() form: MetaForm;
    @Input() control: MFControl;
    @Output() changeValidity: EventEmitter<MFControlValidityChange> = new EventEmitter<MFControlValidityChange>();

    formControl: FormControl;
    name: string;
    optionType: string;

    inError = false;
    loaded = false;
    expandOptions = false;

    isHorizontal = false;
    isVertical = true;

    options: MFOptionValue[];
    selectedItem: string;

    constructor(private mfService: MetaFormService) { }

    ngOnInit(): void {
        this.formControl = new FormControl('');
        if (this.control) {
            const optionControl = this.control as MFOptionControl;
            this.name = this.control.name;

            this.isHorizontal = optionControl.optionLayout === ControlLayoutStyle.Horizontal;
            this.isVertical = !this.isHorizontal;

            switch (optionControl.optionType) {
                case MetaFormOptionType.SingleSelect:
                    this.optionType = 'single';
                    this.expandOptions = optionControl.options.expandOptions ?? true;
                    break;
                case MetaFormOptionType.MultiSelect:
                    this.optionType = 'multi';
                    break;
                case MetaFormOptionType.Typeahead:
                    this.optionType = 'typeahead';
                    break;
                default:
                    this.optionType = 'single';
                    break;
            }

            if (optionControl.hasOptionList) {
                this.options = optionControl.optionList;
                this.loaded = true;
            } else if (optionControl.hasUrl) {
                this.loadOptions(optionControl);
            }

            this.formControl.valueChanges.subscribe(obs => {
                this.form.setValue(this.control.name, obs);
                this.checkControlStatus();
            });

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
                    const value = this.form.getValue(this.name);
                    const nv: MFOptionValue[] = [];

                    if (optionControl.options.nullItem) {
                        nv.push(new MFOptionValue('', optionControl.options.nullItem));
                    }
                    this.options = nv.concat(data);
                    this.loaded = true;
                    if (value && value.length > 0) {
                        this.selectItem(value);
                    }
                });
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

    selectItem(code: string): void {
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
        this.checkControlStatus();
    }

    onControlValidityChange(event: MFControlValidityChange): void {
        this.checkControlStatus();
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
