import { Injectable } from '@angular/core';
import { MetaForm, MFQuestion, MFControl, MFSection, MFValidator, MFValidatorAsync } from './meta-form';
import { throwError, queueScheduler, Observable, Subject } from 'rxjs';
import { MetaFormDrawType, MetaFormControlType, MetaFormOptionType } from './meta-form-enums';
import { HttpClient } from '@angular/common/http';
import { IMetaFormV1 } from './serialisation/v1.interfaces';
import { Meta } from '@angular/platform-browser';
import { BusinessRuleService } from './business-rule.service';

@Injectable({
    providedIn: 'root'
})
export class MetaFormService {

    constructor(private http: HttpClient) { }

    createForm(name: string, title: string, drawType?: MetaFormDrawType): MetaForm {
        const form = MetaForm.create(name, drawType ?? MetaFormDrawType.EntireForm);

        form.title = title;
        // form.addSection('Default');

        return form;
    }

    loadFormWithName(formUrl: string, name: string): Observable<MetaForm> {
        const subject = new Subject<MetaForm>();

        this.http.get(`${formUrl}/${name}`)
            .subscribe(
                (data: IMetaFormV1) => {
                    // console.log(`Got data from ${formUrl}/${name}:`, data);

                    const form = new MetaForm();
                    form.name = data.name;
                    form.title = data.title;
                    form.version = data.version;
                    form.drawType = data.drawType;
                    form.dataSource = data.dataSource;
                    form.dateModified = data.dateModified;

                    for (const s of data.sections) {
                        form.addSection(s.title);
                    }

                    for (const q of data.questions) {
                        const fq = form.addQuestion(q.name, q.caption, q.captionFootnote, q.controlLayout);
                        fq.sectionId = q.sectionId;
                        fq.ruleToMatch = q.ruleToMatch;
                        for (const c of q.controls) {
                            let fc: MFControl;
                            switch (c.controlType) {
                                case MetaFormControlType.Text:
                                    fc = fq.addTextControl(c.name, c.textType, c.maxLength, c.placeholder);
                                    break;
                                case MetaFormControlType.Label:
                                    fq.addLabel(c.text);
                                    break;
                                case MetaFormControlType.Date:
                                    fc = fq.addDateControl(c.name, c.dateType, c.start, c.end);
                                    break;
                                case MetaFormControlType.Time:
                                    fc = fq.addTimeControl(c.name, c.minuteStep, c.hourStart, c.hourEnd);
                                    break;
                                case MetaFormControlType.Option:
                                    fc = fq.addOptionControl(c.name, c.optionType, c.options);
                                    break;
                                default:
                                    console.warn(`Missing type: ${c.controlType}, name: ${c.name}`);
                                    break;
                            }

                            for (const v of c.validators) {
                                switch (v.type) {
                                    case 'Required':
                                        fc.addValidator(MFValidator.Required(v.message));
                                        break;
                                    case 'Email':
                                        fc.addValidator(MFValidator.Email(v.message));
                                        break;
                                    case 'Date':
                                        fc.addValidator(MFValidator.Date(v.message));
                                        break;
                                    case 'Time':
                                        fc.addValidator(MFValidator.Time(v.message));
                                        break;
                                    case 'AnswerMustMatch':
                                        fc.addValidator(MFValidator.AnswerMustMatch(v.value, v.message));
                                        break;
                                    case 'AnswerAfterDate':
                                        fc.addValidator(MFValidator.AnswerAfterDate(v.value, v.message));
                                        break;
                                    case 'AnswerBeforeDate':
                                        fc.addValidator(MFValidator.AnswerBeforeDate(v.value, v.message));
                                        break;
                                    case 'AnswerAfterTime':
                                        fc.addValidator(MFValidator.AnswerAfterTime(v.value, v.message));
                                        break;
                                    case 'AnswerBeforeTime':
                                        fc.addValidator(MFValidator.AnswerBeforeTime(v.value, v.message));
                                        break;
                                    default:
                                        console.warn(`Got validator of type: ${v.type}`);
                                }
                            }
                            if (c.validatorsAsync) {

                                for (const va of c.validatorsAsync) {
                                    switch (va.type) {
                                        case 'Async':
                                            fc.addValidatorAsync(MFValidatorAsync.AsyncValidator(this.http, va.url, va.message));
                                            break;
                                        default:
                                            console.warn(`Got async validator of type: ${va.type}`);
                                    }

                                }
                            }
                        }
                    }

                    // console.log(`Form is now: ${JSON.stringify(form, null, 2)}`);

                    subject.next(form);
                });

        return subject;
    }

