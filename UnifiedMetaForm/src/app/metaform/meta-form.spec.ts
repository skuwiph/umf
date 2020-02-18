import { MetaForm, MFValidator, MetaFormAnswers, MFOptionValue, MFAnswerMustMatch, MFValueRequired } from './meta-form';
import { MetaFormDrawType, MetaFormTextType, MetaFormOptionType, MetaFormDateType } from './meta-form-enums';

describe('MetaForm', () => {
    it('should create an instance', () => {
        expect(new MetaForm()).toBeTruthy();
    });

    it('should create a single question form', () => {
        const f = MetaForm.create('test-form', MetaFormDrawType.EntireForm);

        f
            .addQuestion('firstName', 'Please enter your first name')
            .addTextControl('firstName', MetaFormTextType.SingleLine);

        expect(f.questions.length).toEqual(1, `There isn't a single question: actual length: {f.questions.length;}`);
        expect(f.questions[0].controls.length).toEqual(1);
    });

    it('Required validator should evaluate false', () => {
        const f = MetaForm.create('test-form', MetaFormDrawType.EntireForm);

        f
            .addQuestion('firstName', 'Please enter your first name')
            .addTextControl('firstName', MetaFormTextType.SingleLine)
            .addValidator(MFValidator.Required('This field is required'));

        expect(f.isValid()).toEqual(false, `The form should not be valid`);

    });

    it('Required validator should evaluate true', () => {
        const f = MetaForm.create('test-form', MetaFormDrawType.EntireForm);

        f
            .addQuestion('firstName', 'Please enter your first name')
            .addTextControl('firstName', MetaFormTextType.SingleLine)
            .addValidator(MFValidator.Required('This field is required'));

        f.setValue('firstName', 'Frank');

        expect(f.isValid()).toEqual(true, `The form should be valid`);

    });

    it('Required validator should evaluate true then false', () => {
        const f = MetaForm.create('test-form', MetaFormDrawType.EntireForm);

        f
            .addQuestion('firstName', 'Please enter your first name')
            .addTextControl('firstName', MetaFormTextType.SingleLine)
            .addValidator(MFValidator.Required('This field is required'));

        f.setValue('firstName', 'Frank');

        expect(f.isValid()).toEqual(true, `The form should be valid`);

        f.setValue('firstName', '');

        expect(f.isValid()).toEqual(false, `The form should no longer be valid`);
    });

    it('AnswerMustMatch validator should evaluate true', () => {
        const f = MetaForm.create('test-form', MetaFormDrawType.EntireForm);

        f.setValue('oldPassword', 'test');
        f.setValue('confirmPassword', 'test');

        f
            .addQuestion('oldPassword', 'Please enter your new password')
            .addTextControl('oldPassword', MetaFormTextType.Password, 255)
            .addValidator(MFValidator.Required('This field is required'));

        f
            .addQuestion('confirmPassword', 'Please confirm your new password')
            .addTextControl('confirmPassword', MetaFormTextType.Password, 255)
            .addValidator(MFValidator.Required('This field is required'))
            .addValidator(MFValidator.AnswerMustMatch('[oldPassword]', 'Passwords do not match!'));

        expect(f.isValid()).toEqual(true, `The form should be valid`);

    });

    it('AnswerMustMatch validator should evaluate false', () => {
        const f = MetaForm.create('test-form', MetaFormDrawType.EntireForm);

        f.setValue('oldPassword', 'test');
        f.setValue('confirmPassword', 'test123');

        f
            .addQuestion('confirmPassword', 'Please confirm your new password')
            .addTextControl('confirmPassword', MetaFormTextType.Password)
            .addValidator(MFValidator.Required('This field is required'))
            .addValidator(MFValidator.AnswerMustMatch('[oldPassword]', 'Passwords do not match!'));

        expect(f.isValid()).toEqual(false, `The form should be valid`);

    });

    it('AnswerMustMatch validator should work with constant value', () => {
        const f = MetaForm.create('test-form', MetaFormDrawType.EntireForm);

        const options: MFOptionValue[] = [];
        options.push(new MFOptionValue('Y', 'Yes'));
        options.push(new MFOptionValue('N', 'No'));

        f
            .addQuestion('answerMe', 'Please answer YES')
            .addOptionControl('answerMe', MetaFormOptionType.SingleSelect, undefined, options)
            .addValidator(MFValidator.Required('This field is required'))
            .addValidator(MFValidator.AnswerMustMatch('Y', 'Answer must be yes'));

        f.setValue('answerMe', 'Y');

        expect(f.isValid()).toEqual(true, `The form should be valid`);

        f.setValue('answerMe', 'N');

        expect(f.isValid()).toEqual(false, `The form should no longer be valid`);
    });

    it('Email validator should evaluate true with various emails', () => {
        const f = MetaForm.create('test-form', MetaFormDrawType.EntireForm);

        f
            .addQuestion('email', 'Please enter your email address')
            .addTextControl('email', MetaFormTextType.Email)
            .addValidator(MFValidator.Email('Please enter a valid email'));

        f.setValue('email', 'frank@example.com');
        expect(f.isValid()).toEqual(true, `${f.getValue('email')} should be valid`);

        f.setValue('email', 'frank.smith@ex.co');
        expect(f.isValid()).toEqual(true, `${f.getValue('email')} should be valid`);

        f.setValue('email', '_frank@a.co.uk');
        expect(f.isValid()).toEqual(true, `${f.getValue('email')} should be valid`);

        f.setValue('email', 'jack@email.example.com');
        expect(f.isValid()).toEqual(true, `${f.getValue('email')} should be valid`);
    });

    it('Email validator should evaluate false: no @ symbol', () => {
        const f = MetaForm.create('test-form', MetaFormDrawType.EntireForm);

        f
            .addQuestion('email', 'Please enter your email address')
            .addTextControl('email', MetaFormTextType.Email)
            .addValidator(MFValidator.Email('Please enter a valid email'));

        f.setValue('email', 'frank.example.com');
        expect(f.isValid()).toEqual(false, `${f.getValue('email')} should be invalid`);
    });

    it('Date validator should evaluate true: dd-mm-yyyy', () => {
        const f = MetaForm.create('test-form', MetaFormDrawType.EntireForm);
        f
            .addQuestion('date', 'Please enter a date')
            .addDateControl('date', MetaFormDateType.Full)
            .addValidator(MFValidator.Date('Please enter a valid date'));

        f.setValue('date', '1971-11-10');
        expect(f.isValid()).toEqual(true, `${f.getValue('date')} should be valid`);
    });

    it('Date validator should evaluate true: d-m-yyyy', () => {
        const f = MetaForm.create('test-form', MetaFormDrawType.EntireForm);
        f
            .addQuestion('date', 'Please enter a date')
            .addDateControl('date', MetaFormDateType.Full)
            .addValidator(MFValidator.Date('Please enter a valid date'));

        f.setValue('date', '1972-7-2');
        expect(f.isValid()).toEqual(true, `${f.getValue('date')} should be valid`);
    });

    it('Date validator should evaluate false: 31-2-1990', () => {
        const f = MetaForm.create('test-form', MetaFormDrawType.EntireForm);
        f
            .addQuestion('date', 'Please enter a date')
            .addDateControl('date', MetaFormDateType.Full)
            .addValidator(MFValidator.Date('Please enter a valid date'));

        f.setValue('date', '2060-2-31');
        expect(f.isValid()).toEqual(false, `${f.getValue('date')} should be invalid`);
    });

    it('Date validator should evaluate true: 29-2-2000 (leap year)', () => {
        const f = MetaForm.create('test-form', MetaFormDrawType.EntireForm);
        f
            .addQuestion('date', 'Please enter a date')
            .addDateControl('date', MetaFormDateType.Full)
            .addValidator(MFValidator.Date('Please enter a valid date'));

        f.setValue('date', '2000-2-29');
        expect(f.isValid()).toEqual(true, `${f.getValue('date')} should be invalid`);
    });

    it('Date validator should evaluate false: 29-2-1900 (not leap year)', () => {
        const f = MetaForm.create('test-form', MetaFormDrawType.EntireForm);
        f
            .addQuestion('date', 'Please enter a date')
            .addDateControl('date', MetaFormDateType.Full)
            .addValidator(MFValidator.Date('Please enter a valid date'));

        f.setValue('date', '1900-2-29');
        expect(f.isValid()).toEqual(false, `${f.getValue('date')} should be invalid`);
    });

    it('Date validator should evaluate true: dd-m-yyyy', () => {
        const f = MetaForm.create('test-form', MetaFormDrawType.EntireForm);
        f
            .addQuestion('date', 'Please enter a date')
            .addDateControl('date', MetaFormDateType.Full)
            .addValidator(MFValidator.Date('Please enter a valid date'));

        f.setValue('date', '1972-7-23');
        expect(f.isValid()).toEqual(true, `${f.getValue('date')} should be valid`);
    });

    it('Date validator should evaluate true: d-mm-yyyy', () => {
        const f = MetaForm.create('test-form', MetaFormDrawType.EntireForm);
        f
            .addQuestion('date', 'Please enter a date')
            .addDateControl('date', MetaFormDateType.Full)
            .addValidator(MFValidator.Date('Please enter a valid date'));

        f.setValue('date', '1972-12-1');
        expect(f.isValid()).toEqual(true, `${f.getValue('date')} should be valid`);
    });

    it('MonthYear Date validator should evaluate true: yyyy-mm', () => {
        const f = MetaForm.create('test-form', MetaFormDrawType.EntireForm);
        f
            .addQuestion('date', 'Please enter a date')
            .addDateControl('date', MetaFormDateType.MonthYear)
            .addValidator(MFValidator.Date('Please enter a valid date'));

        f.setValue('date', '1971-11');
        expect(f.isValid()).toEqual(true, `${f.getValue('date')} should be valid`);
    });

    it('MonthYear Date validator should evaluate true: yyyy-m', () => {
        const f = MetaForm.create('test-form', MetaFormDrawType.EntireForm);
        f
            .addQuestion('date', 'Please enter a date')
            .addDateControl('date', MetaFormDateType.MonthYear)
            .addValidator(MFValidator.Date('Please enter a valid date'));

        f.setValue('date', '1971-1');
        expect(f.isValid()).toEqual(true, `${f.getValue('date')} should be valid`);
    });

    it('Time validator should evaluate true: HH:MM', () => {
        const f = MetaForm.create('test-form', MetaFormDrawType.EntireForm);
        f
            .addQuestion('time', 'Please enter a time')
            .addTimeControl('time')
            .addValidator(MFValidator.Time('Please enter a valid time'));

        f.setValue('time', '12:45');
        expect(f.isValid()).toEqual(true, `${f.getValue('time')} should be valid`);
    });

    it('Time validator should evaluate false: bad minutes', () => {
        const f = MetaForm.create('test-form', MetaFormDrawType.EntireForm);
        f
            .addQuestion('time', 'Please enter a time')
            .addTimeControl('time')
            .addValidator(MFValidator.Time('Please enter a valid time'));

        f.setValue('time', '12:60');
        expect(f.isValid()).toEqual(false, `${f.getValue('time')} should be invalid`);
    });

    it('AnswerAfter validator should evaluate true: 2019-10-01 after 2018-10-01', () => {
        const f = MetaForm.create('test-form', MetaFormDrawType.EntireForm);
        f
            .addQuestion('date', 'Please enter a date')
            .addDateControl('date', MetaFormDateType.Full)
            .addValidator(MFValidator.Date('Please enter a valid date'))
            .addValidator(MFValidator.AnswerAfterDate('2018-10-01', 'Date should be after 2018-10-01'));

        f.setValue('date', '2019-10-01');
        expect(f.isValid()).toEqual(true, `${f.getValue('date')} should be valid`);
    });

    it('AnswerAfter validator should evaluate false: 2019-10-01 is not after 2019-10-02', () => {
        const f = MetaForm.create('test-form', MetaFormDrawType.EntireForm);
        f
            .addQuestion('date', 'Please enter a date')
            .addDateControl('date', MetaFormDateType.Full)
            .addValidator(MFValidator.Date('Please enter a valid date'))
            .addValidator(MFValidator.AnswerAfterDate('2019-10-02', 'Date should be after 2019-10-02'));

        f.setValue('date', '2019-10-01');
        expect(f.isValid()).toEqual(false, `${f.getValue('date')} should not be valid`);
    });

    it('AnswerBefore validator should evaluate true: 2019-10-01 before 2020-10-02', () => {
        const f = MetaForm.create('test-form', MetaFormDrawType.EntireForm);
        f
            .addQuestion('date', 'Please enter a date')
            .addDateControl('date', MetaFormDateType.Full)
            .addValidator(MFValidator.Date('Please enter a valid date'))
            .addValidator(MFValidator.AnswerBeforeDate('2020-10-02', 'Date should be before 2020-10-02'));

        f.setValue('date', '2019-10-01');
        expect(f.isValid()).toEqual(true, `${f.getValue('date')} should be valid`);
    });

    it('AnswerBefore validator should evaluate false: 2021-10-01 is not before 2020-10-02', () => {
        const f = MetaForm.create('test-form', MetaFormDrawType.EntireForm);
        f
            .addQuestion('date', 'Please enter a date')
            .addDateControl('date', MetaFormDateType.Full)
            .addValidator(MFValidator.Date('Please enter a valid date'))
            .addValidator(MFValidator.AnswerBeforeDate('2020-10-02', 'Date should be before 2020-10-02'));

        f.setValue('date', '2021-10-01');
        expect(f.isValid()).toEqual(false, `${f.getValue('date')} should not be valid`);
    });

    it('AnswerBetween should evaluate true: 10-11-1971 is between 10-10-1971 and 11-11-1989', () => {
        const f = MetaForm.create('test-form', MetaFormDrawType.EntireForm);
        f
            .addQuestion('date', 'Please enter a date')
            .addDateControl('date', MetaFormDateType.Full)
            .addValidator(MFValidator.AnswerBetween('1971-10-10', '1989-11-11', 'Please enter a date between the displayed dates'));

        f.setValue('date', '1971-11-10');
        expect(f.isValid()).toEqual(true, `${f.getValue('date')} should be valid`);
    });

    it('AnswerBetween should evaluate true: 10-11-1971 with referenced fields', () => {
        const f = MetaForm.create('test-form', MetaFormDrawType.EntireForm);
        f
            .addQuestion('date', 'Please enter a date')
            .addDateControl('date', MetaFormDateType.Full)
            .addValidator(MFValidator.AnswerBetween('[after]', '[before]', 'Please enter a date between the displayed dates'));

        f.setValue('after', '1971-10-10');
        f.setValue('before', '1989-11-11');
        f.setValue('date', '1971-11-10');
        expect(f.isValid()).toEqual(true, `${f.getValue('date')} should be valid`);
    });

    it('AnswerBetween should evaluate true with numeric field', () => {
        const f = MetaForm.create('test-form', MetaFormDrawType.EntireForm);
        f
            .addQuestion('date', 'Please enter a date')
            .addTextControl('answer', MetaFormTextType.Numeric, 5)
            .addValidator(MFValidator.AnswerBetween('10', '42', 'Please enter a number between 10 and 42'));

        f.setValue('answer', '41');
        expect(f.isValid()).toEqual(true, `${f.getValue('answer')} should be valid`);
    });

});
