import {
    MetaFormDrawType,
    MetaFormTextType,
    MetaFormControlType,
    ControlLayoutStyle,
    MetaFormDateType,
    MetaFormOptionType
} from './meta-form-enums';
import { EventEmitter } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export class MetaForm {
    name: string;
    title: string;
    version: number;
    dateModified: Date;
    dataSource?: string;
    drawType: MetaFormDrawType;
    allowSaves?: boolean;
    sections?: MFSection[];
    questions?: MFQuestion[];

    answers: MetaFormAnswers = new MetaFormAnswers();

    change: EventEmitter<MFValueChange> = new EventEmitter<MFValueChange>();

    static create(name: string, drawType?: MetaFormDrawType): MetaForm {
        const f = new MetaForm();
        f.name = name;
        f.drawType = drawType ?? MetaFormDrawType.EntireForm;
        f.version = 1;
        f.allowSaves = false;
        f.dateModified = new Date();
        f.sections = [];
        f.questions = [];

        return f;
    }

    static isFieldReference(value: string): { isField: boolean, fieldName: string } {
        if (value.startsWith('[')) {
            return { isField: true, fieldName: value.substr(1, value.length - 2) };
        } else {
            return { isField: false, fieldName: undefined };
        }
    }

    static isVariable(valueToCheck: string): { isVariable: boolean, value: string } {
        if (valueToCheck.startsWith('%')) {
            // Extract the variable name
            return { isVariable: true, value: valueToCheck.substr(1).toUpperCase() };
        } else {
            return { isVariable: false, value: undefined };
        }
    }

    // Initialise the form ready for use
    initialise() {
        // Firstly, find all field references and dependencies
        for (const q of this.questions) {
            for (const c of q.controls) {
                // A reference is required when a validator
                // from one control checks against another
                if (c.references) {
                    for (const name of c.references) {
                        this.addReference(c.name, name);
                    }
                }

                // A dependency is triggered by data having
                // to come from another question or control
                if (c.dependencies) {
                    for (const name of c.dependencies) {
                        this.addReference(c.name, name);
                    }
                }

                this.determineQuestionDisplay(q, c.dependencies);
            }
        }
    }

    determineQuestionDisplay(question: MFQuestion, dependencies: string[]): void {
        question.canBeDisplayed = () => {
            for (const c of question.controls) {
                if (dependencies) {
                    for (const dep of c.dependencies) {
                        if (!this.getValue(dep)) {
                            return false;
                        }
                    }
                }
            }

            return true;
        };
    }

    hasOptions(question: MFQuestion): boolean {
        for (const c of question.controls) {
            if (c.controlType === MetaFormControlType.Option) {
                const opt = c as MFOptionControl;
                return opt.hasAvailableOptions;
            }
        }
        return true;
    }

    addSection(title: string): MetaForm {
        if (!this.sections) {
            this.sections = [];
        }

        const s = new MFSection();
        s.id = this.sections.length + 1;
        s.title = title;

        this.sections.push(s);

        return this;
    }

    addQuestion(name: string, caption: string, footnote?: string, layout?: ControlLayoutStyle): MFQuestion {
        const q = new MFQuestion();
        q.controls = [];
        q.controlLayout = layout ?? ControlLayoutStyle.Vertical;
        q.captionFootnote = footnote;

        this.pushQuestion(q, name, caption);

        return q;
    }

    getQuestion(name: string): MFQuestion {
        const checkFor = `q_${name}`;
        for (const q of this.questions) {
            if (q.name === checkFor) {
                return q;
            }
        }

        return null;
    }

    isValid(updateStatus = true): boolean {
        let valid = true;

        for (const q of this.questions) {
            if (!q.isValid(this, updateStatus)) {
                valid = false;
                break;
            }
        }
        return valid;
    }

    getValue(name: string): string {
        return this.answers.getValue(name);
    }

    getValueAsDate(name: string): Date {
        const dateValue = this.answers.getValue(name);
        if (!dateValue || dateValue.length === 0) {
            // console.warn(`Field ${name} doesn't have an entry`);
            return null;
        }
        return this.convertValueToDate(dateValue);
    }

    convertValueToDate(dateValue: string): Date {
        let year = 0;
        let month = 0;
        let day = 1;
        let hh = 12;
        let mm = 30;

        // The date value must be YYYY-MM-DD (10 chars)
        // Or YYYY-M-D or YYYY-MM-D or YYYY-M-DD (8 or 9 chars)
        if (dateValue.length >= 8 && dateValue.length <= 10) {
            const parts = dateValue.split('-');
            year = +parts[0];
            month = +parts[1];
            day = +parts[2];
        }

        // The date value must be YYYY-MM or YYYY-M (6 or 7 chars)
        if (dateValue.length >= 6 && dateValue.length <= 7) {
            const parts = dateValue.split('-');
            year = +parts[0];
            month = +parts[1];
        }

        // The date value should be HH:MM (5 chars)
        if (dateValue.length === 5) {
            const parts = dateValue.split(':');
            hh = +parts[0];
            mm = +parts[1];
        }

        if (hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59) {
            try {
                // Because js uses zero-based months, do some mischief
                if (month > 0) {
                    month--;
                }

                // Basic leap year checking
                const isLeap = (year % 400 === 0) || ((year % 4 === 0) && (year % 100 !== 0));

                // Check february
                if (!isLeap && month === 1 && day > 28) {
                    // console.log(`Month is February, and day is ${day} not correct for not leap year ${year}`);
                    return null;
                }

                if (isLeap && month === 1 && day > 29) {
                    // console.log(`Month is February, and day is ${day} not correct for leap year ${year}`);
                    return null;
                }

                const date = new Date(Date.UTC(year, month, day, hh, mm, 0, 0));

                return date;
            } catch {
                console.error(`Couldn't evaluate date`);
            }
        }

        return null;
    }

    setValue(name: string, value: string) {
        const oldValue = this.answers.getValue(name);

        if (oldValue !== value) {
            this.answers.setValue(name, value);
            console.log(`Emitting value ${name}, '${value}'`);
            this.change.emit(new MFValueChange(name, value));

            // Check for referencing values
            const c = this.getControlByName(name);
            if (c && c.isReferencedBy) {
                for (const referencedBy of c.isReferencedBy) {
                    if (referencedBy) {
                        const r = this.getControlByName(referencedBy);
                        // console.log(`Updating ${r.name}`);
                        r.isValid(this, true);

                        this.change.emit(new MFValueChange(r.name, this.getValue(r.name)));
                    }
                }
            }
        }
    }

    toJson(): string {
        return JSON.stringify(this, metaFormJsonReplacer, 2);
    }

    private pushQuestion(q: MFQuestion, name: string, caption: string) {
        if (!this.questions) {
            this.questions = [];
        }

        if (q.sectionId === 0) {
            if (!this.sections) {
                // We must have a section, so in this case,
                // forace a default.
                this.addSection('Default');
            }
            q.sectionId = this.sections[this.sections.length - 1].id;
        }

        q.name = `q_${name}`;
        q.caption = caption;

        this.questions.push(q);
    }

    private addReference(from: string, to: string) {
        // console.log(`${from} references ${to}`);

        const toControl = this.getControlByName(to);

        if (!toControl.isReferencedBy) {
            toControl.isReferencedBy = [];
        }

        toControl.isReferencedBy.push(from);
    }

    private getControlByName(name: string): MFControl {
        for (const q of this.questions) {
            for (const c of q.controls) {
                if (c.name === name) {
                    return c;
                }
            }
        }
        return null;
    }
}

