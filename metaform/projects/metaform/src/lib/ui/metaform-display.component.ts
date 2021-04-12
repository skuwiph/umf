import { Component, OnInit, Input, ElementRef, AfterViewInit, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';

import { BusinessRuleService } from '../business-rule.service';
import { MetaFormService, DisplayQuestion } from '../metaform.service';
import { MetaFormControlType } from '../metaform-enums';
import { MetaForm, MFQuestion, MFControlValidityChange, MFControl } from '../metaform';
import { MFOptionsChanged } from '../metaform-data';

@Component({
    selector: 'lib-metaform-display',
    templateUrl: './metaform-display.component.html',
    styleUrls: ['./metaform-display.component.css']
})
export class MetaFormDisplayComponent implements OnInit, AfterViewInit {
    constructor(
        private el: ElementRef,
        private formService: MetaFormService,
        private ruleService: BusinessRuleService
    ) {}

    @Input() form: MetaForm;
    @Input() showButtons = false;
    @Input() preventFocus = false;
    @Input() alwaysShowOptions = false;
    @Input() nextButtonLabel = 'Next';
    @Input() submitButtonLabel = 'Submit';
    @Input() backButtonLabel = 'ᐊ';

    @Output() formEvent: EventEmitter<MetaFormUserEvent> = new EventEmitter<MetaFormUserEvent>();

    display: DisplayQuestion;
    controlType = MetaFormControlType;

    currentFormItem = -1;

    pageIsValid = false;
    atEndOfForm = false;
    atStartOfForm = false;
    nextButtonText: string;
    lastFormStatus = UserEventType.None;

    ngOnInit(): void {
        if (!this.form) {
            this.form = MetaForm.create('empty');
        }

        this.form.initialise();
        this.getNextQuestions();
    }

    ngAfterViewInit(): void {
        this.sendFormEvent(UserEventType.FormInitialised);

        this.setFocusOnFirstControl();
    }

    previousPage() {
        this.sendFormEvent(UserEventType.NavigationButtonClickedBack);
        this.getPreviousQuestions();
    }

    nextPage() {
        if (this.atEndOfForm) {
            this.sendFormEvent(UserEventType.FormSubmit);
        } else {
            this.sendFormEvent(UserEventType.NavigationButtonClickedForward);
            this.getNextQuestions();
        }
    }

    displayIf(q: MFQuestion): boolean {
        return q.canBeDisplayed() && this.ruleMatches(q) && q.available;
    }

    ruleMatches(question: MFQuestion): boolean {
        return this.form.ruleMatches(question, this.ruleService.rules);
    }

    onControlValidityChange(event: MFControlValidityChange): void {
        // console.log(`onControlValidityChange: ${JSON.stringify(event)}`);
        if (!this.display.controlStatus) {
            // console.log(`Not updating control status`);
            return;
        }
        this.display.controlStatus.set(event.name, event.valid);
        this.checkPageStatus();
    }

    optionLoadComplete(q: MFQuestion, c: MFControl, change: MFOptionsChanged) {
        // console.log(`${c.name} has changed ${change.countOfOptions}`);
        setTimeout(() => {
            q.available = this.alwaysShowOptions || this.form.hasOptions(q);
            this.checkPageStatus();
        }, 250);
    }

    refreshCurrentDisplay() {
        // console.log(`Refreshing`);
        this.display = null;

        setTimeout(() => {
            const result = this.formService.getNextQuestionToDisplay(
                this.form,
                this.ruleService,
                this.currentFormItem - 1
            );
            this.display = result;

            this.checkDisplayQuestions();
            // console.log(`Refreshed`, this.display.questions);
        }, 100);
    }

    questionClicked(event, q: MFQuestion): void {
        this.formEvent.emit(MetaFormUserEvent.QuestionClickedEvent(this.form, q));
        event.stopPropagation();
    }

    controlClicked(event, q: MFQuestion, c: MFControl): void {
        this.formEvent.emit(MetaFormUserEvent.ControlClickedEvent(this.form, c));
        event.stopPropagation();
    }

    private getNextQuestions() {
        const result = this.formService.getNextQuestionToDisplay(this.form, this.ruleService, this.currentFormItem);
        this.display = result;

        this.checkDisplayQuestions();
    }

    private getPreviousQuestions() {
        const result = this.formService.getPreviousQuestionToDisplay(this.form, this.ruleService, this.currentFormItem);
        this.display = result;

        this.checkDisplayQuestions();
    }

    private checkDisplayQuestions() {
        this.atEndOfForm = this.display.atEnd;
        this.atStartOfForm = this.display.atStart;
        this.currentFormItem = this.display.lastItem;
        if (this.atEndOfForm) {
            this.nextButtonText = this.submitButtonLabel;
        } else {
            this.nextButtonText = this.nextButtonLabel;
        }

        this.checkPageStatus();
        this.setFocusOnFirstControl();
    }

    private checkPageStatus() {
        this.pageIsValid = this.form.areQuestionsValid(this.display.questions, false);
        this.sendFormEvent(this.pageIsValid ? UserEventType.FormValid : UserEventType.FormInvalid);
    }

    private setFocusOnFirstControl(): void {
        if (!this.preventFocus) {
            setTimeout(() => {
                // We're not manipulating the DOM, so I'm not too
                // bothered about this. However, willing to be proved
                // wrong and to have a more 'angular' way of doing this!
                const firstControl = this.el.nativeElement.querySelectorAll('.mfc');
                if (firstControl && firstControl.length > 0) {
                    firstControl[0].focus();
                }
            }, 250);
        }
    }

    private sendFormEvent(type: UserEventType) {
        // Be helpful to clients; don't send anything prior to form initialised
        if (this.lastFormStatus === UserEventType.None && type !== UserEventType.FormInitialised) {
            return;
        }

        this.formEvent.emit(new MetaFormUserEvent(type, this.form));
        this.lastFormStatus = type;
    }
}

export class MetaFormUserEvent {
    type: UserEventType;
    form: MetaForm;
    question?: MFQuestion;
    control?: MFControl;
    constructor(type: UserEventType, form: MetaForm) {
        this.type = type;
        this.form = form;
    }

    static QuestionClickedEvent(form: MetaForm, q: MFQuestion): MetaFormUserEvent {
        const e = new MetaFormUserEvent(UserEventType.QuestionSelected, form);
        e.question = q;
        return e;
    }

    static ControlClickedEvent(form: MetaForm, c: MFControl): MetaFormUserEvent {
        const e = new MetaFormUserEvent(UserEventType.ControlSelected, form);
        e.control = c;
        return e;
    }
}

export enum UserEventType {
    None,
    FormInitialised,
    FormInvalid,
    FormValid,
    FormSubmit,
    QuestionSelected,
    ControlSelected,
    NavigationButtonClickedBack,
    NavigationButtonClickedForward
}

export class ControlSelectedEvent {
    question: MFQuestion;
    control: MFControl;
    constructor(q: MFQuestion, c: MFControl) {
        this.question = q;
        this.control = c;
    }
}
