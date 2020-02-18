import { Component, OnInit, Input, Output } from '@angular/core';
import { MFControl, MFTextControl, MetaForm, MFControlValidityChange } from '../meta-form';
import { MetaFormService } from '../meta-form.service';
import { MetaFormTextType } from '../meta-form-enums';

import { FormControl } from '@angular/forms';
import { EventEmitter } from '@angular/core';

@Component({
    selector: 'app-mf-text',
    templateUrl: './mf-text.component.html',
    styleUrls: ['./mf-text.component.css']
})
export class MetaFormTextComponent implements OnInit {

    @Input() form: MetaForm;
    @Input() control: MFControl;

    @Output() changeValidity: EventEmitter<MFControlValidityChange> = new EventEmitter<MFControlValidityChange>();

    formControl: FormControl;
    name: string;
    placeholder: string;
    autocomplete: string;
    maxLength: number;
    textType: string;

    inError = false;

    constructor(private mfService: MetaFormService) { }

    ngOnInit(): void {

        this.formControl = new FormControl('');
        if (this.control) {
            const textControl = this.control as MFTextControl;
            this.name = this.control.name;
            this.autocomplete = this.control.autocomplete;

            this.placeholder = textControl.placeholder;
            this.maxLength = textControl.maxLength ?? 0;

            switch (textControl.textType) {
                case MetaFormTextType.SingleLine:
                    this.textType = 'text';
                    break;
                case MetaFormTextType.Password:
                    this.textType = 'password';
                    break;
                case MetaFormTextType.Email:
                    this.textType = 'email';
                    break;
                default:
                    this.textType = 'text';
                    break;
            }

            this.formControl.setValue(this.form.getValue(this.name));

            this.formControl.valueChanges.subscribe(obs => {
                this.form.setValue(this.control.name, obs);
                this.checkControlStatus();
            });

            this.form.change.subscribe(data => {
                if (data.name === this.name) {
                    this.checkControlStatus();
                }
            });
        }
    }

    onFocusLost() {
        // console.log(`Focus lost: ${this.control.name}`);
        this.checkControlStatus();
    }

    private checkControlStatus() {
        this.inError = !this.control.isValid(this.form);
        this.changeValidity.emit(new MFControlValidityChange(this.control.name, !this.inError));
    }

}