export class MFQuestion {
    sectionId: number;
    caption: string;
    captionFootnote?: string;
    name: string;
    ruleToMatch?: string;
    animation?: MFAnimation[];
    controls: MFControl[] = [];
    controlLayout: ControlLayoutStyle = ControlLayoutStyle.Horizontal;

    available = true;

    canBeDisplayed = () => true;

    addTextControl(name: string, textType: MetaFormTextType, maxLength?: number, placeholderText?: string): MFControl {
        const c = new MFTextControl();
        c.controlType = MetaFormControlType.Text;
        c.textType = textType;
        c.maxLength = maxLength ?? 0;
        c.placeholder = placeholderText;
        c.name = name;
        c.validators = [];

        this.pushControl(c);

        return c;
    }

    addTelephoneAndIddControl(name: string, maxLength?: number, placeholderText?: string): MFControl {
        const c = new MFTelephoneAndIddControl();
        c.controlType = MetaFormControlType.TelephoneAndIddCode;
        c.name = name;
        c.placeholder = placeholderText;
        c.maxLength = maxLength ?? 0;
        c.validators = [];

        this.pushControl(c);

        return c;
    }

    addDateControl(name: string, dateType: MetaFormDateType, start?: string, end?: string): MFDateControl {
        const c = new MFDateControl();

        c.controlType = MetaFormControlType.Date;
        c.dateType = dateType;
        c.start = start;
        c.end = end;
        c.name = name;
        c.validators = [];

        this.pushControl(c);

        return c;
    }

    addTimeControl(name: string, minuteStep?: number, hourStart?: number, hourEnd?: number): MFTimeControl {
        const c = new MFTimeControl();

        c.controlType = MetaFormControlType.Time;
        c.hourStart = hourStart ?? 0;
        c.hourEnd = hourEnd ?? 23;
        c.minuteStep = minuteStep ?? 1;
        c.name = name;
        c.validators = [];

        this.pushControl(c);

        return c;
    }

    addLabel(text: string): MFQuestion {
        const c = new MFLabelControl();

        c.controlType = MetaFormControlType.Label;
        c.name = `Label`;
        c.text = text;

        this.pushControl(c);

        return this;
    }

    addOptionControl(name: string, optionType: MetaFormOptionType, options?: MFOptions): MFOptionControl {
        const c = new MFOptionControl();

        c.controlType = MetaFormControlType.Option;
        c.optionType = optionType;
        c.options = options;
        c.name = name;
        c.validators = [];

        // Check options for referencing
        if (c.hasUrl) {
            // console.log(`looking for references for ${c.name}`);
            // Find any field references
            const r = c.urlFieldReferences();
            if (r.length > 0) {
                // console.log(`Adding ${r.length} references to ${c.name}`);
                if (!c.dependencies) {
                    c.dependencies = [];
                }
                for (const referencedField of r) {
                    // console.log(`Adding ${referencedField}`);
                    c.dependencies.push(referencedField);
                }
            }
        }

        this.pushControl(c);

        return c;
    }

    setSection(sectionId: number): MFQuestion {
        this.sectionId = sectionId;
        return this;
    }

    setDisplayRule(ruleToMatch: string): MFQuestion {
        this.ruleToMatch = ruleToMatch;
        return this;
    }

    isValid(form: MetaForm, updateStatus = true): boolean {
        let valid = true;

        this.controls.forEach(element => {
            if (!element.isValid(form, updateStatus)) {
                valid = false;
            }
        });

        return valid;
    }

    private pushControl(c: MFControl) {
        this.controls.push(c);
    }
}

