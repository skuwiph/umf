import { Component, OnInit } from '@angular/core';
import { MetaFormService } from './metaform/meta-form.service';
import { MetaForm, MFValidator, MFOptionValue } from './metaform/meta-form';
import { MetaFormControlType, MetaFormTextType, MetaFormDateType, MetaFormOptionType, MetaFormDrawType } from './metaform/meta-form-enums';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    title = 'UnifiedMetaForm';
    form: MetaForm;

    constructor(private mfService: MetaFormService) { }

    ngOnInit() {
        this.form = this.mfService.createForm('test-form', 'A Test Form', MetaFormDrawType.EntireForm);

        this.form
            .addQuestion('name', 'Please enter your name')
            .addTextControl('firstName', MetaFormTextType.SingleLine, 50, 'First or given name')
            .addValidator(MFValidator.Required('This field is required'));

        this.form
            .getQuestion('name')
            .addTextControl('middleName', MetaFormTextType.SingleLine, 70, 'Middle name(s)');

        this.form
            .getQuestion('name')
            .addTextControl('lastName', MetaFormTextType.SingleLine, 50, 'Last or family name')
            .addValidator(MFValidator.Required('This field is required'));

        this.form
            .addQuestion('email', 'Please enter your email address')
            .addTextControl('email', MetaFormTextType.Email, 255, 'email@example.com')
            .addValidator(MFValidator.Required('This field is required'))
            .addValidator(MFValidator.Email('Please enter a valid email address'));

        this.form
            .addQuestion('password', 'Please choose a password')
            .addTextControl('password', MetaFormTextType.Password, 255, 'Password')
            .addValidator(MFValidator.Required('This field is required'));

        this.form
            .getQuestion('password')
            .addTextControl('confirmPassword', MetaFormTextType.Password, 255, 'Confirm Password')
            .addValidator(MFValidator.Required('This field is required'))
            .addValidator(MFValidator.AnswerMustMatch('[password]', 'Passwords do not match!'));

        this.form
            .addQuestion('dates', 'Please enter some dates')
            .addDateControl('leavingDate', MetaFormDateType.Full, '2010-01-01', '2016-06-04')
            .addValidator(MFValidator.Date('Please enter a valid date'));

        this.form
            .getQuestion('dates')
            .addDateControl('expiryMonth', MetaFormDateType.MonthYear)
            .addValidator(MFValidator.Date('Please enter a valid date'))
            .addValidator(MFValidator.AnswerAfterDate('1990-09-01', 'Date must be after September 1990'));

        this.form
            .addQuestion('timeStart', 'Please enter a start time')
            .addTimeControl('startTime', 15, 8, 18)
            .addValidator(MFValidator.Time('Please enter a valid time'));

        this.form
            .addQuestion('timeEnd', 'Please enter an end time')
            .addTimeControl('endTime', 15, 8, 18)
            .addValidator(MFValidator.Time('Please enter a valid time'))
            .addValidator(MFValidator.AnswerAfterTime('[startTime]', 'End time must be after Start time'));

        const options: MFOptionValue[] = [];
        options.push(new MFOptionValue('Y', 'Yes'));
        options.push(new MFOptionValue('N', 'No'));

        this.form
            .addQuestion('option1', 'Please answer the option question')
            .addOptionControl('option1', MetaFormOptionType.SingleSelect, null, options)
            .addValidator(MFValidator.Required('Please select an option'));

        const options2: MFOptionValue[] = [];
        options2.push(new MFOptionValue('en', 'English'));
        options2.push(new MFOptionValue('fr', 'French'));
        options2.push(new MFOptionValue('de', 'German'));
        options2.push(new MFOptionValue('es', 'Spanish'));

        // this.form.setValue('option2', 'fr,de');

        this.form
            .addQuestion('option2', 'Please select all applicable options')
            .addOptionControl('option2', MetaFormOptionType.MultiSelect, null, options2)
            .addValidator(MFValidator.Required('Please select an option'));

        this.form
            .addQuestion('option3', 'Please select a country from URL')
            .addOptionControl('option3', MetaFormOptionType.SingleSelect, 'Please Select', null, 'http://localhost:3000/option', false)
            .addValidator(MFValidator.Required('Please select an option'));

    }
}
