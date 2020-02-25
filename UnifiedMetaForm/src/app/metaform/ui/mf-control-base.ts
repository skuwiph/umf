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

    protected checkControlStatus() {
        this.inError = !this.control.isValid(this.form);
        if (!this.inError) {
            this.control.isValidAsync(this.form).subscribe(
                (valid: boolean) => {
                    // console.log(`async validator finished: ${valid}`);
                    this.inError = !valid;
                    this.changeValidity.emit(new MFControlValidityChange(this.control.controlId, !this.inError));
                }
            );
        }
        this.changeValidity.emit(new MFControlValidityChange(this.control.controlId, !this.inError));
    }
}