    getNextQuestionToDisplay(form: MetaForm, ruleService: BusinessRuleService, lastItem: number): DisplayQuestion {
        let dq: DisplayQuestion;

        // the last question displayed was 'lastQuestion'. since we are going
        // forwards from there, increment to find the first available question
        // and check whether it can be displayed

        if (!form.questions || form.questions.length === 0) {
            throwError(`The form ${form.name} does not have any questions`);
        }

        if (form.drawType === MetaFormDrawType.SingleQuestion) {
            dq = this.getSingleQuestion(form, ruleService, lastItem);
        } else if (form.drawType === MetaFormDrawType.SingleSection) {
            dq = this.getQuestionsInSection(form, lastItem);
        } else if (form.drawType === MetaFormDrawType.EntireForm) {
            dq = this.getQuestionsInForm(form);
        }

        this.checkDisplayQuestionControlStatus(form, dq);

        return dq;
    }

    getPreviousQuestionToDisplay(form: MetaForm, ruleService: BusinessRuleService, lastItem: number): DisplayQuestion {
        let dq: DisplayQuestion;

        // the last question displayed was 'lastQuestion'. since we are going
        // backwards from there, decrement to find the first available question
        // and check whether it can be displayed

        if (!form.questions || form.questions.length === 0) {
            throwError(`The form ${form.name} does not have any questions`);
        }

        if (form.drawType === MetaFormDrawType.SingleQuestion) {
            dq = this.getSingleQuestion(form, ruleService, lastItem, -1);
        } else if (form.drawType === MetaFormDrawType.SingleSection) {
            dq = this.getQuestionsInSection(form, lastItem, -1);
        } else if (form.drawType === MetaFormDrawType.EntireForm) {
            dq = this.getQuestionsInForm(form);
        }

        this.checkDisplayQuestionControlStatus(form, dq);

        return dq;
    }

    getSingleQuestion(form: MetaForm, ruleService: BusinessRuleService, lastQuestion: number, direction: number = 1): DisplayQuestion {
        // Get the next question; simples
        const dq = new DisplayQuestion();

        const startQuestion = lastQuestion;
        let found = false;
        let currentQuestion = lastQuestion + direction;
        let question: MFQuestion;
        let controlCount = 0;

        // console.log(`Starting with question ${currentQuestion}`);
        while (!found && (direction > 0 && currentQuestion < form.questions.length || direction < 0 && currentQuestion > -1)) {
            question = form.questions[currentQuestion];
            // console.log(`Checking question ${currentQuestion}`);
            if (!question.ruleToMatch || ruleService.evaluateRule(question.ruleToMatch, form.answers)) {
                // console.log(`Question matches`);
                dq.questions.push(question);
                controlCount += question.controls.length;
                found = true;
            } else {
                // console.log(`Question does not match, stepping ${direction}`);
                currentQuestion += direction;
            }
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
        dq.atEnd = true;
        dq.atStart = true;

        return dq;
    }

    // Load option values from a passed URL
    // This must be complete. If you need authentication or
    // other headers added, ensure that your HttpInterceptor
    // is adding those by default.
    //
    // https://example.com/path/to/resource[fieldName1]?param=[fieldName2]
    loadOptionsFromUrl(form: MetaForm, url: string) {
        return this.http.get(url);
    }

    // TODO(Ian): If two controls have the same name, this fails!
    // must autogenerate an id (and hide it using the Json Replacer function)
    private checkDisplayQuestionControlStatus(form: MetaForm, dq: DisplayQuestion) {
        dq.controlStatus = new Map<string, boolean>();
        for (const q of dq.questions) {
            for (const c of q.controls) {
                const valid = c.isValid(form, false);
                // console.log(`Setting control/valid: ${c.name}=${valid}`);
                c.controlId = `${q.name}:${c.name}`;
                dq.controlStatus.set(c.controlId, valid);
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
