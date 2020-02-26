import { Component, OnInit, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { filter } from 'rxjs/operators';

import { MetaFormService } from '../meta-form.service';
import { MetaFormControlBase } from './mf-control-base';
import { MFControlValidityChange, MFOptionControl, MFOptionValue, MFValueChange, MFOptionsChanged } from '../meta-form';
import { MetaFormOptionType, ControlLayoutStyle } from '../meta-form-enums';

@Component({
    selector: 'app-mf-option',
    templateUrl: './mf-option.component.html',
    styleUrls: ['./mf-option.component.css']
})
export class MetaFormOptionComponent extends MetaFormControlBase implements OnInit {

    @Output() optionLoadComplete: EventEmitter<MFOptionsChanged> = new EventEmitter<MFOptionsChanged>();

    formControl: FormControl;
    optionType: string;

    loaded = false;
    expandOptions = false;

    isHorizontal = false;
    isVertical = true;
    hasOptions = false;
    options: MFOptionValue[];
    selectedItem: string;

    constructor(private formService: MetaFormService) { super(); }

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

                this.hasOptions = this.options.length > 0;
                this.optionLoadComplete.emit(new MFOptionsChanged(this.name, this.options.length));

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
                // console.log(`${this.control.name} Checking for changes on ${dep}`);
                this.form.change
                    .pipe(
                        filter((c: MFValueChange) => c.name === dep)
                    )
                    .subscribe((chg: MFValueChange) => {
                        // console.log(`Value change on ${chg.name} to ${chg.value}`);
                        this.loadOptions(this.control as MFOptionControl);
                    });
            }
        }
    }

    loadOptions(optionControl: MFOptionControl): void {
        // console.log(`load options`);
        const url = optionControl.urlForService(this.form, this.control);
        if (url) {
            this.formService.loadOptionsFromUrl(this.form, url)
                .subscribe((data: MFOptionValue[]) => {
                    const value = this.form.getValue(this.name);
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

                    this.hasOptions = this.options.length > 0;
                    this.optionLoadComplete.emit(new MFOptionsChanged(this.name, this.options.length));

                    this.loaded = true;
                    if (this.hasOptions && value && value.length > 0) {
                        this.selectItem(value);
                    } else {
                        // If there are no options, clear this data item
                        this.form.setValue(this.name, '');
                    }
                });
        } else {
            this.options = [];
            optionControl.options.list = [];

            this.hasOptions = false;
            this.optionLoadComplete.emit(new MFOptionsChanged(this.name, 0));
            this.loaded = true;
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

    // Pass on the event from the multi-choice option
    multiOptionLoadComplete(change: MFOptionsChanged) {
        this.optionLoadComplete.emit(change);
    }

}
