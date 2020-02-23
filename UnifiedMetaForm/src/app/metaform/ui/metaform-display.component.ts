
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { MetaForm, MFQuestion, MFValueChange, MFValueRequired, MFControlValidityChange, MFControl } from '../meta-form';
import { MetaFormService, DisplayQuestion } from '../meta-form.service';

@Component({
    selector: 'app-metaform-display',
    templateUrl: './metaform-display.component.html',
    styleUrls: ['./metaform-display.component.css']
})
export class MetaFormDisplayComponent implements OnInit, OnDestroy {

    constructor(private formService: MetaFormService) { }

    @Input() form: MetaForm;

    display: DisplayQuestion;

    currentFormItem = -1;

    pageIsValid = false;
    atEndOfForm = false;
    atStartOfForm = false;

    nextButtonText = 'Next';

    ngOnInit(): void {
        if (!this.form) {
            this.form = MetaForm.create('empty');
        }
        this.form.initialise();
        this.getNextQuestions();

        // console.log(`Form: ${JSON.stringify(this.form, null, 2)}`);

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

    ruleMatches(q: MFQuestion) {
    }

    onControlValidityChange(event: MFControlValidityChange): void {
        this.display.controlStatus.set(event.name, event.valid);
        this.checkPageStatus();
    }

    private getNextQuestions() {
        const result = this.formService.getNextQuestionToDisplay(this.form, this.currentFormItem);
        this.display = result;

        this.checkDisplayQuestions();
    }

    private getPreviousQuestions() {
        const result = this.formService.getPreviousQuestionToDisplay(this.form, this.currentFormItem);
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
            // console.log(`Key: ${key} = ${this.display.controlStatus.get(key)}`);
            if (this.display.controlStatus.get(key)) {
                numberOfPasses++;
            }
        }

        this.pageIsValid = (numberOfPasses === this.display.numberOfControls);
    }
}
