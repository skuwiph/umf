import { Component, OnInit, Input, Output } from '@angular/core';
import { MFControl, MFTextControl, MetaForm, MFControlValidityChange } from '../meta-form';
import { MetaFormService } from '../meta-form.service';
import { MetaFormTextType } from '../meta-form-enums';

import { FormControl } from '@angular/forms';
import { EventEmitter } from '@angular/core';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MetaFormControlBase } from './mf-control-base';

@Component({
    selector: 'app-mf-text',
    template: `<input [ngClass]="{ 'error': inError }" [formControl]="formControl" class="mfc mf-control-item"
     type="{{textType}}" name="{{name}}" autocomplete="{{autocomplete}}" placeholder="{{placeholder}}"
      maxLength="{{maxLength}}" (blur)="onFocusLost()">`,
    styleUrls: ['./mf.components.css']
})
export class MetaFormTextComponent extends MetaFormControlBase implements OnInit {

    formControl: FormControl;
    placeholder: string;
    autocomplete: string;
    maxLength: number;
    textType: string;

    constructor(private formService: MetaFormService) { super(); }

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

            this.formControl.valueChanges
                .pipe(
                    debounceTime(250),
                    distinctUntilChanged()
                ).subscribe(obs => {
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
}
