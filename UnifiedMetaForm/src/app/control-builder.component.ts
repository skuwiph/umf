import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, ViewChild } from '@angular/core';
import {
    MFQuestion, MFOptionValue, MFControl, MetaForm, MFLabel, MFValidator,
    MFHtmlTextControl, MFTextControl, MFOptions
} from './metaform/meta-form';
import { MetaFormTextType, MetaFormControlType, MetaFormOptionType } from './metaform/meta-form-enums';
import { MetaFormUserEvent, MetaFormUserEventType, MetaFormDisplayComponent } from './metaform/ui/metaform-display.component';
import { EventEmitter } from '@angular/core';

@Component({
    selector: 'app-control-builder',
    templateUrl: './control-builder.component.html',
    styleUrls: ['./control-builder.component.css']
})
export class ControlBuilderComponent implements OnInit, OnChanges {

    // Control edit form

    @ViewChild('controlMetaForm')
    private controlDisplay: MetaFormDisplayComponent;

    controlEditForm: MetaForm;
    controlForm: CurrentControlForm;
    controlEditFormIsValid = false;

    // Control add
    possibleControls: MFOptionValue[] = [];
    selectedControlType: string;
    noSelectedControl = true;

    // tslint:disable-next-line: variable-name
    private _control: MFControl;

    @Input() question: MFQuestion;
    @Input()
    set control(value: MFControl) {
        // if (value) {
        //     console.log(`Got control: ${value.name}`);
        //     if (this.control !== value) {
        //         console.log(`current value doesn't match stored value`);
        //     }
        // }
        this._control = value;

        if (!this._control) {
            return;
        }

        // Update and or refresh control edit form
        if (this._control.controlType === MetaFormControlType.Label) {
            this.controlForm = new LabelEditForm();
        }

        if (this._control.controlType === MetaFormControlType.Html) {
            this.controlForm = new HtmlEditForm();
        }

        if (this._control.controlType === MetaFormControlType.Text) {
            this.controlForm = new TextEditForm();
        }

        if (this.controlForm) {
            console.log(`Setting control form`);
            this.controlEditForm = this.controlForm.createFromControl(this._control);
            if (this.controlDisplay) {
                this.controlDisplay.refreshCurrentDisplay();
            }
        }
        return;
    }
    get control(): MFControl {
        return this._control;
    }

    @Output() controlUpdated = new EventEmitter<boolean>();

    constructor() { }

    ngOnInit(): void {

        this.possibleControls = [
            { code: '-', description: '' },
            { code: '0', description: 'Label' },
            { code: '1', description: 'Html' },
            { code: '2', description: 'Text' },
            { code: '3', description: 'Option' },
            { code: '4', description: 'OptionMulti' },
            { code: '5', description: 'Date' },
            { code: '6', description: 'Time' },
            { code: '7', description: 'TelephoneAndIddCode' },
            { code: '8', description: 'Toggle' }
        ];

        if (this.question) {
            this.refresh();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.control) {

        }
    }

    refresh(): void {
        console.log(`refresh! selected control is: ${this._control?.name}`);
    }

    controlChange(event) {
        // console.log(`event: ${event}`);
        this.selectedControlType = event;
        this.noSelectedControl = event === '';
    }

    addSelectedControl() {
        // console.log(`Add: ${this.selectedControlType}`);
        const ql = this.question.controls.length;

        switch (this.selectedControlType) {
            case '0':
                this.question.addLabel('New Label');
                break;
            case '1':
                this.question.addHtml('New <b>html</b> Control');
                break;
            case '2':
                this.question.addTextControl(`text${ql}`, MetaFormTextType.SingleLine, 0, 'Placeholder');
                break;
            case '3':
                this.question.addOptionControl(`option${ql}`, MetaFormOptionType.SingleSelect, MFOptions.OptionFromList([], 'none selected', true));
                break;
        }
    }

    selectedControlChange(e: MetaFormUserEvent): void {
        if (e.event === MetaFormUserEventType.FormInvalid || e.event === MetaFormUserEventType.FormValid) {
            this.controlEditFormIsValid = e.event === MetaFormUserEventType.FormValid;
        }
    }

