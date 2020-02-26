import { Input, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { MetaForm, MFControl, MFControlValidityChange } from '../meta-form';

export abstract class MetaFormControlBase {
    @Input() form: MetaForm;
    @Input() control: MFControl;
    @Output() changeValidity: EventEmitter<MFControlValidityChange> = new EventEmitter<MFControlValidityChange>();

    name: string;
    inError = false;

    constructor() { }

    onFocusLost() {
        // console.log(`Focus lost: ${this.control.name}`);
        this.checkControlStatus();
    }

    protected checkControlStatus(updateStatus = true) {
        let error = !this.control.isValid(this.form, updateStatus);
        if (!error) {
            this.control.isValidAsync(this.form).subscribe(
                (valid: boolean) => {
                    // console.log(`async validator finished: ${valid}`);
                    error = !valid;
                    this.changeValidity.emit(new MFControlValidityChange(this.control.controlId, !error));
                }
            );
        }
        this.changeValidity.emit(new MFControlValidityChange(this.control.controlId, !error));

        if (updateStatus) {
            this.inError = error;
        }
    }
}
