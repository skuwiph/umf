import { Component, OnInit, ViewChild } from '@angular/core';
import { MetaFormService } from './metaform/meta-form.service';
import { MetaForm, MFValidator, MFOptionValue, MFOptions, MFValidatorAsync } from './metaform/meta-form';
import { MetaFormTextType, MetaFormDateType, MetaFormOptionType, MetaFormDrawType } from './metaform/meta-form-enums';
import { HttpClient } from '@angular/common/http';
import { BusinessRuleService } from './metaform/business-rule.service';
import { MetaFormUserEvent, MetaFormUserEventType, MetaFormDisplayComponent } from './metaform/ui/metaform-display.component';

@Component({
    selector: 'app-test-form',
    templateUrl: './test-form.component.html',
    styleUrls: ['./test-form.component.css']
})
export class TestFormComponent implements OnInit {

    @ViewChild('formDisplay')
    private formDisplay: MetaFormDisplayComponent;

    title = 'UnifiedMetaForm';
    form: MetaForm;
    loading = true;
    formList: MFOptionValue[] = [];

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

        this.formList = [
            { code: '', description: 'Please Select' },
            { code: 'T1', description: 'Read-Only form with values' },
            { code: 'T2', description: 'Read/Write form with values' },
            { code: 'T3', description: 'Read/Write form with a couple of RO questions' },
            { code: 'T4', description: 'Read/Write form with a RO control' }
        ];
    }

    formControlChange(code: string) {
        console.log(`Form selected? ${code}`);
        if (code === '') {
            this.form = null;
            return;
        }
        this.loading = true;
        this.form = null;
        switch (code) {
            case 'T1':
                this.loadT1();
                break;
            case 'T2':
                this.loadT1(false);
                break;
            case 'T3':
                this.loadT1(false);
                this.form.getQuestion('timeTest').readonly = true;
                this.form.getQuestion('option2').readonly = true;
                break;
            case 'T4':
                this.loadT1(false);
                this.form.setReadOnlyControl('toggleOff', true);
                break;
        }

        this.formDisplay.refreshCurrentDisplay();
        this.loading = false;
    }

    // changeType(type: number): void {
    //     this.displayType = type;
    //     this.loading = true;

    //     if (this.displayType === 2) {
    //         this.form = null;
    //         this.mfService
    //             .loadFormWithName('http://localhost:3000/form', 'test-form')
    //             .subscribe(
    //                 (f: MetaForm) => {
    //                     console.log(`Got form`);
    //                     this.form = f;
    //                     this.loading = false;
    //                 }
    //             );
    //     } else if (this.displayType === 1) {
    //         this.form = null;
    //         this.mfService
    //             .loadFormWithName('http://localhost:3000/form', 'create-application')
    //             .subscribe(
    //                 (f: MetaForm) => {
    //                     console.log(`Got form`);
    //                     this.form = f;
    //                     this.loading = false;
    //                 }
    //             );
    //     } else {
    //         this.form = null;
    //         this.loadFluentForm();
    //         this.loading = false;
    //     }
    // }

    formChange(event: MetaFormUserEvent): void {
        // console.log(`Got event ${event.event}`, event.form);
        if (event.event === MetaFormUserEventType.FormSubmit) {
            console.log(`Form submit process: ${JSON.stringify(event.form.answers, null, 2)}`);
        }
    }

    loadT1(readonly: boolean = true) {
        this.form = this.mfService.createForm('test-1', 'First Test', MetaFormDrawType.EntireForm);
        this.form.addSection('Default');

        this.form.addQuestion('info')
            .addHtml(`<b>Note</b>:All controls have a required validator, so will be set up in such a fashion that `
                + `would mirror real-world use (e.g. the controls have been set up as though it were a real fluent form `
                + `and the form itself is set to readonly after data has been added).`)

        this.form.addQuestion('textTest', 'A Single-Line Text Field')
            .addTextControl('basicText', MetaFormTextType.SingleLine)
            .addValidator(MFValidator.Required('Please enter some text'));

        this.form.setValue('basicText', `This is a single-line answer`);

        this.form.addQuestion('textTest2', 'A Multi-Line Text Field')
            .addTextControl('multiText', MetaFormTextType.MultiLine)
            .addValidator(MFValidator.Required('Please enter some text'));

        this.form.setValue('multiText', `This is a multi-line answer, which contains sufficient text to test out `
            + `the line break functionality in the display component. This should be absolutely trivial to display and `
            + `uses the same functionalilty as the single-line readonly display.`);

        this.form.addQuestion('pwdTest', 'A Pasword Text Field', 'The password should obviously not be displayed above!')
            .addTextControl('pwdText', MetaFormTextType.Password)
            .addValidator(MFValidator.Required('Please enter a password'));

        this.form.setValue('pwdText', `MyPassword$$$$$1`);

        this.form
            .addQuestion('dateTest', 'Some Readonly Dates', 'Includes a full date and a month/year date')
            .addDateControl('full', MetaFormDateType.Full)
            .addValidator(MFValidator.Required('Please enter a date'));

        this.form
            .getQuestion('dateTest')
            .addDateControl('short', MetaFormDateType.MonthYear)
            .addValidator(MFValidator.Required('Please enter a date'));

        this.form.setValue('full', '2019-09-01');
        this.form.setValue('short', '2020-6');

        this.form
            .addQuestion('timeTest', 'Time Fields', 'Example of various times')
            .addTimeControl('time')
            .addValidator(MFValidator.Required('Please enter a time'));

        this.form
            .getQuestion('timeTest')
            .addTimeControl('time2')
            .addValidator(MFValidator.Required('Please enter a time'));

        this.form.setValue('time', '18:45');
        this.form.setValue('time2', '9:00');

        this.form
            .addQuestion('teltest', 'A readonly telephone number')
            .addTelephoneAndIddControl('telnum', 10, 'Number')
            .addValidator(MFValidator.Required('Please enter your telephone number'));

        this.form.setValue('telnum', '+44:7714276588');

        this.form
            .addQuestion('toggleTest', 'Toggle Fields', 'Example of On and Off toggles')
            .addToggleControl('toggleOn', 'This toggle should be on');

        this.form
            .getQuestion('toggleTest')
            .addToggleControl('toggleOff', 'This toggle should be off');

        this.form.setValue('toggleOn', 'true');

        const options2: MFOptionValue[] = [];
        options2.push(new MFOptionValue('en', 'English'));
        options2.push(new MFOptionValue('fr', 'French'));
        options2.push(new MFOptionValue('de', 'German'));
        options2.push(new MFOptionValue('es', 'Spanish'));

        const o2 = MFOptions.OptionFromList(options2);

        this.form
            .addQuestion('option2', 'Single select option from list')
            .addOptionControl('option2', MetaFormOptionType.SingleSelect, o2)
            .addValidator(MFValidator.Required('Please select an option'));

        const o3 = MFOptions.OptionFromUrl('http://localhost:3000/country', 'Please Select', false);

        this.form
            .addQuestion('country', 'Single select option from URL')
            .setSection(9)
            .addOptionControl('countryCode', MetaFormOptionType.SingleSelect, o3)
            .addValidator(MFValidator.Required('Please select an option'));

        this.form.setValue('option2', 'fr');
        this.form.setValue('countryCode', 'DE');

        this.form
            .addQuestion('multiOptTest', 'Multi select option from list')
            .addOptionMultiControl('language', o2)
            .addValidator(MFValidator.Required('Please select an option'));

        this.form.setValue('language', 'en,de,es');

        this.form
            .addQuestion('multiOptTest2', 'Multi select option from URL')
            .addOptionMultiControl('countryCode2', o3)
            .addValidator(MFValidator.Required('Please select an option'));

        this.form.setValue('countryCode2', 'FR,ES');

        this.form
            .addQuestion('multiOptTest3', 'Multi select option from list with one selection')
            .addOptionMultiControl('language2', o2)
            .addValidator(MFValidator.Required('Please select an option'));

        this.form.setValue('language2', 'fr');

        this.form.setReadOnly(readonly);
    }

    loadFluentForm() {
        this.form = this.mfService.createForm('test-form', 'A Test Form', MetaFormDrawType.SingleQuestion);
        this.form
            .addSection('First')
            .addSection('Second')
            .addSection('Third')
            .addSection('Fourth')
            .addSection('Fifth')
            .addSection('Sixth')
            .addSection('Seventh', 'HasAllergies')
            .addSection('Eighth')
            .addSection('Ninth');

        this.form
            .addQuestion('name', 'Please enter your name', 'Please enter exactly as they appear in your passport.')
            .setSection(1)
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
            .addQuestion('contactPhone', 'Please enter a contact number', 'This can be a mobile or landline.')
            .setSection(1)
            .addTelephoneAndIddControl('contactPhone', 20, 'Number')
            .addValidator(MFValidator.Required('Please enter your contact number'));

        this.form
            .addQuestion('email', 'Please enter your email address')
            .setSection(2)
            .addTextControl('email', MetaFormTextType.Email, 255, 'email@example.com')
            .addValidator(MFValidator.Required('This field is required'))
            .addValidator(MFValidator.Email('Please enter a valid email address'))
            .addValidatorAsync(MFValidatorAsync.AsyncValidator(this.http,
                'http://localhost:3000/validate/email',
                'Please enter a different email!'));

        this.form
            .getQuestion('email')
            .addToggleControl('isPrimary', 'Primary email address');

        this.form
            .getQuestion('email')
            .addToggleControl('marketing', 'Please send me marketing details');

        this.form
            .getQuestion('email')
            .addToggleControl('suspicious', 'Please send me suspicious packages');

        this.form.answers.setValue('isPrimary', true);

        this.form
            .addQuestion('password', 'Please choose a password')
            .setSection(2)
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
            .setSection(3)
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
            .setSection(4)
            .addDateControl('leavingDate', MetaFormDateType.Full, '2010-01-01', '2016-06-04')
            .addValidator(MFValidator.Date('Please enter a valid date'));

        this.form
            .getQuestion('dates')
            .addDateControl('expiryMonth', MetaFormDateType.MonthYear)
            .addValidator(MFValidator.Date('Please enter a valid date'))
            .addValidator(MFValidator.AnswerAfterDate('1990-09-01', 'Date must be after September 1990'));

        this.form
            .addQuestion('timeStart', 'Please enter a start time')
            .setSection(5)
            .addTimeControl('startTime', 15, 8, 18)
            .addValidator(MFValidator.Time('Please enter a valid time'));

        this.form
            .addQuestion('timeEnd', 'Please enter an end time')
            .setSection(5)
            .addTimeControl('endTime', 15, 8, 18)
            .addValidator(MFValidator.Time('Please enter a valid time'))
            .addValidator(MFValidator.AnswerAfterTime('[startTime]', 'End time must be after Start time'));

        const options: MFOptionValue[] = [];
        options.push(new MFOptionValue('Y', 'Yes'));
        options.push(new MFOptionValue('N', 'No'));

        const o1 = MFOptions.OptionFromList(options);

        this.form
            .addQuestion('option1', 'Medical Question')
            .addHtml(`As part of your application to the Program, we need to collect, use, store and share certain information
             about your health (including information contained in the medical report we ask you to provide).
              We do so to enable us to assess your fitness to take part in the Program (including allergies, etc.),
               and so that we or your host family can provide assistance if a medical emergency arises whilst you are
                taking part in the Program. Please read AIFS's <a href="https://www.aupairinamerica.co.uk/privacy-policy/index.asp"
                 target="_blank"> Privacy Policy</a> carefully for full details on how we process your health information,
                  the grounds we rely on to process that information and how long we retain it.`);

        this.form
            .getQuestion('option1')
            .setSection(6)
            .addOptionControl('allergies', MetaFormOptionType.SingleSelect, o1)
            .addValidator(MFValidator.Required('Please select an option'));

        this.form
            .addQuestion('allergyDetails', 'What allergies do you have?', `Please don't worry about hayfever.`)
            .setSection(7)
            .setDisplayRule('HasAllergies')
            .addTextControl('allergyDetails', MetaFormTextType.MultiLine, 150, 'Details')
            .addValidator(MFValidator.Required('This field is required'));

        const options2: MFOptionValue[] = [];
        options2.push(new MFOptionValue('en', 'English'));
        options2.push(new MFOptionValue('fr', 'French'));
        options2.push(new MFOptionValue('de', 'German'));
        options2.push(new MFOptionValue('es', 'Spanish'));

        const o2 = MFOptions.OptionFromList(options2);

        this.form
            .addQuestion('option2', 'Please select all applicable options')
            .setSection(8)
            .addOptionMultiControl('option2', o2)
            .addValidator(MFValidator.Required('Please select an option'));

        const o3 = MFOptions.OptionFromUrl('http://localhost:3000/country', 'Please Select', false);

        this.form
            .addQuestion('country', 'Please select a country from URL')
            .setSection(9)
            .addOptionControl('countryCode', MetaFormOptionType.SingleSelect, o3)
            .addValidator(MFValidator.Required('Please select an option'));

        const o4 = MFOptions.OptionFromUrl('http://localhost:3000/country/[countryCode]/regions', null, true);

        this.form
            .addQuestion('region', 'Please select a region from URL')
            .setSection(9)
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
