import { Input, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { MetaForm, MFControl, MFControlValidityChange } from '../meta-form';

export abstract class MetaFormControlBase {
    @Input() form: MetaForm;
    @Input() control: MFControl;
    @Input() readonly = false;
    @Output() changeValidity: EventEmitter<MFControlValidityChange> = new EventEmitter<MFControlValidityChange>();

    name: string;
    inError = false;

    ro = false;
    readonlyValue: string;

    constructor() { }

    onFocusLost() {
        this.checkControlStatus();
    }

    protected setReadonlyValue(): void { }

    protected checkControlStatus(updateStatus = true) {
        let error = !this.control.isValid(this.form, updateStatus);
        if (!error) {
            this.control.isValidAsync(this.form).subscribe(
                (valid: boolean) => {
                    // console.log(`async validator finished: ${valid}`);
                    error = !valid;
                    this.changeValidity.emit(new MFControlValidityChange(this.control.controlId, !error));

                    if (updateStatus) {
                        this.inError = error;
                    }

                    return;
                }
            );
        }

        this.changeValidity.emit(new MFControlValidityChange(this.control.controlId, !error));

        if (updateStatus) {
            this.inError = error;
        }
    }
}
