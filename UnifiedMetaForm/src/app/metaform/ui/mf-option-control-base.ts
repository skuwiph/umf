import { OnInit, Output, EventEmitter, Input } from '@angular/core';
import { MFControlValidityChange, MFOptionValue, MFValueChange, MFOptionsChanged, MFOptionControlBase } from '../meta-form';
import { MetaFormControlBase } from './mf-control-base';
import { FormControl } from '@angular/forms';
import { ControlLayoutStyle } from '../meta-form-enums';
import { filter } from 'rxjs/operators';
import { MetaFormService } from '../meta-form.service';

export abstract class MetaFormOptionControlBase extends MetaFormControlBase implements OnInit {

    @Input() displayIfEmpty = false;
    @Output() optionLoadComplete: EventEmitter<MFOptionsChanged> = new EventEmitter<MFOptionsChanged>();

    formControl: FormControl;
    loaded = false;

    isHorizontal = false;
    isVertical = true;
    hasOptions = false;
    options: MFOptionValue[];
    selectedItem: string;

    constructor(private formService: MetaFormService) { super(); }

    ngOnInit(): void {
        this.formControl = new FormControl('');
        if (this.control) {
            const optionControl = this.control as MFOptionControlBase;
            this.name = this.control.name;

            this.isHorizontal = optionControl.optionLayout === ControlLayoutStyle.Horizontal;
            this.isVertical = !this.isHorizontal;

            if (optionControl.hasOptionList) {
                this.populateOptions(optionControl);
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
                        this.loadOptions(this.control as MFOptionControlBase);
                    });
            }
        }
    }

    loadOptions(optionControl: MFOptionControlBase): void {
        const url = optionControl.urlForService(this.form, this.control);
        if (url) {
            this.formService.loadOptionsFromUrl(this.form, url)
                .subscribe((data: MFOptionValue[]) => {
                    const nv: MFOptionValue[] = [];
                    if (data.length > 0) {
                        if (optionControl.options.nullItem) {
                            nv.push(new MFOptionValue('', optionControl.options.nullItem));
                        }
                        optionControl.options.list = nv.concat(data);
                    } else {
                        optionControl.options.list = [];
                    }

                    this.populateOptions(optionControl);
                });
        } else {

        }
    }

    populateOptions(optionControl: MFOptionControlBase): void {
        const nv: MFOptionValue[] = [];
        if (optionControl.options.nullItem) {
            nv.push(new MFOptionValue('', optionControl.options.nullItem));
        }

        this.options = nv.concat(optionControl.optionList); // optionControl.optionList;

        this.hasOptions = this.options.length > 0 || this.displayIfEmpty;

        // console.log(`Has options? ${this.hasOptions} displayIfEmpty: ${this.displayIfEmpty}`);

        this.postOptionLoadProcessing();

        this.optionLoadComplete.emit(new MFOptionsChanged(this.name, this.options.length));

        this.loaded = true;
    }

    postOptionLoadProcessing(): void { }

    onControlValidityChange(event: MFControlValidityChange): void {
        this.checkControlStatus();
    }

}
