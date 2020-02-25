import { Component, OnInit } from '@angular/core';
import { MetaFormService } from './metaform/meta-form.service';
import { MetaForm, MFValidator, MFOptionValue, MFOptions, MFValidatorAsync } from './metaform/meta-form';
import { MetaFormControlType, MetaFormTextType, MetaFormDateType, MetaFormOptionType, MetaFormDrawType, ControlLayoutStyle } from './metaform/meta-form-enums';
import { HttpClient } from '@angular/common/http';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import { BusinessRuleService } from './metaform/business-rule.service';

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

    constructor(
        private http: HttpClient,
        private mfService: MetaFormService,
        private ruleService: BusinessRuleService) { }

    ngOnInit() {
        this.loading = true;

        this.ruleService
            .loadRules('http://localhost:3000/rules')
            .subscribe(
                b => {
                    console.log(`Loaded ${this.ruleService.rules.size} rules`);
                    this.loadFluentForm();
                    this.loading = false;
                });
    }

    changeType(type: number): void {
        this.displayType = type;
        this.loading = true;

        if (this.displayType === 2) {
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
        } else if (this.displayType === 1) {
            this.form = null;
            this.mfService
                .loadFormWithName('http://localhost:3000/form', 'create-application')
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
            .addSection('Default');

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
            .addTextControl('town', MetaFormTextType.SingleLine, 50, 'Town/City')
            .addValidator(MFValidator.Required('This field is required'));

        this.form
            .getQuestion('addressHome')
            .addTextControl('state', MetaFormTextType.SingleLine, 50, 'County/State')
            .addValidator(MFValidator.Required('This field is required'));

        this.form
            .getQuestion('addressHome')
            .addTextControl('postcode', MetaFormTextType.SingleLine, 10, 'Postal Code')
            .addValidator(MFValidator.Required('This field is required'));

        const addressCountry = MFOptions.OptionFromUrl('http://localhost:3000/country', 'Country', false);

        this.form
            .getQuestion('addressHome')
            .addOptionControl('addressCountryCode', MetaFormOptionType.SingleSelect, addressCountry)
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

    // loadCreateApplicationForm() {
    //     console.log(`creating application form`);

    //     this.form = this.mfService.createForm('create-application', 'Create Application', MetaFormDrawType.SingleQuestion);
    //     this.form
    //         .addSection('Your Availability')
    //         .addSection('Student Status')
    //         .addSection('My Application');

    //     const availOptions: MFOptionValue[] = [];
    //     availOptions.push(new MFOptionValue('Y', 'YES - I am able to fly to the US by 30th June and stay until mid-August'));
    //     availOptions.push(new MFOptionValue('N', 'NO - I am not able to fly to the US by 30th June and stay until mid-August'));

    //     const ao = MFOptions.OptionFromList(availOptions);

    //     const availOptions2: MFOptionValue[] = [];
    //     availOptions2.push(new MFOptionValue('Y', 'YES - I am able to fly to the US by 25th June and stay until mid-August'));
    //     availOptions2.push(new MFOptionValue('N', 'NO - I am not able to fly to the US by 25th June and stay until mid-August'));

    //     const ao2 = MFOptions.OptionFromList(availOptions2);

    //     const studentOptions: MFOptionValue[] = [];
    //     studentOptions.push(new MFOptionValue('Y', 'YES - I am currently a full-time student'));
    //     studentOptions.push(new MFOptionValue('N', 'NO - I am not a full-time student'));

    //     const so = MFOptions.OptionFromList(studentOptions);

    //     const returner: MFOptionValue[] = [];
    //     returner.push(new MFOptionValue('FIRST', 'I want to go for the very first time'));
    //     returner.push(new MFOptionValue('REPEAT', 'I have been before, but I want to go to a different camp'));
    //     returner.push(new MFOptionValue('RETURNER', `Take me back to the same camp... it's my summer home`));

    //     const ro = MFOptions.OptionFromList(returner);

    //     this.form
    //         .addQuestion('availabilityDEAUCH', 'Are you able to fly to the US by 30th June and stay until mid-August?')
    //         .setDisplayRule('isApplyingFrom_Germany_Austria_Switzerland')
    //         .addOptionControl('availableBeforeCutoff', MetaFormOptionType.SingleSelect, ao)
    //         .addValidator(MFValidator.Required('Please select an option'))
    //         .addValidator(MFValidator.AnswerMustMatch('Y',
    //             'You must be available within these dates in order to participate on this programme!'));

    //     this.form
    //         .addQuestion('availabilityNotDEAUCH', 'Are you able to fly to the US by 25th June and stay until mid-August?')
    //         .setDisplayRule('isNotApplyingFrom_Germany_Austria_Switzerland')
    //         .addOptionControl('availableBeforeCutoff', MetaFormOptionType.SingleSelect, ao2)
    //         .addValidator(MFValidator.Required('Please select an option'))
    //         .addValidator(MFValidator.AnswerMustMatch('Y',
    //             'You must be available within these dates in order to participate on this programme!'));

    //     this.form
    //         .addQuestion('isStudent', 'Are you a student?', `You don't need to be a student in order to take part!`)
    //         .setSection(2)
    //         .addOptionControl('student', MetaFormOptionType.SingleSelect, so)
    //         .addValidator(MFValidator.Required('Please select an option'));

    //     this.form
    //         .addQuestion('previousParticipation', 'Have you worked at a US summer camp before?')
    //         .setSection(3)
    //         .addOptionControl('returnerStatus', MetaFormOptionType.SingleSelect, ro)
    //         .addValidator(MFValidator.Required('Please select an option'));

    //     console.log(this.form.toJson());

    // }
}
