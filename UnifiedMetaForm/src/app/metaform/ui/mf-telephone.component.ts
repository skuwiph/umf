import { Component, OnInit } from '@angular/core';
import { MFTelephoneAndIddControl, IddCode } from '../meta-form';
import { MetaFormService } from '../meta-form.service';

import { FormControl, FormGroup } from '@angular/forms';
import { MetaFormControlBase } from './mf-control-base';

@Component({
    selector: 'app-mf-telephone',
    template: `
<div *ngIf="ro; else edit" class="mf-readonly">
    {{readonlyValue}}
</div>
<ng-template #edit>
    <form [ngClass]="{ 'error': inError }" [formGroup]="formGroup">
        <div class="telephone">
            <select [ngClass]="{ 'error': inError }" formControlName="country" class="mfc idd mf-control-item" (blur)="onFocusLost()">
                <option *ngFor="let tn of iddCodes" value="{{tn.code}}">{{tn.name}} ({{tn.code}})</option>
            </select>
            <input [ngClass]="{ 'error': inError }" formControlName="number" class="mfc telnum mf-control-item"
            type="number" placeholder="{{placeholder}}" maxLength="{{maxLength}}" (blur)="onFocusLost()">
        </div>
    </form>
</ng-template>`,
    styleUrls: ['./mf.components.css']
})
export class MetaFormTelephoneAndIddComponent extends MetaFormControlBase implements OnInit {

    formGroup: FormGroup;
    placeholder: string;
    maxLength: number;
    iddCodes: IddCode[] = [];

    constructor(private formService: MetaFormService) { super(); }

    ngOnInit(): void {
        if (this.control) {

            const telControl = this.control as MFTelephoneAndIddControl;

            this.formGroup = new FormGroup({
                idd: new FormControl(telControl.getIdd(this.form)),
                number: new FormControl(telControl.getNumber(this.form))
            });

            this.name = this.control.name;

            this.placeholder = telControl.placeholder;
            this.maxLength = telControl.maxLength ?? 0;

            this.iddCodes = IddCode.getIddList();

            this.setReadonlyValue();

            this.formGroup.valueChanges.subscribe(obs => {
                if (obs.idd && obs.number) {
                    const telephoneWithIdd = `${obs.idd}:${obs.number}`;
                    this.form.setValue(this.control.name, telephoneWithIdd);
                } else {
                    this.form.setValue(this.control.name, '');
                }
                this.checkControlStatus();
            });
        }
    }

    protected setReadonlyValue(): void {
        if (this.readonly || this.control.readonly) {
            this.ro = true;
            if (this.control.hasValue(this.form)) {
                const c = this.control as MFTelephoneAndIddControl;
                const idd = c.getIdd(this.form);
                const num = c.getNumber(this.form);

                this.readonlyValue = `${idd} ${num}`;
            } else {
                this.readonlyValue = 'N/A';
            }
        }
    }

}
