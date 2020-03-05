import { Component, OnInit } from '@angular/core';
import { MetaFormService } from 'projects/metaform/src/public-api';
import { MetaForm, MFValidator, MFOptionValue, MFOptions } from 'projects/metaform/src/lib/metaform';
import {
    MetaFormDrawType,
    MetaFormTextType,
    ControlLayoutStyle,
    MetaFormDateType
} from 'projects/metaform/src/lib/metaform-enums';
import { MetaFormUserEvent, UserEventType } from 'projects/metaform/src/lib/ui/metaform-display.component';
import { BusinessRuleService } from 'projects/metaform/src/lib/business-rule.service';
import { RuleMatchType, RuleComparison } from 'projects/metaform/src/lib/business-rule';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    title = 'metaform-showcase';
    form: MetaForm;

    private lastUserEvent: UserEventType;

    constructor(private formService: MetaFormService, private rules: BusinessRuleService) {}

    ngOnInit(): void {
        this.rules.addRule('YesNoIsYes', RuleMatchType.MatchAny).addPart('yesOrNo', RuleComparison.Equals, 'Y');

        this.form = this.formService.createForm('sample', 'Sample Form', MetaFormDrawType.EntireForm);
        this.form.rules = this.rules.rules;
        this.form
            .addQuestion('q1', 'Please enter your name')
            .addTextControl('firstName', MetaFormTextType.SingleLine, 50, 'First name')
            .addValidator(MFValidator.Required('Please enter a value'));
        this.form
            .getQuestion('q1')
            .addTextControl('lastName', MetaFormTextType.SingleLine, 50, 'Last name')
            .addValidator(MFValidator.Required('Please enter a value'));

        this.form
            .addQuestion('q1a', 'Please enter your telephone number')
            .addTelephoneAndIddControl('contactNumber', 10, 'number')
            .addValidator(MFValidator.Required('Please enter a value'));

        this.form
            .addQuestion('q2', 'Please enter your email address')
            .addTextControl('email', MetaFormTextType.SingleLine, 255, 'Email')
            .addValidator(MFValidator.Required('Please enter a value'))
            .addValidator(MFValidator.Email('Please enter a valid email address'));
        this.form.getQuestion('q2').addToggleControl('marketing', 'Please send me marketing emails');
        this.form
            .getQuestion('q2')
            .addTextControl('password', MetaFormTextType.Password, 255, 'Password')
            .addValidator(MFValidator.Required('Please enter your password'));
        this.form
            .getQuestion('q2')
            .addTextControl('confirmPassword', MetaFormTextType.Password, 255, 'Confirm password')
            .addValidator(MFValidator.AnswerMustMatch('[password]', 'Passwords must match'));

        const yesno: MFOptionValue[] = [];
        yesno.push(new MFOptionValue('Y', 'Yes'));
        yesno.push(new MFOptionValue('N', 'No'));

        const mop: MFOptionValue[] = [];
        mop.push(new MFOptionValue('1', 'First'));
        mop.push(new MFOptionValue('2', 'Second'));
        mop.push(new MFOptionValue('3', 'Third'));
        mop.push(new MFOptionValue('4', 'Fourth'));

        this.form
            .addQuestion('q3', 'Can you answer yes or no?', null)
            .addOptionControl('yesOrNo', MFOptions.OptionFromList(yesno, null, true), ControlLayoutStyle.Horizontal)
            .addValidator(MFValidator.Required('Please select an answer'));

        this.form
            .addQuestion('q3a', 'Enter a future date', null)
            .addHtml(
                `Since you answered <b>Yes</b> to the previous question, you should probably enter a date. ` +
                    `<i>Please note:</i> in order to illustrate the <b>AnswerAfterDate</b> validator, you should enter ` +
                    `a date in the future.`
            );

        this.form
            .getQuestion('q3a')
            .setDisplayRule('YesNoIsYes')
            .addDateControl('dateInTheFuture', MetaFormDateType.Full)
            .addLabel('Future Date  ')
            .addValidator(MFValidator.Date('Please enter a date'))
            .addValidator(MFValidator.AnswerAfterDate('%TODAY', 'Date must be later than today!'));

        this.form
            .addQuestion('q4', 'Please select all applicable answers?', null)
            .addOptionMultiControl('mops', MFOptions.OptionFromList(mop, null, true), ControlLayoutStyle.Horizontal);
    }

    onFormEvent(event: MetaFormUserEvent): void {
        if (!this.lastUserEvent || !(this.lastUserEvent === event.type)) {
            switch (event.type) {
                case UserEventType.FormInitialised:
                    console.log(`The form has been initialised`);
                    break;
                case UserEventType.FormInvalid:
                    console.log(`The form is currently invalid`);
                    break;
                case UserEventType.FormValid:
                    console.log(`The form is now valid`);
                    break;
                case UserEventType.FormSubmit:
                    console.log(
                        `The 'Submit' button on the display component has been clicked. Data is: ${JSON.stringify(
                            this.form.answers,
                            null,
                            2
                        )}`
                    );
                    break;
            }

            // Just to prevent multiple messages spamming the console.
            this.lastUserEvent = event.type;
        }
    }
}
