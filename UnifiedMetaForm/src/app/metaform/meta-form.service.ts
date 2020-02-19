import { Injectable } from '@angular/core';
import { MetaForm, MFQuestion, MFControl, MFSection } from './meta-form';
import { throwError } from 'rxjs';
import { MetaFormDrawType } from './meta-form-enums';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class MetaFormService {

    constructor(private http: HttpClient) { }

    createForm(name: string, title: string, drawType?: MetaFormDrawType): MetaForm {
        const form = MetaForm.create(name, drawType ?? MetaFormDrawType.EntireForm);

        form.title = title;
        form.addSection('Default');

        return form;
    }

    loadFormWithName(name: string): MetaForm {
        const form = new MetaForm();

        return form;
    }

    getNextQuestionToDisplay(form: MetaForm, lastItem: number): DisplayQuestion {
        let dq: DisplayQuestion;

        // the last question displayed was 'lastQuestion'. since we are going
        // forwards from there, increment to find the first available question
        // and check whether it can be displayed

        if (!form.questions || form.questions.length === 0) {
            throwError(`The form ${form.name} does not have any questions`);
        }

        if (form.drawType === MetaFormDrawType.SingleQuestion) {
            dq = this.getSingleQuestion(form, lastItem);
        } else if (form.drawType === MetaFormDrawType.SingleSection) {
            dq = this.getQuestionsInSection(form, lastItem);
        } else if (form.drawType === MetaFormDrawType.EntireForm) {
            dq = this.getQuestionsInForm(form);
        }

        this.checkDisplayQuestionControlStatus(form, dq);

        return dq;
    }

    getPreviousQuestionToDisplay(form: MetaForm, lastItem: number): DisplayQuestion {
        let dq: DisplayQuestion;

        // the last question displayed was 'lastQuestion'. since we are going
        // backwards from there, decrement to find the first available question
        // and check whether it can be displayed

        if (!form.questions || form.questions.length === 0) {
            throwError(`The form ${form.name} does not have any questions`);
        }

        if (form.drawType === MetaFormDrawType.SingleQuestion) {
            dq = this.getSingleQuestion(form, lastItem, -1);
        } else if (form.drawType === MetaFormDrawType.SingleSection) {
            dq = this.getQuestionsInSection(form, lastItem, -1);
        } else if (form.drawType === MetaFormDrawType.EntireForm) {
            dq = this.getQuestionsInForm(form);
        }

        this.checkDisplayQuestionControlStatus(form, dq);

        return dq;
    }

    getSingleQuestion(form: MetaForm, lastQuestion: number, direction: number = 1): DisplayQuestion {
        // Get the next question; simples
        const dq = new DisplayQuestion();

        const startQuestion = lastQuestion;
        const currentQuestion = lastQuestion + direction;
        let question: MFQuestion;
        let controlCount = 0;

        if (direction > 0 && currentQuestion < form.questions.length || direction < 0 && currentQuestion > -1) {
            question = form.questions[currentQuestion];

            dq.questions.push(question);
            controlCount += question.controls.length;
        }

        dq.atEnd = currentQuestion === form.questions.length - 1;
        dq.atStart = currentQuestion === 0;
        dq.numberOfControls = controlCount;

        dq.lastItem = currentQuestion;

        return dq;
    }

    getQuestionsInSection(form: MetaForm, lastSection: number, direction: number = 1): DisplayQuestion {
        const dq = new DisplayQuestion();

        let checkSection = 0;
        if (lastSection <= 0) {
            lastSection = 0;
        }

        checkSection = lastSection + 1;
        let controlCount = 0;

        for (const s of form.sections) {
            if (s.id === checkSection) {
                const questionsInSection = form.questions?.filter(q => q.sectionId === checkSection);
                dq.questions = questionsInSection.slice();

                for (const q of dq.questions) {
                    controlCount += q.controls.length;
                }
                break;
            }
        }

        dq.lastItem = checkSection;
        dq.numberOfControls = controlCount;

        return dq;
    }

    getQuestionsInForm(form: MetaForm): DisplayQuestion {
        const dq = new DisplayQuestion();

        let controlCount = 0;

        dq.questions = form.questions.slice();

        for (const q of dq.questions) {
            controlCount += q.controls.length;
        }

        dq.lastItem = 1;
        dq.numberOfControls = controlCount;

        return dq;
    }

    // Load option values from a passed URL
    // This must be complete. If you need authentication or
    // other headers added, ensure that your HttpInterceptor 
    // is adding those by default.
    //
    // https://example.com/path/to/resource%fieldName1%?param=%fieldName2%
    loadOptionsFromUrl(form: MetaForm, url: string) {
        const hasReplacements = url.indexOf('%') > -1;

        if (hasReplacements) {

        }

        return this.http.get(url);
    }

    private checkDisplayQuestionControlStatus(form: MetaForm, dq: DisplayQuestion) {
        dq.controlStatus = new Map<string, boolean>();
        for (const q of dq.questions) {
            for (const c of q.controls) {
                const valid = c.isValid(form, false);
                // console.log(`Setting control/valid: ${c.name}=${valid}`);
                dq.controlStatus.set(c.name, valid);
            }
        }
    }

}

export class DisplayQuestion {
    lastItem: number;
    atStart = false;
    atEnd = false;

    controlStatus: Map<string, boolean>;
    questions: MFQuestion[] = [];
    numberOfControls: number;
}