export class MFSection {
    id: number;
    title: string;
}

export class MFControl {
    controlType: MetaFormControlType;
    controlId: string;
    name: string;
    validators?: MFValidator[];
    validatorsAsync?: MFValidatorAsync[];

    // NOTE(Ian): Not sure if necessary or wanted
    autocomplete?: string;

    inError = false;
    errorMessage?: string;

    isReferencedBy: string[];
    references: string[];
    dependencies: string[];

    addValidator(validator: MFValidator): MFControl {
        if (!this.validators) {
            this.validators = [];
        }
        this.validators.push(validator);

        if (validator.hasOwnProperty('referencesField')) {
            const reference = validator.referencesField;
            // console.log(`The control ${this.name} also references ${reference}`);
            this.references = reference;
        }

        return this;
    }

    addValidatorAsync(validator: MFValidatorAsync): MFControl {
        if (!this.validatorsAsync) {
            this.validatorsAsync = [];
        }
        this.validatorsAsync.push(validator);

        if (validator.hasOwnProperty('referencesField')) {
            const reference = validator.referencesField;
            // console.log(`The control ${this.name} also references ${reference}`);
            this.references = reference;
        }

        return this;
    }

    isValid(form: MetaForm, updateStatus = true): boolean {
        let valid = true;
        let controlName: string;

        if (this.validators) {
            for (const v of this.validators) {
                if (!v.isValid(form, this)) {
                    // console.warn(`${this.name}: ${v.message}`);
                    valid = false;
                    controlName = this.name;
                    this.errorMessage = v.message;

                    break;
                }
            }
        }

        if (valid) {
            this.errorMessage = undefined;
        }

        if (updateStatus) {
            console.log(`Setting error status on control ${this.name}`);
            this.inError = !valid;
        }

        return valid;
    }

    isValidAsync(form: MetaForm, updateStatus = true): Observable<boolean> {
        const subject = new Subject<boolean>();

        let valid = true;
        let controlName: string;

        if (valid) {
            // Check async
            // console.log('Checking async validators')
            if (this.validatorsAsync) {
                // console.log(`I have async validators`);
                for (const v of this.validatorsAsync) {
                    // console.log(`Checking ${v.type} with url ${v.url}`);
                    v.isValid(form, this).subscribe(
                        r => {
                            // console.log(`${v.url} returned ${JSON.stringify(r)}`);

                            valid = r;
                            if (!valid) {
                                controlName = this.name;
                                this.errorMessage = v.message;
                            }

                            if (valid) {
                                this.errorMessage = undefined;
                            }

                            // console.log(`Setting valid=${valid} on control ${this.name} currently in error: ${this.inError}`);
                            this.inError = !valid;
                            subject.next(r);
                        }
                    );
                }
            }
        }

        return subject;
    }

    refresh(): void {
    }
}

export class MFLabel extends MFControl {
    text: string;
}

export class MFTextControl extends MFControl {
    textType: MetaFormTextType;
    maxLength: number;
    placeholder?: string;
}

export class MFOptionControl extends MFControl {
    optionType: MetaFormOptionType;
    options?: MFOptions;

    optionLayout = ControlLayoutStyle.Vertical;

    get hasOptionList(): boolean {
        return this.options?.list !== null;
    }

    get hasAvailableOptions(): boolean {
        return (this.options?.list && this.options.list.length > 0);
    }

    get hasUrl(): boolean {
        return this.options?.optionSource !== null;
    }

    get optionList(): MFOptionValue[] {
        return this.options?.list;
    }

    get optionUrl(): string {
        return this.options?.optionSource?.url;
    }

    urlForService(form: MetaForm, control: MFControl): string {
        const baseUrl = this.options?.optionSource?.url;
        if (!baseUrl) {
            console.error(`Was asked for an invalid url!`);
            return null;
        }

        if (baseUrl.indexOf('[') === -1) {
            return baseUrl;
        } else {
            let url: string;
            const splits = baseUrl.split('/');
            if (splits.length > 1) {
                url = `${splits[0]}//${splits[2]}/`;
            }

            for (let i = 3; i < splits.length; i++) {
                const f = MetaForm.isFieldReference(splits[i]);

                if (f.isField) {
                    const value = form.getValue(f.fieldName);
                    if (value) {
                        url += `${value}/`;
                    } else {
                        console.warn(`Missing parameter value for URL ${f.fieldName}`);
                        return null;
                    }
                } else {
                    url += `${splits[i]}/`;
                }
            }

            if (url.endsWith('/')) {
                url = url.substr(0, url.length - 1);
            }

            return url;
        }
    }

    urlFieldReferences(): string[] {
        const s = [];
        const baseUrl = this.options?.optionSource?.url;
        if (!baseUrl) {
            return [];
        }

        const splits = baseUrl.split('/');
        for (let i = 3; i < splits.length; i++) {
            const f = MetaForm.isFieldReference(splits[i]);

            if (f.isField) {
                s.push(f.fieldName);
            }
        }

        return s;
    }
}

export class MFDateControl extends MFControl {
    dateType: MetaFormDateType;
    start?: string;
    end?: string;

    getDay(form: MetaForm): string {
        const value = form.getValue(this.name);
        if (value && value.length > 5) {
            const p = value.split('-');
            return p[2];
        }
    }

    getMonth(form: MetaForm): string {
        const value = form.getValue(this.name);
        if (value) {
            const p = value.split('-');
            return p[1];
        }
    }

    getYear(form: MetaForm): string {
        const value = form.getValue(this.name);
        if (value) {
            const p = value.split('-');
            return p[0];
        }
    }

