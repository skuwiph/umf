import { Component, OnInit, Input, ElementRef, AfterViewInit, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';

import { BusinessRuleService } from '../business-rule.service';
import { MetaFormService, DisplayQuestion } from '../meta-form.service';
import { MetaFormDrawType, MetaFormControlType } from '../meta-form-enums';
import { MetaForm, MFQuestion, MFControlValidityChange, MFControl, MFOptionsChanged } from '../meta-form';

@Component({
    selector: 'app-metaform-display',
    templateUrl: './metaform-display.component.html',
    styleUrls: ['./metaform-display.component.css']
})
export class MetaFormDisplayComponent implements OnInit, AfterViewInit {

    constructor(
        private el: ElementRef,
        private formService: MetaFormService,
        private ruleService: BusinessRuleService) { }

    @Input() form: MetaForm;
    @Input() showButtons = false;
    @Input() preventFocus = false;
    @Input() alwaysShowOptions = false;
    @Output() formEvent: EventEmitter<MetaFormUserEvent> = new EventEmitter<MetaFormUserEvent>();
    @Output() questionSelected: EventEmitter<MFQuestion> = new EventEmitter<MFQuestion>();
    @Output() controlSelected: EventEmitter<ControlSelectedEvent> = new EventEmitter<ControlSelectedEvent>();

    display: DisplayQuestion;
    controlType = MetaFormControlType;

    currentFormItem = -1;

    pageIsValid = false;
    atEndOfForm = false;
    atStartOfForm = false;

    nextButtonText = 'Next';

    questionAvailable: Map<string, boolean> = new Map<string, boolean>();

    ngOnInit(): void {
        if (!this.form) {
            this.form = MetaForm.create('empty');
        }

        this.form.initialise();
        this.getNextQuestions();
    }

    ngAfterViewInit(): void {
        this.formEvent.emit(new MetaFormUserEvent(MetaFormUserEventType.FormInitialised, this.form));

        this.setFocusOnFirstControl();
    }

    previousPage() {
        this.getPreviousQuestions();
    }

    nextPage() {
        if (this.atEndOfForm) {
            console.log(`Submitting data: ${JSON.stringify(this.form.answers, null, 2)}`);

            this.formEvent.emit(new MetaFormUserEvent(MetaFormUserEventType.FormSubmit, this.form));
        } else {
            this.getNextQuestions();
        }
    }

    displayIf(q: MFQuestion): boolean {
        // console.log(`q.canBeDisplayed() ${q.canBeDisplayed()} && this.ruleMatches(q) ${this.ruleMatches(q)} && q.available ${q.available}`);
        return q.canBeDisplayed() && this.ruleMatches(q) && q.available;
    }

    ruleMatches(question: MFQuestion): boolean {
        // Don't bother asking for a single-question form
        if (this.form.drawType === MetaFormDrawType.SingleQuestion || !question.ruleToMatch) {
            return true;
        }

        if (this.ruleService) {
            const rule = this.ruleService.getRule(question.ruleToMatch);
            if (rule) {
                return rule.evaluate(this.form.answers);
            }
        }

        return false;
    }

    onControlValidityChange(event: MFControlValidityChange): void {
        if (!this.display.controlStatus) {
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
            const result = this.formService.getNextQuestionToDisplay(this.form, this.ruleService, this.currentFormItem - 1);
            this.display = result;

            this.checkDisplayQuestions();
            // console.log(`Refreshed`, this.display.questions);
        }, 100);
    }

    questionClicked(event, q: MFQuestion): void {
        this.questionSelected.emit(q);
        event.stopPropagation();
    }

    controlClicked(event, q: MFQuestion, c: MFControl): void {
        this.controlSelected.emit(new ControlSelectedEvent(q, c));
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
            this.nextButtonText = 'Submit';
        } else {
            this.nextButtonText = 'Next ᐅ';
        }

        this.questionAvailable.clear();
        for (const q of this.display.questions) {
            this.questionAvailable.set(q.name, true);
        }

        this.checkPageStatus();

        this.setFocusOnFirstControl();
    }

    private checkPageStatus() {
        let numberOfPasses = 0;

        // Check page validity
        for (const [key, value] of this.display.controlStatus) {
            if (this.display.controlStatus.get(key)) {
                numberOfPasses++;
            }
        }

        this.pageIsValid = (numberOfPasses === this.display.numberOfControls);

        this.formEvent.emit(
            new MetaFormUserEvent(
                this.pageIsValid ? MetaFormUserEventType.FormValid : MetaFormUserEventType.FormInvalid,
                this.form));
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
}

export class MetaFormUserEvent {
    event: MetaFormUserEventType;
    form: MetaForm;
    constructor(event: MetaFormUserEventType, form: MetaForm) {
        this.event = event;
        this.form = form;
    }
}

export enum MetaFormUserEventType {
    FormInitialised,
    FormInvalid,
    FormValid,
    FormSubmit
}

export class ControlSelectedEvent {
    question: MFQuestion;
    control: MFControl;
    constructor(q: MFQuestion, c: MFControl) {
        this.question = q;
        this.control = c;
    }
}
