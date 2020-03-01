import { Component, OnInit, ViewChild } from '@angular/core';
import { MetaForm, MFQuestion, MFValidator, MFOptions, MFOptionValue, MFControl } from './metaform/meta-form';
import {
    MetaFormUserEvent, MetaFormUserEventType, MetaFormDisplayComponent,
    ControlSelectedEvent
} from './metaform/ui/metaform-display.component';
import { MetaFormDrawType, MetaFormTextType, MetaFormOptionType } from './metaform/meta-form-enums';
import { ControlBuilderComponent } from './control-builder.component';

@Component({
    selector: 'app-form-builder',
    templateUrl: './form-builder.component.html',
    styleUrls: ['./form-builder.component.css']
})
export class FormBuilderComponent implements OnInit {

    constructor() { }

    @ViewChild('mainForm')
    private formDisplay: MetaFormDisplayComponent;

    @ViewChild('questionForm')
    private questionDisplay: MetaFormDisplayComponent;

    @ViewChild(ControlBuilderComponent)
    private controlDisplay: ControlBuilderComponent;

    form: MetaForm;

    // Question edit
    selectedQuestionForm: MetaForm;

    selectedQuestion: MFQuestion;
    selectedControl: MFControl;

    canUpdateQuestion = false;

    ngOnInit(): void {
        this.form = MetaForm.create('temp', MetaFormDrawType.EntireForm);
    }

    questionSelected(question: MFQuestion): void {
        console.log(`Question selected: ${question.name}`);
        if (this.selectedQuestionForm && this.selectedQuestion !== question) {
            this.selectedQuestion = null;
            this.selectedQuestionForm = null;
            this.selectedControl = null;
        }

        this.displayQuestionOrControl(question);
    }

    controlSelected(cse: ControlSelectedEvent): void {
        console.log(`Control selected ${cse.control.name}`);
        if (this.selectedQuestion !== cse.question) {
            console.log(`Hide old question`);
        }

        this.displayQuestionOrControl(cse.question, cse.control);
        // this.selectedControl = control;
    }

    private displayQuestionOrControl(question: MFQuestion, control?: MFControl): void {

        setTimeout(() => {
            this.selectedQuestionForm = QuestionEditForm.create(question);
            this.selectedQuestion = question;

            if (this.questionDisplay) {
                this.questionDisplay.refreshCurrentDisplay();
            }

            if (control && this.selectedControl !== control) {
                console.log(`Got control too: ${control.name}`);
                this.selectedControl = control;
                this.controlDisplay.refresh();
            }
        }, 250);

    }

    formChange(event: MetaFormUserEvent): void {
        if (event.event === MetaFormUserEventType.FormSubmit) {
            console.log(`Form submit process: ${JSON.stringify(event.form.answers, null, 2)}`);
        }
    }

    addQuestion(): void {
        this.form.addQuestion(`test_${this.form.questions?.length ?? 0}`, `Test Question Text #${this.form.questions?.length ?? 0}`);
        this.formDisplay.refreshCurrentDisplay();
    }

    selectedQuestionChange(event: MetaFormUserEvent): void {
        if (event.event === MetaFormUserEventType.FormInvalid || event.event === MetaFormUserEventType.FormValid) {
            this.canUpdateQuestion = event.event === MetaFormUserEventType.FormValid;
        }
    }

    updateQuestion(): void {
        const q = this.selectedQuestion;
        q.name = this.selectedQuestionForm.getValue('name');
        q.caption = this.selectedQuestionForm.getValue('caption');
        q.captionFootnote = this.selectedQuestionForm.getValue('captionFootnote');
        let rule = this.selectedQuestionForm.getValue('ruleToMatch');
        if (rule === '--') {
            rule = undefined;
        }
        q.ruleToMatch = rule;
        this.controlDisplay.refresh();
    }

    controlUpdate(event) {
        console.log(`A control was updated!`, this.form);
        this.formDisplay.refreshCurrentDisplay();
    }
}

export class QuestionEditForm {
    static create(from: MFQuestion): MetaForm {
        const form = MetaForm.create('editQuestion', MetaFormDrawType.EntireForm);


        form.addQuestion('question', 'Question Details')
            .addTextControl('name', MetaFormTextType.SingleLine, 150, 'Name')
            .addValidator(MFValidator.Required('Name required'));

        form.getQuestion('question')
            .addTextControl('caption', MetaFormTextType.MultiLine, 150, 'Caption')
            .addValidator(MFValidator.Required('Caption required'));

        form.getQuestion('question')
            .addTextControl('captionFootnote', MetaFormTextType.MultiLine, 500, 'Footnote');

        const rls: MFOptionValue[] = [{ code: '--', description: 'No rule requirement' }];

        form.getQuestion('question')
            .addOptionControl('ruleToMatch', MetaFormOptionType.SingleSelect,
                MFOptions.OptionFromList(rls, null, false));

        form.answers.setValue('name', from.name);
        form.answers.setValue('caption', from.caption);
        form.answers.setValue('captionFootnote', from.captionFootnote);
        // form.answers.setValue('ruleToMatch', from.ruleToMatch ?? '');

        return form;
    }
}

export class ControlEditForm {
    static create(from: MFControl, controlTypes: MFOptionValue[]): MetaForm {
        const form = MetaForm.create('editControl', MetaFormDrawType.EntireForm);

        form.addQuestion('control', 'Control Details')
            .addOptionControl('controlType', MetaFormOptionType.SingleSelect,
                MFOptions.OptionFromList(controlTypes, 'Please Select', false))
            .addValidator(MFValidator.Required('Please select'));

        return form;
    }
}