    getMonthNames(): string[] {
        return ['Month', 'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
    }
}

export class MFTimeControl extends MFControl {
    hourStart: number;
    hourEnd: number;
    minuteStep: number;

    getHours(form: MetaForm): string {
        const value = form.getValue(this.name);
        if (value && value.length > 4) {
            return value.substr(0, 2);
        }
    }

    getMinutes(form: MetaForm): string {
        const value = form.getValue(this.name);
        if (value && value.length > 4) {
            return value.substr(3, 2);
        }
    }

    getHourList(): string[] {
        const startHour = this.hourStart;
        const endHour = this.hourEnd;

        const hourList = [];
        for (let h = startHour; h <= endHour; h++) {
            hourList.push(`00${h}`.slice(-2));
        }

        return hourList;
    }

    getMinuteList(): string[] {
        const step = this.minuteStep;
        const minuteList = [];
        for (let m = 0; m <= 59; m += step) {
            minuteList.push(`00${m}`.slice(-2));
        }
        return minuteList;
    }
}

export class MFTelephoneAndIddControl extends MFControl {
    maxLength: number;
    placeholder?: string;
    iddList: IddCode[] = [];


    getIdd(form: MetaForm): string {
        const value = form.getValue(this.name);
        const separator = value?.indexOf(':');
        if (value && separator > -1) {
            return value.substr(0, separator);
        }
    }

    getNumber(form: MetaForm): string {
        const value = form.getValue(this.name);
        const separator = value?.indexOf(':');

        if (value && separator > -1 && separator + 1 < value.length) {
            return value.substr(separator + 1);
        }
    }
}

export class MFLabelControl extends MFControl {
    text: string;
}

export class MFValidator {

    constructor(type: string, message: string) {
        this.type = type;
        this.message = message;
    }
    type: string;
    message: string;
    referencesField: string[];

    static Required(message: string): MFValidator {
        return new MFValueRequired('Required', message);
    }

    static Email(message: string): MFValidator {
        return new MFEmailValidator('Email', message);
    }

    static Date(message: string): MFValidator {
        return new MFDateValidator('Date', message);
    }

    static Time(message: string): MFValidator {
        return new MFDateValidator('Time', message);
    }

    static AnswerMustMatch(matchValue: string, message: string): MFValidator {
        const v = new MFAnswerMustMatch('AnswerMustMatch', message);
        v.value = matchValue;
        v.checkForReference(v.value);
        return v;
    }

    static AnswerAfterDate(minDate: string, message: string): MFDateMustBeAfterValidator {
        const v = new MFDateMustBeAfterValidator('AnswerAfterDate', message);
        v.value = minDate;
        v.checkForReference(v.value);
        return v;
    }

    static AnswerBeforeDate(maxDate: string, message: string): MFDateMustBeAfterValidator {
        const v = new MFDateMustBeBeforeValidator('AnswerBeforeDate', message);
        v.value = maxDate;
        v.checkForReference(v.value);
        return v;
    }

    static AnswerAfterTime(minTime: string, message: string): MFDateMustBeAfterValidator {
        const v = new MFDateMustBeAfterValidator('AnswerAfterTime', message);
        v.value = minTime;
        v.checkForReference(v.value);
        return v;
    }

    static AnswerBeforeTime(maxTime: string, message: string): MFDateMustBeAfterValidator {
        const v = new MFDateMustBeBeforeValidator('AnswerBeforTime', message);
        v.value = maxTime;
        v.checkForReference(v.value);
        return v;
    }

    static AnswerBetween(min: string, max: string, message: string): MFValidator {
        const v = new MFMustBeBetweenValidator('AnswerBetween', message);
        v.min = min;
        v.max = max;
        v.checkForReference(v.min);
        v.checkForReference(v.max);
        return v;
    }

    // Does this validator reference any other fields?
    // This will effect validity checks for other controls
    protected checkForReference(value: string) {
        const r = MetaForm.isFieldReference(value);
        if (r.isField) {
            if (!this.referencesField) {
                this.referencesField = [];
            }
            this.referencesField.push(r.fieldName);
        }
    }

    getAnswerForControl(answers: MetaFormAnswers, valueToCheck: string): string {
        // If the passed 'valueToCheck' starts with a [ or % it is a special value
        const f = MetaForm.isFieldReference(valueToCheck);
        const c = MetaForm.isVariable(valueToCheck);

        if (f.isField) {
            // Extract the field name
            return answers.getValue(f.fieldName);
        } else if (c.isVariable) {
            // Extract the variable name
            return this.unpackVariable(c.value);
        } else {
            // Constant value (as-is)
            return valueToCheck;
        }
    }

    isValid(form: MetaForm, control: MFControl): boolean {
        console.error(`SHOULDN'T BE HERE`);
        return false;
    }

    private unpackVariable(value: string): string {
        if (value.startsWith('TODAY')) {
            const t = new Date();

            // const year = t.getUTCFullYear();
            // const month = t.getUTCMonth();
            // const day = t.getUTCDate();

            // let signValue = 1;
            // let sign = '';
            // let timePeriod = '';
            // let duration = 0;

            // Could just be TODAY, or could be TODAY[+|-]99[D|W|M|Y]
            // if (constantValue.length > 5) {
            //     sign = constantValue.substr(5, 1);

            //     if (sign === '+') {
            //         signValue = 1;
            //     } else if (sign === '-') {
            //         signValue = -1;
            //     }

            //     // snip end off
            //     const durationStart = constantValue.length - 1;
            //     timePeriod = constantValue.substr(durationStart);

            //     // find time period
            //     const time = constantValue.substr(6, durationStart - constantValue.length);

            //     if (timePeriod === 'D') {
            //         duration = this.dayIncrement(+time);
            //     } else if (timePeriod === 'W' )
            // }

            return `${t.getUTCFullYear}-${t.getUTCMonth}-${t.getUTCDate}`;
        }

        return '';
    }

