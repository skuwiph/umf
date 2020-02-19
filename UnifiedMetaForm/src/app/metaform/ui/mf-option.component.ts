import { Component, OnInit, Input, Output } from '@angular/core';
import { MFControl, MetaForm, MFLabelControl, MFControlValidityChange, MFOptionControl, MFOptionValue } from '../meta-form';
import { MetaFormService } from '../meta-form.service';
import { FormControl } from '@angular/forms';
import { EventEmitter } from '@angular/core';
import { MetaFormOptionType, ControlLayoutStyle } from '../meta-form-enums';
import { BuiltinVar } from '@angular/compiler';

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
                    this.expandOptions = optionControl.expandOptions;
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

            const value = this.form.getValue(this.name);

            if (optionControl.options) {
                this.options = optionControl.options;
                this.loaded = true;
            } else if (optionControl.optionSource) {
                this.mfService.loadOptionsFromUrl(this.form, optionControl.optionSource)
                    .subscribe((data: MFOptionValue[]) => {
                        const nv: MFOptionValue[] = [];
                        if (optionControl.nullItem) {
                            nv.push(new MFOptionValue('', optionControl.nullItem));
                        }

                        // console.log(`Got ${data.length} from ${optionControl.optionSource} results: ${JSON.stringify(data)}`);
                        this.options = nv.concat(data);
                        this.loaded = true;
                        if (value.length > 0) {
                            this.selectItem(value);
                        }
                    });
            }

            this.formControl.valueChanges.subscribe(obs => {
                this.form.setValue(this.control.name, obs);
                this.checkControlStatus();
            });
        }
    }

    isSelected(code: string): boolean {
        const item = this.form.getValue(this.control.name);

        if (item.length > 0) {
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
        console.log(`Selecting item ${code}`);
        if (code.length > 0) {
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
        console.log(`Is control invalid? ${this.inError}`);
        this.changeValidity.emit(new MFControlValidityChange(this.control.name, !this.inError));
    }
}
