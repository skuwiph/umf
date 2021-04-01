import { Input, Output, Directive, ChangeDetectorRef } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { MetaForm, MFControl, MFControlValidityChange } from '../metaform';

@Directive()
export abstract class MetaFormControlBase {
    @Input() form: MetaForm;
    @Input() control: MFControl;
    @Input() readonly = false;
    @Output() changeValidity: EventEmitter<MFControlValidityChange> = new EventEmitter<MFControlValidityChange>();

    name: string;
    labelText: string;

    inError = false;

    ro = false;
    readonlyValue: string;

    constructor() {}

    onFocusLost() {
        this.checkControlStatus();
    }

    protected setReadonlyValue(): void {}

    protected checkControlStatus(updateStatus = true) {
        let error = !this.control.isValid(this.form, updateStatus);
        if (!error) {
            this.control.isValidAsync(this.form, true).subscribe((valid: boolean) => {
                // console.log(`async validator finished: ${valid}: ${this.control.errorMessage}`);
                error = !valid;
                this.changeValidity.emit(
                    new MFControlValidityChange(this.control.controlId, !error, this.control.errorMessage)
                );

                if (updateStatus) {
                    this.inError = error;
                }

                return;
            });
        }

        this.changeValidity.emit(
            new MFControlValidityChange(this.control.controlId, !error, this.control.errorMessage)
        );

        if (updateStatus) {
            this.inError = error;
        }
    }
}