    private dayIncrement(numberOfDays: number): number {
        const incr = numberOfDays * (1000 * 60 * 60 * 24);
        return incr;
    }
}

export class MFValidatorAsync {
    constructor(http: HttpClient, type: string, url: string, message: string) {
        this.http = http;
        this.type = type;
        this.url = url;
        this.message = message;
    }
    http: HttpClient;
    type: string;
    message: string;
    url: string;

    referencesField: string[];

    static AsyncValidator(http: HttpClient, url: string, message: string): MFAsyncValidator {
        const v = new MFAsyncValidator(http, 'Async', url, message);
        return v;
    }

    isValid(form: MetaForm, control: MFControl): Observable<boolean> {
        console.error(`SHOULDN'T BE HERE`);
        return null;
    }

}

export class MFValueRequired extends MFValidator {
    isValid(form: MetaForm, control: MFControl): boolean {
        let valid = false;

        // console.log(`${control.name} = '${form.getValue(control.name)}'`);

        // Does the control have a value?
        if (form.getValue(control.name)?.length > 0) {
            valid = true;
        }

        // Interesting edge case - if this is an option-based
        // control, but we have no options, we assume that the question
        // cannot be displayed and should pass this validator
        if (control.controlType === MetaFormControlType.Option) {
            const opt = control as MFOptionControl;
            if (!opt.hasAvailableOptions) {
                valid = true;
            }
        }

        return valid;
    }
}

export class MFAnswerMustMatch extends MFValidator {
    value: string;

    isValid(form: MetaForm, control: MFControl): boolean {
        let valid = false;

        // the value for 'match' must equal the value
        // stored in the answers for this control
        const answerToCheck = form.getValue(control.name);
        const matchingValue = this.getAnswerForControl(form.answers, this.value);

        valid = answerToCheck === matchingValue;

        return valid;
    }
}

export class MFEmailValidator extends MFValidator {
    // Validates according to the AngularJS Email Validator Regular Expression
    // See: https://github.com/ODAVING/angular/commit/10c9f4cb2016fc070bc7626d2736d9c5b9166989
    // For clarification
    isValid(form: MetaForm, control: MFControl): boolean {
        // tslint:disable-next-line: max-line-length
        const EMAIL_REGEXP = /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;
        const regex = new RegExp(EMAIL_REGEXP);
        let valid = false;

        valid = regex.test(form.getValue(control.name));

        return valid;
    }
}

// Date validation
// NOTE(Ian): Must check locale/timezone changes.
// The date control tries to maintain a safe internal format
// but converting to an actual Date time for validation
// may cause issues.
export class MFDateValidator extends MFValidator {
    isValid(form: MetaForm, control: MFControl): boolean {
        let valid = false;

        const date = form.getValueAsDate(control.name);

        valid = date !== null;

        return valid;
    }
}

export class MFDateMustBeAfterValidator extends MFValidator {
    value: string;

    isValid(form: MetaForm, control: MFControl): boolean {
        let valid = false;

        const answerToCheck = form.getValue(control.name);
        const matchingValue = this.getAnswerForControl(form.answers, this.value);

        const date = form.getValueAsDate(control.name);
        const minDate = form.convertValueToDate(matchingValue);

        // console.log(`is ${date} > ${minDate}?`);

        valid = date > minDate;

        return valid;
    }
}

export class MFDateMustBeBeforeValidator extends MFValidator {
    value: string;

    isValid(form: MetaForm, control: MFControl): boolean {
        let valid = false;

        const answerToCheck = form.getValue(control.name);
        const matchingValue = this.getAnswerForControl(form.answers, this.value);

        const date = form.getValueAsDate(control.name);
        const maxDate = form.convertValueToDate(matchingValue);

        // console.log(`is ${date} < ${maxDate}?`);

        valid = date < maxDate;

        return valid;
    }
}

export class MFMustBeBetweenValidator extends MFValidator {
    min: string;
    max: string;

    isValid(form: MetaForm, control: MFControl): boolean {
        let valid = false;

        const answerToCheck = form.getValue(control.name);
        const minCheck = this.getAnswerForControl(form.answers, this.min);
        const maxCheck = this.getAnswerForControl(form.answers, this.max);

        if (control.controlType === MetaFormControlType.Date
            || control.controlType === MetaFormControlType.Time) {
            valid = this.dateInRange(form, answerToCheck, minCheck, maxCheck);
        } else {
            valid = +answerToCheck > +minCheck && +answerToCheck < +maxCheck;
        }

        return valid;
    }

    private dateInRange(form: MetaForm, check: string, after: string, before: string) {
        let valid = false;

        const checkDate = form.convertValueToDate(check);
        const minDate = form.convertValueToDate(after);
        const maxDate = form.convertValueToDate(before);

        valid = checkDate > minDate && checkDate < maxDate;

        return valid;
    }
}

export class MFAsyncValidator extends MFValidatorAsync {
    url: string;

    isValid(form: MetaForm, control: MFControl): Observable<boolean> {
        const s = new Subject<boolean>();

        this.http
            .post(this.url, { check: form.getValue(control.name) })
            .subscribe((d: MFAsyncValidationResponse) => {
                // console.log(`Data: ${JSON.stringify(d)}`);
                s.next(d.valid);
                s.complete();
            });

        return s;
    }
}

export class MFAnimation {
    event: string;
    name: string;
}

export class MFOptions {
    expandOptions = true;
    nullItem?: string;

