
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { MetaForm, MFQuestion, MFValueChange, MFValueRequired, MFControlValidityChange, MFControl } from '../meta-form';
import { MetaFormService, DisplayQuestion } from '../meta-form.service';
import { BusinessRule } from '../business-rule';
import { BusinessRuleService } from '../business-rule.service';
import { MetaFormDrawType } from '../meta-form-enums';

@Component({
    selector: 'app-metaform-display',
    templateUrl: './metaform-display.component.html',
    styleUrls: ['./metaform-display.component.css']
})
export class MetaFormDisplayComponent implements OnInit, OnDestroy {

    constructor(private formService: MetaFormService, private ruleService: BusinessRuleService) { }

    @Input() form: MetaForm;

    display: DisplayQuestion;

    currentFormItem = -1;

    pageIsValid = false;
    atEndOfForm = false;
    atStartOfForm = false;

    nextButtonText = 'Next';

    ngOnInit(): void {
        // console.log(`Init: ${this.currentFormItem}`);
        if (!this.form) {
            this.form = MetaForm.create('empty');
        }

        this.form.initialise();
        this.getNextQuestions();

        // console.log(`Form: ${this.form.toJson()}`);

        // this.form.change.subscribe((chg: MFValueChange) => {
        //     console.log(`Changed: ${chg.name}`);
        // });

    }

    ngOnDestroy(): void {
        // NOTE(Ian): Check whether this should be unsubscribed here
        if (this.form) {
            // console.log(`onDestroy`);
            // this.form.change?.unsubscribe();
        }
    }

    previousPage() {
        // console.log(`Clicked previous page`);
        this.getPreviousQuestions();
    }

    nextPage() {
        // console.log(`Clicked next page`);
        this.getNextQuestions();
        // console.log(`Back from getQuestionstoDisplay`);
    }

    ruleMatches(question: MFQuestion): boolean {
        // Don't bother asking for a single-question form

        if (this.form.drawType === MetaFormDrawType.SingleQuestion || !question.ruleToMatch) {
            return true;
        }

        if (this.ruleService) {
            const rule = this.ruleService.getRule(question.ruleToMatch);
            if (!rule) {
                console.log(`I didn't find the rule ${question.ruleToMatch}`);
            } else {
                console.log(`Got rule ${rule.name}`);
            }
            return rule.evaluate(this.form.answers);
        }

        return false;
    }

    onControlValidityChange(event: MFControlValidityChange): void {
        this.display.controlStatus.set(event.name, event.valid);
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
        this.checkPageStatus();
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
}
