import { Component, OnInit } from '@angular/core';
import { MetaFormService } from 'projects/metaform/src/public-api';
import { MetaForm, MFValidator, MFOptionValue, MFOptions, MFValidatorAsync } from 'projects/metaform/src/lib/metaform';
import {
    MetaFormDrawType,
    MetaFormTextType,
    ControlLayoutStyle,
    MetaFormDateType
} from 'projects/metaform/src/lib/metaform-enums';
import { MetaFormUserEvent, UserEventType } from 'projects/metaform/src/lib/ui/metaform-display.component';
import { BusinessRuleService } from 'projects/metaform/src/lib/business-rule.service';
import { RuleMatchType, RuleComparison } from 'projects/metaform/src/lib/business-rule';
import { filter } from 'rxjs/operators';
import { MFValueChange } from 'projects/metaform/src/lib/metaform-data';
import { SpecialOption } from './simple-form.component';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-coded-async-form',
    templateUrl: './coded-async-form.component.html',
    styleUrls: ['./coded-async-form.component.scss']
})
export class CodedAsyncFormComponent implements OnInit {
    title = 'metaform-showcase';
    form: MetaForm;

    private lastUserEvent: UserEventType;

    constructor(private formService: MetaFormService, private rules: BusinessRuleService, private http: HttpClient) {}

    ngOnInit(): void {
        // Add some default rules
        this.rules.addRule('YesNoIsYes', RuleMatchType.MatchAny).addPart('yesOrNo', RuleComparison.Equals, 'Y');

        this.rules
            .addRule('HasSelectedFourthOption', RuleMatchType.MatchAll)
            .addPart('mops', RuleComparison.Contains, '4');

        // Generate the form and link to the created rules
        this.form = this.formService.createForm('sample', 'Async Validation Test', MetaFormDrawType.EntireForm);
        this.form.rules = this.rules.rules;

        this.form.addSection('First Section');
        this.form.addSection('Second Section');
        const o3 = MFOptions.OptionFromUrl('http://localhost:3000/country', 'Please Select', false);
        const o4 = MFOptions.OptionFromUrl('http://localhost:3000/country/[countryCode]/regions', null, true);

        this.form
            .addQuestion('country', 'Please select a country from URL')
            .setSection(1)
            .addOptionControl('countryCode', o3)
            .addValidator(MFValidator.Required('Please select an option'));

        this.form
            .addQuestion('countryRegion', 'Please select your region')
            .setSection(1)
            .addOptionControl('region', o4)
            .addValidator(MFValidator.Required('Please select a region'));

        // Create the questions and controls for the form
        this.form
            .addQuestion('q2', 'Please enter your email address')
            .setSection(2)
            .addTextControl('email', MetaFormTextType.SingleLine, 255, 'Email')
            .addValidator(MFValidator.Required('Please enter a value'))
            .addValidator(MFValidator.Email('Please enter a valid email address'))
            .addValidatorAsync(
                MFValidatorAsync.AsyncValidator(
                    this.http,
                    'http://localhost:3000/validate/email',
                    'This email has already been registered'
                )
            );

        this.form.getQuestion('q2').addToggleControl('marketing', 'Please send me marketing emails');
        this.form
            .getQuestion('q2')
            .addTextControl('password', MetaFormTextType.Password, 255, 'Password')
            .addValidator(MFValidator.Required('Please enter your password'));
        this.form
            .getQuestion('q2')
            .addTextControl('confirmPassword', MetaFormTextType.Password, 255, 'Confirm password')
            .addValidator(MFValidator.AnswerMustMatch('[password]', 'Passwords must match'));

        // this.form.change$
        //     .pipe(
        //         filter(
        //             (c: MFValueChange) => c.name === 'interviewDateTime'),
        //     )
        //     .subscribe((chg: MFValueChange) => {
        //         this.dateTime = this.form.getValueAsDateTime(chg.name);
        //         console.log(`Value change on ${chg.name} to ${this.dateTime}`);
        //     });

        // this.form.change$
        //     .pipe(
        //         filter(
        //             (c: MFValueChange) => c.name === 'otherOption'),
        //     )
        //     .subscribe((chg: MFValueChange) => {
        //         const selected = otherOptions.find(o => o.code === chg.value);
        //         const text = selected?.fullText ?? null;
        //         this.form.setValue('specialOptionDescription', text);
        //     });
    }

    onFormEvent(event: MetaFormUserEvent): void {
        if (!this.lastUserEvent || !(this.lastUserEvent === event.type)) {
            switch (event.type) {
                case UserEventType.FormInitialised:
                    console.log(`The form has been initialised:`, event.form);
                    break;
                case UserEventType.FormInvalid:
                    console.log(`The form is currently invalid`);
                    break;
                case UserEventType.FormValid:
                    console.log(`The form is now valid`);
                    break;
                case UserEventType.FormSubmit:
                    console.log(
                        `The 'Submit' button on the display component has been clicked. Data is: ${this.form.answers.toJson()}`
                    );
                    break;
            }

            // Just to prevent multiple messages spamming the console.
            this.lastUserEvent = event.type;
        }
    }
}
