import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { throwError, Observable, Subject } from 'rxjs';
import { BusinessRuleService } from './business-rule.service';
import { MetaForm, MFQuestion, MFControl, MFValidator, MFValidatorAsync, MetaFormAnswers, MFSection } from './metaform';
import { MetaFormDrawType, MetaFormControlType } from './metaform-enums';
import { IMetaFormV1 } from './serialisation/v1.interfaces';

@Injectable({
    providedIn: 'root'
})
export class MetaFormService {
    constructor(private http: HttpClient) {}

    // Create a blank form
    createForm(name: string, title: string, drawType?: MetaFormDrawType): MetaForm {
        const form = MetaForm.create(name, drawType ?? MetaFormDrawType.EntireForm);

        form.title = title;

        return form;
    }

    // Load a JSON form structure from the passed URL
    loadFormWithName(formUrl: string, name: string): Observable<MetaForm> {
        const subject = new Subject<MetaForm>();

        this.http.get(`${formUrl}/${name}`).subscribe(
            // TODO: provide a partial implementation
            // with just version number, or some other
            // identifier, then cast to the proper version
            (data: IMetaFormV1) => {
                const form = this.loadMetaForm(data);
                subject.next(form);
            }
        );

        return subject;
    }

    // Heading forward through the questions starting with lastItem (or -1) in the passed form,
    // find all that match the requirements
    getNextQuestionToDisplay(form: MetaForm, ruleService: BusinessRuleService, lastItem: number): DisplayQuestion {
        return this.getDisplayQuestions(form, ruleService, lastItem, 1);
    }

    // Heading backwards through the questions starting with lastItem in the passed form,
    // find all that match the requirements
    getPreviousQuestionToDisplay(form: MetaForm, ruleService: BusinessRuleService, lastItem: number): DisplayQuestion {
        return this.getDisplayQuestions(form, ruleService, lastItem, -1);
    }