    list?: MFOptionValue[];
    optionSource?: MFOptionSource;

    constructor(options?: MFOptionValue[], url?: string, nullItem?: string, expandOptions?: boolean) {
        this.nullItem = nullItem;
        this.list = options;
        this.expandOptions = expandOptions ?? true;
        if (url) {
            this.optionSource = new MFOptionSource(url);
        }
    }

    static OptionFromList(options: MFOptionValue[], nullItem?: string, expandOptions?: boolean): MFOptions {
        const o = new MFOptions(options, null, nullItem, expandOptions);
        return o;
    }

    static OptionFromUrl(url: string, nullItem?: string, expandOptions?: boolean): MFOptions {
        const o = new MFOptions(null, url, nullItem, expandOptions);
        return o;
    }
}

export class MFOptionSource {
    url: string;
    constructor(url: string) {
        this.url = url;
    }
}

export class MFOptionValue {
    code: string;
    description: string;

    constructor(code: string, description: string) {
        this.code = code;
        this.description = description;
    }
}

export class MetaFormAnswers {
    private data: Map<string, any> = new Map<string, any>();

    getValue(name: string): any {
        if (this.data[name.toLowerCase()]) {
            return this.data[name.toLowerCase()];
        }
    }

    setValue(name: string, value: any) {
        this.data[name.toLowerCase()] = value;
    }

}

export class MFValueChange {
    name: string;
    value: string;
    constructor(name: string, value: string) {
        this.name = name;
        this.value = value;
    }
}

export class MFOptionsChanged {
    name: string;
    countOfOptions: number;
    constructor(name: string, count: number) {
        this.name = name;
        this.countOfOptions = count;
    }
}

export class MFControlValidityChange {
    name: string;
    valid: boolean;
    constructor(name: string, valid: boolean) {
        this.name = name;
        this.valid = valid;
    }
}

export class MFAsyncValidationResponse {
    valid: boolean;
}

export class IddCode {
    code: string;
    name: string;

