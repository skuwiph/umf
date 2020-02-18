import { IMetaForm } from './imeta-form';
import {
    MetaFormDrawType,
    MetaFormTextType,
    MetaFormControlType,
    ControlLayoutStyle,
    MetaFormDateType,
    MetaFormOptionType
} from './meta-form-enums';
import { EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';

export class MetaForm implements IMetaForm {
    name: string; title: string;
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

    initialise() {
        for (const q of this.questions) {
            for (const c of q.controls) {
                if (c.references) {
                    for (const name of c.references) {
                        console.log(`${c.name} references ${name}`);
                        const referenced = this.getControlByName(name);
                        referenced.isReferencedBy = c.name;
                    }
                }
            }
        }
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

    addQuestion(name: string, caption: string, layout?: ControlLayoutStyle): MFQuestion {
        const q = new MFQuestion();
        q.controls = [];
        q.controlLayout = layout ?? ControlLayoutStyle.Vertical;

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
        if (dateValue.length === 0) {
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

                // console.log(`${name}(${dateValue})=${date}`);

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

            this.change.emit(new MFValueChange(name, value));

            // Check for referencing values
            const c = this.getControlByName(name);
            if (c) {
                // console.log(`Got control ${name}`);
                const referencedBy = c.isReferencedBy;
                if (referencedBy) {
                    // console.log(`${referencedBy} also needs updating!`);
                    const r = this.getControlByName(c.isReferencedBy);
                    r.isValid(this, true);

                    this.change.emit(new MFValueChange(r.name, this.getValue(r.name)));
                }
            }
        }
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

    addOptionControl(name: string, optionType: MetaFormOptionType, nullItem?: string,
        // tslint:disable-next-line: align
        options?: MFOptionValue[], optionSource?: string, expandOptions?: boolean): MFOptionControl {
        const c = new MFOptionControl();

        c.controlType = MetaFormControlType.Option;
        c.optionType = optionType;
        c.optionSource = optionSource;
        c.options = options;
        c.expandOptions = expandOptions ?? true;
        c.nullItem = nullItem;
        c.name = name;
        c.validators = [];

        this.pushControl(c);

        return c;
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
    name: string;
    validators?: MFValidator[];

    // NOTE(Ian): Not sure if necessary or wanted
    autocomplete?: string;

    inError = false;
    errorMessage?: string;

    isReferencedBy: string;
    references: string[];

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

    isValid(form: MetaForm, updateStatus = true): boolean {
        let valid = true;
        let controlName: string;

        if (this.validators !== undefined) {
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
            // console.log(`Setting error status on control ${this.name}`);
            this.inError = !valid;
        }

        return valid;
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
    expandOptions = true;
    nullItem?: string;
    options?: MFOptionValue[];
    optionSource?: string;

    optionLayout = ControlLayoutStyle.Vertical;
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
        const r = this.isFieldReference(value);
        if (r.isField) {
            // console.log(`This validator has a field reference pointing at ${r.fieldName}`);
            if (!this.referencesField) {
                this.referencesField = [];
            }
            this.referencesField.push(r.fieldName);
        }
    }

    getAnswerForControl(answers: MetaFormAnswers, valueToCheck: string): string {
        // If the passed 'valueToCheck' starts with a [ or % it is a special value
        const f = this.isFieldReference(valueToCheck);
        const c = this.isVariable(valueToCheck);

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

    private isFieldReference(value: string): { isField: boolean, fieldName: string } {
        if (value.startsWith('[')) {
            return { isField: true, fieldName: value.substr(1, value.length - 2) };
        } else {
            return { isField: false, fieldName: undefined };
        }
    }

    private isVariable(valueToCheck: string): { isVariable: boolean, value: string } {
        if (valueToCheck.startsWith('%')) {
            // Extract the variable name
            return { isVariable: true, value: valueToCheck.substr(1).toUpperCase() };
        } else {
            return { isVariable: false, value: undefined };
        }
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

export class MFValueRequired extends MFValidator {
    isValid(form: MetaForm, control: MFControl): boolean {
        let valid = false;

        // console.log(`${control.name} = '${form.getValue(control.name)}'`);

        // Does the control have a value?
        if (form.getValue(control.name)?.length > 0) {
            valid = true;
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

export class MFAnimation {
    event: string;
    name: string;
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
    private data: Map<string, string> = new Map<string, string>();

    getValue(name: string): string {
        if (this.data[name.toLowerCase()]) {
            return this.data[name.toLowerCase()];
        } else {
            return '';
        }
    }

    setValue(name: string, value: string) {
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

export class MFControlValidityChange {
    name: string;
    valid: boolean;
    constructor(name: string, valid: boolean) {
        this.name = name;
        this.valid = valid;
    }
}