    // Get a specific question from the passed form
    getSpecificQuestionToDisplay(form: MetaForm, questionName: string): DisplayQuestion {
        const dq = new DisplayQuestion();
        const question = form.getQuestion(questionName);

        if (question) {
            dq.questions.push(question);

            dq.atStart = true;
            dq.atEnd = true;
            dq.numberOfControls = question.controls.length;
            dq.lastItem = -1;
        }

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

    private getSingleQuestion(
        form: MetaForm,
        ruleService: BusinessRuleService,
        lastQuestion: number,
        direction = 1
    ): DisplayQuestion {
        const dq = new DisplayQuestion();

        let found = false;
        let currentQuestion = lastQuestion + direction;
        let question: MFQuestion;
        let controlCount = 0;

        while (
            !found &&
            ((direction > 0 && currentQuestion < form.questions.length) || (direction < 0 && currentQuestion > -1))
        ) {
            question = form.questions[currentQuestion];
            if (this.isQuestionValidForDisplay(form.answers, question, ruleService)) {
                dq.questions.push(question);
                controlCount += question.controls.length;
                found = true;
            } else {
                currentQuestion += direction;
            }
        }

        // We have to continue in the same direction in case the question
        // we found was the last (or first) available
        const atStart = this.findQuestionBoundary(form, ruleService, currentQuestion, -1) < 0;
        const atEnd = this.findQuestionBoundary(form, ruleService, currentQuestion, +1) >= form.questions.length;

        dq.atEnd = atEnd;
        dq.atStart = atStart;
        dq.numberOfControls = controlCount;

        dq.lastItem = currentQuestion;

        return dq;
    }

    private getQuestionsInSection(
        form: MetaForm,
        ruleService: BusinessRuleService,
        lastSection: number,
        direction = 1
    ): DisplayQuestion {
        let activeSection: MFSection;
        let checkSection = 0;
        let found = false;

        console.log(`lastSection: ${lastSection}, checking ${lastSection + direction}`);

        checkSection = lastSection + direction;
        while (
            !found &&
            ((direction > 0 && checkSection < form.sections.length) || (direction < 0 && checkSection > -1))
        ) {
            const currentSection = form.sections[checkSection];
            console.log(`Check ${currentSection.title}`);
            if (this.isSectionValidForDisplay(form.answers, currentSection, ruleService)) {
                console.log(`Section ${currentSection.title} passes rule ${currentSection.ruleToMatch}`);
                activeSection = currentSection;
                found = true;
            } else {
                checkSection += direction;
            }
        }

        const atStart = this.findSectionBoundary(form, ruleService, checkSection, -1) < 0;
        const atEnd = this.findSectionBoundary(form, ruleService, checkSection, 1) >= form.sections.length;

        const dq = this.getQuestionsForSection(form, activeSection);

        dq.lastItem = checkSection;
        dq.atStart = atStart;
        dq.atEnd = atEnd;
        return dq;
    }

    private findQuestionBoundary(
        form: MetaForm,
        ruleService: BusinessRuleService,
        startQuestion: number,
        direction: number
    ): number {
        let boundary = direction < 0 ? -1 : form.questions.length;
        let found = false;
        let outOfBounds = false;
        let current = startQuestion + direction;

        if (current < 0 || current >= form.questions.length) {
            return boundary;
        }

        // From 'startQuestion' backwards or forwards, is there a valid question?
        // Or do we got out of bounds in the 'direction' of travel?
        do {
            const question = form.questions[current];
            if (this.isQuestionValidForDisplay(form.answers, question, ruleService)) {
                found = true;
                break;
            } else {
                current += direction;
                outOfBounds = current < 0;
            }
        } while (!found && !outOfBounds);

        boundary = current;

        return boundary;
    }

    private findSectionBoundary(
        form: MetaForm,
        ruleService: BusinessRuleService,
        startSection: number,
        direction: number
    ): number {
        let boundary = direction < 0 ? -1 : form.sections.length;
        let found = false;
        let outOfBounds = false;
        let current = startSection + direction;

        if (current < 0 || current >= form.sections.length) {
            return boundary;
        }

        // From 'startSection' backwards or forwards, is there a valid section?
        // Or do we got out of bounds in the 'direction' of travel?
        do {
            const section = form.sections[current];
            if (this.isSectionValidForDisplay(form.answers, section, ruleService)) {
                found = true;
                break;
            } else {
                current += direction;
                outOfBounds = current < 0;
            }
        } while (!found && !outOfBounds);

        boundary = current;

        return boundary;
    }

    private isQuestionValidForDisplay(
        answers: MetaFormAnswers,
        question: MFQuestion,
        ruleService: BusinessRuleService
    ): boolean {
        return !question.ruleToMatch || ruleService.evaluateRule(question.ruleToMatch, answers);
    }

    private isSectionValidForDisplay(
        answers: MetaFormAnswers,
        section: MFSection,
        ruleService: BusinessRuleService
    ): boolean {
        return !section.ruleToMatch || ruleService.evaluateRule(section.ruleToMatch, answers);
    }

    private getQuestionsForSection(form: MetaForm, section: MFSection): DisplayQuestion {
        const dq = new DisplayQuestion();
        let controlCount = 0;

        if (section) {
            const questionsInSection = form.questions?.filter(q => q.sectionId === section.id);
            dq.questions = questionsInSection.slice();

            for (const q of dq.questions) {
                controlCount += q.controls.length;
            }
        }

        dq.numberOfControls = controlCount;

        return dq;
    }

    private getQuestionsInForm(form: MetaForm): DisplayQuestion {
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

    private getDisplayQuestions(
        form: MetaForm,
        ruleService: BusinessRuleService,
        lastItem: number,
        direction: number
    ): DisplayQuestion {
        let dq: DisplayQuestion;

        if (!form.questions || form.questions.length === 0) {
            throwError(`The form ${form.name} does not have any questions`);
        }

        if (form.drawType === MetaFormDrawType.SingleQuestion) {
            dq = this.getSingleQuestion(form, ruleService, lastItem, direction);
        } else if (form.drawType === MetaFormDrawType.SingleSection) {
            dq = this.getQuestionsInSection(form, ruleService, lastItem, direction);
        } else if (form.drawType === MetaFormDrawType.EntireForm) {
            dq = this.getQuestionsInForm(form);
        }

        this.checkDisplayQuestionControlStatus(form, dq);

        return dq;
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

    private loadMetaForm(data: IMetaFormV1): MetaForm {
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
                        fc = fq.addDateControl(c.name, c.dateType);
                        break;
                    case MetaFormControlType.Time:
                        fc = fq.addTimeControl(c.name, c.minuteStep, c.hourStart, c.hourEnd);
                        break;
                    case MetaFormControlType.Option:
                        fc = fq.addOptionControl(c.name, c.options);
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
                        case 'ExceedWordCount':
                            fc.addValidator(MFValidator.AnswerMustExceedWordCount(parseInt(v.value, 10), v.message));
                            break;
                        default:
                            console.warn(`Got validator of type: ${v.type} and NO implementation`);
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
        return form;
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
