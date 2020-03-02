import { Component, OnInit } from '@angular/core';
import { MFTextControl } from '../meta-form';
import { MetaFormService } from '../meta-form.service';
import { MetaFormTextType } from '../meta-form-enums';

import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MetaFormControlBase } from './mf-control-base';

@Component({
    selector: 'app-mf-text',
    template: `
<div *ngIf="ro; else edit" class="mf-readonly">
    {{readonlyValue}}
</div>
<ng-template #edit>
    <ng-container *ngIf="textType == 'multi'; else single">
        <textarea [ngClass]="{ 'error': inError }" [formControl]="formControl" class="mfc mf-control-item-multi"
        name="{{name}}" placeholder="{{placeholder}}"
        maxLength="{{maxLength}}" (blur)="onFocusLost()"></textarea>
    </ng-container>
    <ng-template #single>
        <input [ngClass]="{ 'error': inError }" [formControl]="formControl" class="mfc mf-control-item"
        type="{{textType}}" name="{{name}}" autocomplete="{{autocomplete}}" placeholder="{{placeholder}}"
        maxLength="{{maxLength}}" (blur)="onFocusLost()">
    </ng-template>
</ng-template>`,
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

            this.setReadonlyValue();

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
                case MetaFormTextType.MultiLine:
                    this.textType = 'multi';
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

    protected setReadonlyValue(): void {
        if (this.readonly || this.control.readonly) {
            this.ro = true;
            if (this.control.hasValue(this.form)) {
                const textControl = this.control as MFTextControl;
                switch (textControl.textType) {
                    case MetaFormTextType.SingleLine:
                    case MetaFormTextType.Email:
                    case MetaFormTextType.MultiLine:
                        this.readonlyValue = this.form.getValue(this.control.name);
                        break;
                    case MetaFormTextType.Password:
                        let lenChar = this.form.getValue(this.control.name).length;
                        if (lenChar < 1 || lenChar > 8) {
                            lenChar = 8;
                        }
                        this.readonlyValue = ''.padStart(lenChar, `★`);
                        break;
                }
            } else {
                this.readonlyValue = 'N/A';
            }
        }
    }
}
