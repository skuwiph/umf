import { Component, OnInit, Input, Output } from '@angular/core';
import { MFControl, MetaForm, MFControlValidityChange, MFDateControl } from '../meta-form';
import { MetaFormService } from '../meta-form.service';
import { MetaFormDateType } from '../meta-form-enums';

import { FormControl, FormGroup } from '@angular/forms';
import { EventEmitter } from '@angular/core';

@Component({
    selector: 'app-mf-date',
    templateUrl: './mf-date.component.html',
    styleUrls: ['./mf-date.component.css']
})
export class MetaFormDateComponent implements OnInit {

    @Input() form: MetaForm;
    @Input() control: MFControl;

    @Output() changeValidity: EventEmitter<MFControlValidityChange> = new EventEmitter<MFControlValidityChange>();

    formGroup: FormGroup;

    name: string;
    dateType: string;

    inError = false;

    monthList: string[];

    constructor(private mfService: MetaFormService) { }

    ngOnInit(): void {

        if (this.control) {
            const dateControl = this.control as MFDateControl;
            this.name = this.control.name;

            switch (dateControl.dateType) {
                case MetaFormDateType.Full:
                    this.dateType = 'full';
                    this.formGroup = new FormGroup({
                        dd: new FormControl(dateControl.getDay(this.form)),
                        mm: new FormControl(dateControl.getMonth(this.form)),
                        yyyy: new FormControl(dateControl.getYear(this.form))
                    });
                    this.formGroup.valueChanges.subscribe(obs => {
                        if (obs.yyyy && obs.mm && obs.dd) {
                            const date = `${obs.yyyy}-${obs.mm}-${obs.dd}`;
                            this.form.setValue(this.control.name, date);
                        } else {
                            this.form.setValue(this.control.name, '');
                        }
                        this.checkControlStatus();
                    });
                    break;
                case MetaFormDateType.MonthYear:
                    this.dateType = 'short';
                    this.monthList = dateControl.getMonthNames();

                    let month = dateControl.getMonth(this.form);
                    if (!month || month.length === 0) {
                        month = '0';
                    }

                    this.formGroup = new FormGroup({
                        month: new FormControl(month),
                        yyyy: new FormControl(dateControl.getYear(this.form))
                    });

                    this.formGroup.valueChanges.subscribe(obs => {
                        if (obs.yyyy && obs.month && +obs.month > 0) {
                            const date = `${obs.yyyy}-${obs.month}`;
                            this.form.setValue(this.control.name, date);
                        } else {
                            this.form.setValue(this.control.name, '');
                        }
                        this.checkControlStatus();
                    });
                    break;
                default:
                    this.dateType = 'full';
                    break;
            }

        }
    }

    onFocusLost() {
        // console.log(`Focus lost: ${this.control.name}`);
        this.checkControlStatus();
    }

    private checkControlStatus() {
        this.inError = !this.control.isValid(this.form);
        if (!this.inError) {
            this.control.isValidAsync(this.form).subscribe(
                (valid: boolean) => {
                    // console.log(`async validator finished: ${valid}`);
                    this.inError = !valid;
                    this.changeValidity.emit(new MFControlValidityChange(this.control.name, !this.inError));
                }
            );
        }
        this.changeValidity.emit(new MFControlValidityChange(this.control.name, !this.inError));
    }
}
