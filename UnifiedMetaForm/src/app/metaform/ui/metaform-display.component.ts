
import { Component, OnInit, Input, ElementRef, AfterViewInit } from '@angular/core';
import { BusinessRuleService } from '../business-rule.service';
import { MetaFormService, DisplayQuestion } from '../meta-form.service';
import { MetaFormDrawType } from '../meta-form-enums';
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

    display: DisplayQuestion;

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
        this.setFocusOnFirstControl();
    }

    previousPage() {
        this.getPreviousQuestions();
    }

    nextPage() {
        if (this.atEndOfForm) {
            console.log(`Submitting data: ${JSON.stringify(this.form.answers, null, 2)}`);
        } else {
            this.getNextQuestions();
        }
    }

    displayIf(q: MFQuestion): boolean {
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
        this.display.controlStatus.set(event.name, event.valid);
        this.checkPageStatus();
    }

    optionLoadComplete(q: MFQuestion, c: MFControl, change: MFOptionsChanged) {
        console.log(`${c.name} has changed ${change.countOfOptions}`);
        q.available = this.form.hasOptions(q);
        this.checkPageStatus();
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
    }

    private setFocusOnFirstControl(): void {
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