    updateSelectedControl(): void {
        if (this.controlForm) {
            // console.log(`Updating control: Old question:`, this.question);
            this.controlForm.update(this.controlEditForm, this._control);
            // console.log(`Updating control: new question?:`, this.question);
        }
        this.controlUpdated.emit(true);
    }

    cancelChanges(): void {
        console.log(`Cancel`);
    }
}

export abstract class CurrentControlForm {
    createFromControl(control: MFControl): MetaForm { return null; }
    update(form: MetaForm, control: MFControl): void { }
}

export class LabelEditForm extends CurrentControlForm {
    createFromControl(control: MFControl): MetaForm {
        const label = control as MFLabel;
        const form = MetaForm.create('editLabel');

        form.addQuestion('qlabel', 'Label')
            .addTextControl('name', MetaFormTextType.SingleLine, 150, 'Name')
            .addValidator(MFValidator.Required('Name is required'));
        form.getQuestion('qlabel')
            .addTextControl('text', MetaFormTextType.SingleLine, 250, 'Label Text')
            .addValidator(MFValidator.Required('Label text is required'));

        form.setValue('name', label.name);
        form.setValue('text', label.text);

        return form;
    }

    update(form: MetaForm, control: MFControl): void {
        const labelControl = control as MFLabel;
        // console.log(`Updating label: ${JSON.stringify(labelControl, null, 2)}`);

        labelControl.name = form.getValue('name');
        labelControl.text = form.getValue('text');

        // console.log(`Updated label: ${JSON.stringify(labelControl, null, 2)}`);
    }
}

export class HtmlEditForm extends CurrentControlForm {
    createFromControl(control: MFControl): MetaForm {
        const c = control as MFHtmlTextControl;
        const form = MetaForm.create('editHtml');

        form.addQuestion('qlabel', 'HtmlText')
            .addTextControl('name', MetaFormTextType.SingleLine, 150, 'Name')
            .addValidator(MFValidator.Required('Name is required'));
        form.getQuestion('qlabel')
            .addTextControl('html', MetaFormTextType.MultiLine, 500, 'Html Text')
            .addValidator(MFValidator.Required('Html text is required'));

        form.setValue('name', c.name);
        form.setValue('html', c.html);

        return form;
    }

    update(form: MetaForm, control: MFControl): void {
        const c = control as MFHtmlTextControl;
        c.name = form.getValue('name');
        c.html = form.getValue('html');
    }
}


export class TextEditForm extends CurrentControlForm {
    // textTypes
    textTypes: MFOptionValue[] = [
        { code: '0', description: 'SingleLine' },
        { code: '1', description: 'MultiLine' },
        { code: '2', description: 'Password' },
        { code: '3', description: 'Email' },
        { code: '4', description: 'URI' },
        { code: '5', description: 'TelephoneNumber' },
        { code: '6', description: 'PostalCode' },
        { code: '7', description: 'Numeric' }
    ];

    createFromControl(control: MFControl): MetaForm {
        const c = control as MFTextControl;
        const form = MetaForm.create('editText');

        form.addQuestion('tlabel', 'Text')
            .addTextControl('name', MetaFormTextType.SingleLine, 150, 'Name')
            .addValidator(MFValidator.Required('Name is required'));
        form.getQuestion('tlabel')
            .addTextControl('placeholder', MetaFormTextType.SingleLine, 50, 'Placeholder text');
        form.getQuestion('tlabel')
            .addTextControl('maxLength', MetaFormTextType.Numeric, 3, 'Max Length');
        form.getQuestion('tlabel')
            .addOptionControl('textType', MetaFormOptionType.SingleSelect, MFOptions.OptionFromList(this.textTypes, 'Please Select', false))
            .addValidator(MFValidator.Required('Please select'));

        form.setValue('name', c.name);
        form.setValue('maxLength', `${c.maxLength}`);
        form.setValue('placeholder', c.placeholder);
        form.setValue('textType', `${c.textType}`);

        return form;
    }

    update(form: MetaForm, control: MFControl): void {
        const c = control as MFTextControl;
        c.name = form.getValue('name');
        c.placeholder = form.getValue('placeholder');
        c.maxLength = parseInt(form.getValue('maxLength'), 10) ?? 0;
    }
}