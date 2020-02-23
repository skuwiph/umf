import { Component, OnInit } from '@angular/core';
import { MetaFormService } from './metaform/meta-form.service';
import { MetaForm, MFValidator, MFOptionValue, MFOptions, MFValidatorAsync } from './metaform/meta-form';
import { MetaFormControlType, MetaFormTextType, MetaFormDateType, MetaFormOptionType, MetaFormDrawType } from './metaform/meta-form-enums';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    title = 'UnifiedMetaForm';
    form: MetaForm;
    displayType = 0;
    loading = true;

    constructor(private http: HttpClient, private mfService: MetaFormService) { }

    ngOnInit() {
        this.loading = true;
        this.loadFluentForm();
        this.loading = false;
    }

    changeType(type: number): void {
        console.log(`Showing type: ${type}`);
        this.displayType = type;
        this.loading = true;

        if (this.displayType === 1) {
            this.form = null;
            this.mfService
                .loadFormWithName('http://localhost:3000/form', 'test-form')
                .subscribe(
                    (f: MetaForm) => {
                        console.log(`Got form`);
                        this.form = f;
                        this.loading = false;
                    }
                );
        } else {
            this.form = null;
            this.loadFluentForm();
            this.loading = false;
        }
    }

    loadFluentForm() {
        this.form = this.mfService.createForm('test-form', 'A Test Form', MetaFormDrawType.EntireForm);

        this.form
            .addQuestion('name', 'Please enter your name', 'Please enter exactly as they appear in your passport.')
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
            .addValidator(MFValidator.Email('Please enter a valid email address'))
            .addValidatorAsync(MFValidatorAsync.AsyncValidator(this.http,
                'http://localhost:3000/validate/email',
                'Please enter a different email!'));

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
            .addQuestion('addressHome',
                'Please enter your contact address',
                'This should be your correspondence address, or where you will be staying during your application period.')
            .addTextControl('address1', MetaFormTextType.SingleLine, 50, 'Address')
            .addValidator(MFValidator.Required('This field is required'));

        this.form
            .getQuestion('addressHome')
            .addTextControl('address2', MetaFormTextType.SingleLine, 50, '');

        this.form
            .getQuestion('addressHome')
            .addTextControl('address3', MetaFormTextType.SingleLine, 50, 'Town/City')
            .addValidator(MFValidator.Required('This field is required'));

        this.form
            .getQuestion('addressHome')
            .addTextControl('address4', MetaFormTextType.SingleLine, 50, 'County/State')
            .addValidator(MFValidator.Required('This field is required'));

        this.form
            .getQuestion('addressHome')
            .addTextControl('postcode', MetaFormTextType.SingleLine, 10, 'Postal Code')
            .addValidator(MFValidator.Required('This field is required'));

        const addressCountry = MFOptions.OptionFromUrl('http://localhost:3000/country', 'Country', false);

        this.form
            .getQuestion('addressHome')
            .addOptionControl('countryCode', MetaFormOptionType.SingleSelect, addressCountry)
            .addValidator(MFValidator.Required('Please select an option'));

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

        const o1 = MFOptions.OptionFromList(options);

        this.form
            .addQuestion('option1', 'Please answer the option question')
            .addOptionControl('option1', MetaFormOptionType.SingleSelect, o1)
            .addValidator(MFValidator.Required('Please select an option'));

        const options2: MFOptionValue[] = [];
        options2.push(new MFOptionValue('en', 'English'));
        options2.push(new MFOptionValue('fr', 'French'));
        options2.push(new MFOptionValue('de', 'German'));
        options2.push(new MFOptionValue('es', 'Spanish'));

        const o2 = MFOptions.OptionFromList(options2);

        this.form
            .addQuestion('option2', 'Please select all applicable options')
            .addOptionControl('option2', MetaFormOptionType.MultiSelect, o2)
            .addValidator(MFValidator.Required('Please select an option'));

        const o3 = MFOptions.OptionFromUrl('http://localhost:3000/country', 'Please Select', false);

        this.form
            .addQuestion('country', 'Please select a country from URL')
            .addOptionControl('countryCode', MetaFormOptionType.SingleSelect, o3)
            .addValidator(MFValidator.Required('Please select an option'));

        const o4 = MFOptions.OptionFromUrl('http://localhost:3000/country/[countryCode]/regions', null, true);

        this.form
            .addQuestion('region', 'Please select a region from URL')
            .addOptionControl('region', MetaFormOptionType.SingleSelect, o4)
            .addValidator(MFValidator.Required('Please select a region'));
    }
}