    static getIddList(): IddCode[] {
        return [
            { name: 'Afghanistan', code: '+93' },
            { name: 'Åland Islands', code: '+358 18' },
            { name: 'Albania', code: '+355' },
            { name: 'Algeria', code: '+213' },
            { name: 'American Samoa', code: '+1 684' },
            { name: 'Andorra', code: '+376' },
            { name: 'Angola', code: '+244' },
            { name: 'Anguilla', code: '+1 264' },
            { name: 'Antigua and Barbuda', code: '+1 268' },
            { name: 'Argentina', code: '+54' },
            { name: 'Armenia', code: '+374' },
            { name: 'Aruba', code: '+297' },
            { name: 'Ascension', code: '+247' },
            { name: 'Australia', code: '+61' },
            { name: 'Austria', code: '+43' },
            { name: 'Azerbaijan', code: '+994' },
            { name: 'Bahamas', code: '+1 242' },
            { name: 'Bahrain', code: '+973' },
            { name: 'Bangladesh', code: '+880' },
            { name: 'Barbados', code: '+1 246' },
            { name: 'Barbuda', code: '+1 268' },
            { name: 'Belarus', code: '+375' },
            { name: 'Belgium', code: '+32' },
            { name: 'Belize', code: '+501' },
            { name: 'Benin', code: '+229' },
            { name: 'Bermuda', code: '+1 441' },
            { name: 'Bhutan', code: '+975' },
            { name: 'Bolivia', code: '+591' },
            { name: 'Bonaire', code: '+599 7' },
            { name: 'Bosnia and Herzegovina', code: '+387' },
            { name: 'Botswana', code: '+267' },
            { name: 'Brazil', code: '+55' },
            { name: 'British Indian Ocean Territory', code: '+246' },
            { name: 'British Virgin Islands', code: '+1 284' },
            { name: 'Brunei Darussalam', code: '+673' },
            { name: 'Bulgaria', code: '+359' },
            { name: 'Burkina Faso', code: '+226' },
            { name: 'Burundi', code: '+257' },
            { name: 'Cape Verde', code: '+238' },
            { name: 'Cambodia', code: '+855' },
            { name: 'Cameroon', code: '+237' },
            { name: 'Canada', code: '+1' },
            { name: 'Caribbean Netherlands', code: '+599 3' },
            { name: 'Caribbean Netherlands', code: '+599 4' },
            { name: 'Caribbean Netherlands', code: '+599 7' },
            { name: 'Cayman Islands', code: '+1 345' },
            { name: 'Central African Republic', code: '+236' },
            { name: 'Chad', code: '+235' },
            { name: 'Chatham Island, New Zealand', code: '+64' },
            { name: 'Chile', code: '+56' },
            { name: 'China', code: '+86' },
            { name: 'Christmas Island', code: '+61 89164' },
            { name: 'Cocos (Keeling) Islands', code: '+61 89162' },
            { name: 'Colombia', code: '+57' },
            { name: 'Comoros', code: '+269' },
            { name: 'Congo', code: '+242' },
            { name: 'Congo, Democratic Republic of', code: '+243' },
            { name: 'Cook Islands', code: '+682' },
            { name: 'Costa Rica', code: '+506' },
            { name: 'Ivory Coast', code: '+225' },
            { name: 'Croatia', code: '+385' },
            { name: 'Cuba', code: '+53' },
            { name: 'Curaçao', code: '+599 9' },
            { name: 'Cyprus', code: '+357' },
            { name: 'Czech Republic', code: '+420' },
            { name: 'Denmark', code: '+45' },
            { name: 'Diego Garcia', code: '+246' },
            { name: 'Djibouti', code: '+253' },
            { name: 'Dominica', code: '+1 767' },
            { name: 'Dominican Republic', code: '+1 809' },
            { name: 'Dominican Republic', code: '+1 829' },
            { name: 'Easter Island', code: '+56' },
            { name: 'Ecuador', code: '+593' },
            { name: 'Egypt', code: '+20' },
            { name: 'El Salvador', code: '+503' },
            { name: 'Equatorial Guinea', code: '+240' },
            { name: 'Eritrea', code: '+291' },
            { name: 'Estonia', code: '+372' },
            { name: 'eSwatini', code: '+268' },
            { name: 'Ethiopia', code: '+251' },
            { name: 'Falkland Islands', code: '+500' },
            { name: 'Faroe Islands', code: '+298' },
            { name: 'Fiji', code: '+679' },
            { name: 'Finland', code: '+358' },
            { name: 'France', code: '+33' },
            { name: 'French Antilles', code: '+596' },
            { name: 'French Guiana', code: '+594' },
            { name: 'French Polynesia', code: '+689' },
            { name: 'Gabon', code: '+241' },
            { name: 'Gambia', code: '+220' },
            { name: 'Georgia', code: '+995' },
            { name: 'Germany', code: '+49' },
            { name: 'Ghana', code: '+233' },
            { name: 'Gibraltar', code: '+350' },
            { name: 'Greece', code: '+30' },
            { name: 'Greenland', code: '+299' },
            { name: 'Grenada', code: '+1 473' },
            { name: 'Guadeloupe', code: '+590' },
            { name: 'Guam', code: '+1 671' },
            { name: 'Guatemala', code: '+502' },
            { name: 'Guernsey', code: '+44 1481' },
            { name: 'Guernsey', code: '+44 7781,' },
            { name: 'Guinea', code: '+224' },
            { name: 'Guinea-Bissau', code: '+245' },
            { name: 'Guyana', code: '+592' },
            { name: 'Haiti', code: '+509' },
            { name: 'Honduras', code: '+504' },
            { name: 'Hong Kong', code: '+852' },
            { name: 'Hungary', code: '+36' },
            { name: 'Iceland', code: '+354' },
            { name: 'India', code: '+91' },
            { name: 'Indonesia', code: '+62' },
            { name: 'Iran', code: '+98' },
            { name: 'Iraq', code: '+964' },
            { name: 'Ireland', code: '+353' },
            { name: 'Isle of Man', code: '+44 1624' },
            { name: 'Isle of Man', code: '+44 7524,' },
            { name: 'Israel', code: '+972' },
            { name: 'Italy', code: '+39' },
            { name: 'Jamaica', code: '+1 876' },
            { name: 'Jan Mayen', code: '+47 79' },
            { name: 'Japan', code: '+81' },
            { name: 'Jersey', code: '+44 1534' },
            { name: 'Jordan', code: '+962' },
            { name: 'Kazakhstan', code: '+7 6, +7 7' },
            { name: 'Kenya', code: '+254' },
            { name: 'Kiribati', code: '+686' },
            { name: 'Korea, North', code: '+850' },
            { name: 'Korea, South', code: '+82' },
            { name: 'Kosovo', code: '+383' },
            { name: 'Kuwait', code: '+965' },
            { name: 'Kyrgyzstan', code: '+996' },
            { name: 'Laos', code: '+856' },
            { name: 'Latvia', code: '+371' },
            { name: 'Lebanon', code: '+961' },
            { name: 'Lesotho', code: '+266' },
            { name: 'Liberia', code: '+231' },
            { name: 'Libya', code: '+218' },
            { name: 'Liechtenstein', code: '+423' },
            { name: 'Lithuania', code: '+370' },
            { name: 'Luxembourg', code: '+352' },
            { name: 'Macau', code: '+853' },
            { name: 'Madagascar', code: '+261' },
            { name: 'Malawi', code: '+265' },
            { name: 'Malaysia', code: '+60' },
            { name: 'Maldives', code: '+960' },
            { name: 'Mali', code: '+223' },
            { name: 'Malta', code: '+356' },
            { name: 'Marshall Islands', code: '+692' },
            { name: 'Martinique', code: '+596' },
            { name: 'Mauritania', code: '+222' },
            { name: 'Mauritius', code: '+230' },
            { name: 'Mayotte', code: '+262 269, +262 639' },
            { name: 'Mexico', code: '+52' },
            { name: 'Micronesia', code: '+691' },
            { name: 'Midway Island', code: '+1 808' },
            { name: 'Moldova', code: '+373' },
            { name: 'Monaco', code: '+377' },
            { name: 'Mongolia', code: '+976' },
            { name: 'Montenegro', code: '+382' },
            { name: 'Montserrat', code: '+1 664' },
            { name: 'Morocco', code: '+212' },
            { name: 'Mozambique', code: '+258' },
            { name: 'Myanmar', code: '+95' },
            { name: 'Nagorno-Karabakh', code: '+374 47' },
            { name: 'Nagorno-Karabakh', code: '+374 97' },
            { name: 'Namibia', code: '+264' },
            { name: 'Nauru', code: '+674' },
            { name: 'Nepal', code: '+977' },
            { name: 'Netherlands', code: '+31' },
            { name: 'Nevis', code: '+1 869' },
            { name: 'New Caledonia', code: '+687' },
            { name: 'New Zealand', code: '+64' },
            { name: 'Nicaragua', code: '+505' },
            { name: 'Niger', code: '+227' },
            { name: 'Nigeria', code: '+234' },
            { name: 'Niue', code: '+683' },
            { name: 'Norfolk Island', code: '+672 3' },
            { name: 'North Macedonia', code: '+389' },
            { name: 'Northern Cyprus', code: '+90 392' },
            { name: 'Northern Ireland', code: '+44 28' },
            { name: 'Northern Mariana Islands', code: '+1 670' },
            { name: 'Norway', code: '+47' },
            { name: 'Oman', code: '+968' },
            { name: 'Pakistan', code: '+92' },
            { name: 'Palau', code: '+680' },
            { name: 'Palestine, State of', code: '+970' },
            { name: 'Panama', code: '+507' },
            { name: 'Papua New Guinea', code: '+675' },
            { name: 'Paraguay', code: '+595' },
            { name: 'Peru', code: '+51' },
            { name: 'Philippines', code: '+63' },
            { name: 'Pitcairn Islands', code: '+64' },
            { name: 'Poland', code: '+48' },
            { name: 'Portugal', code: '+351' },
            { name: 'Puerto Rico', code: '+1 787' },
            { name: 'Puerto Rico', code: '+1 939' },
            { name: 'Qatar', code: '+974' },
            { name: 'Réunion', code: '+262' },
            { name: 'Romania', code: '+40' },
            { name: 'Russia', code: '+7' },
            { name: 'Rwanda', code: '+250' },
            { name: 'Saba', code: '+599 4' },
            { name: 'St Barthélemy', code: '+590' },
            { name: 'St Helena', code: '+290' },
            { name: 'St Kitts and Nevis', code: '+1 869' },
            { name: 'St Lucia', code: '+1 758' },
            { name: 'St Martin (France)', code: '+590' },
            { name: 'St Pierre and Miquelon', code: '+508' },
            { name: 'St Vincent and the Grenadines', code: '+1 784' },
            { name: 'Samoa', code: '+685' },
            { name: 'San Marino', code: '+378' },
            { name: 'São Tomé and Príncipe', code: '+239' },
            { name: 'Saudi Arabia', code: '+966' },
            { name: 'Senegal', code: '+221' },
            { name: 'Serbia', code: '+381' },
            { name: 'Seychelles', code: '+248' },
            { name: 'Sierra Leone', code: '+232' },
            { name: 'Singapore', code: '+65' },
            { name: 'Sint Eustatius', code: '+599 3' },
            { name: 'Sint Maarten (Netherlands)', code: '+1 721' },
            { name: 'Slovakia', code: '+421' },
            { name: 'Slovenia', code: '+386' },
            { name: 'Solomon Islands', code: '+677' },
            { name: 'Somalia', code: '+252' },
            { name: 'South Africa', code: '+27' },
            { name: 'South Georgia and South Sandwich', code: '+500' },
            { name: 'South Ossetia', code: '+995 34' },
            { name: 'South Sudan', code: '+211' },
            { name: 'Spain', code: '+34' },
            { name: 'Sri Lanka', code: '+94' },
            { name: 'Sudan', code: '+249' },
            { name: 'Suriname', code: '+597' },
            { name: 'Svalbard', code: '+47 79' },
            { name: 'Sweden', code: '+46' },
            { name: 'Switzerland', code: '+41' },
            { name: 'Syria', code: '+963' },
            { name: 'Taiwan', code: '+886' },
            { name: 'Tajikistan', code: '+992' },
            { name: 'Tanzania', code: '+255' },
            { name: 'Thailand', code: '+66' },
            { name: 'East Timor', code: '+670' },
            { name: 'Togo', code: '+228' },
            { name: 'Tokelau', code: '+690' },
            { name: 'Tonga', code: '+676' },
            { name: 'Transnistria', code: '+373 2' },
            { name: 'Transnistria', code: '+373 5' },
            { name: 'Trinidad and Tobago', code: '+1 868' },
            { name: 'Tristan da Cunha', code: '+290 8' },
            { name: 'Tunisia', code: '+216' },
            { name: 'Turkey', code: '+90' },
            { name: 'Turkmenistan', code: '+993' },
            { name: 'Turks and Caicos', code: '+1 649' },
            { name: 'Tuvalu', code: '+688' },
            { name: 'Uganda', code: '+256' },
            { name: 'Ukraine', code: '+380' },
            { name: 'United Arab Emirates', code: '+971' },
            { name: 'United Kingdom', code: '+44' },
            { name: 'United States', code: '+1' },
            { name: 'Uruguay', code: '+598' },
            { name: 'US Virgin Islands', code: '+1 340' },
            { name: 'Uzbekistan', code: '+998' },
            { name: 'Vanuatu', code: '+678' },
            { name: 'Vatican City State', code: '+39 06 698' },
            { name: 'Venezuela', code: '+58' },
            { name: 'Vietnam', code: '+84' },
            { name: 'Wake Island', code: '+1 808' },
            { name: 'Wallis and Futuna', code: '+681' },
            { name: 'Yemen', code: '+967' },
            { name: 'Zambia', code: '+260' },
            { name: 'Zanzibar', code: '+255 24' },
            { name: 'Zimbabwe', code: '+263' }
        ];
    }
}

function metaFormJsonReplacer(key: string, value: any) {
    switch (key) {
        case 'answers':
        case 'change':
        case 'controlId':
        case 'dependencies':
        case 'errorMessage':
        case 'http':
        case 'inError':
        case 'isReferencedBy':
        case 'references':
        case 'referencesField':
            return undefined;
        default:
            return value;
    }
}
