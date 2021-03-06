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
import { filter } from 'rxjs/operators';
import { MFValueChange } from 'projects/metaform/src/lib/metaform-data';
import { SpecialOption } from './simple-form.component';

@Component({
    selector: 'app-simple-coded-form',
    templateUrl: './simple-coded-form.component.html',
    styleUrls: ['./simple-coded-form.component.scss']
})
export class SimpleCodedFormComponent implements OnInit {
    title = 'metaform-showcase';
    form: MetaForm;

    private lastUserEvent: UserEventType;

    constructor(private formService: MetaFormService, private rules: BusinessRuleService) {}

    ngOnInit(): void {
        // Add some default rules
        this.rules.addRule('YesNoIsYes', RuleMatchType.MatchAny).addPart('yesOrNo', RuleComparison.Equals, 'Y');

        this.rules
            .addRule('HasSelectedFourthOption', RuleMatchType.MatchAll)
            .addPart('mops', RuleComparison.Contains, '4');

        // Generate the form and link to the created rules
        this.form = this.formService.createForm('sample', 'Simple Form from Code', MetaFormDrawType.SingleQuestion);
        this.form.rules = this.rules.rules;

        // Create the questions and controls for the form
        this.form
            .addQuestion('q2', 'Please enter your email address')
            .addTextControl('email', MetaFormTextType.SingleLine, 255, 'Email')
            .addValidator(MFValidator.Required('Please enter a value'))
            .addValidator(MFValidator.Email('Please enter a valid email address'));
        this.form.getQuestion('q2').addToggleControl('marketing', 'Please send me marketing emails');

        this.form.getQuestion('q2').addLabel('Please enter a password', 'caption');

        this.form
            .getQuestion('q2')
            .addTextControl('password', MetaFormTextType.Password, 255, 'Password')
            .addValidator(MFValidator.Required('Please enter your password'));
        this.form
            .getQuestion('q2')
            .addTextControl('confirmPassword', MetaFormTextType.Password, 255, 'Confirm password')
            .addValidator(MFValidator.AnswerMustMatch('[password]', 'Passwords must match'));

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
            .addQuestion('q0', 'Enter the interview date and time', '')
            .addDateTimeControl('interviewDateTime', 0, 7, 21)
            .addLabel('Start')
            .addValidator(MFValidator.DateTime('Please enter a value'))
            .addValidator(MFValidator.AnswerAfterDate('%TODAY', 'Date must be later than today!'));

        const yesno: MFOptionValue[] = [];
        yesno.push(new MFOptionValue('Y', 'Yes'));
        yesno.push(new MFOptionValue('N', 'No'));

        const mop: MFOptionValue[] = [];
        mop.push(new MFOptionValue('1', 'First'));
        mop.push(new MFOptionValue('2', 'Second'));
        mop.push(new MFOptionValue('3', 'Third'));
        mop.push(new MFOptionValue('4', 'Fourth'));

        this.form
            .addQuestion('q3', 'Can you answer yes or no?')
            .addOptionControl('yesOrNo', MFOptions.OptionFromList(yesno, null, true), ControlLayoutStyle.Horizontal)
            .addValidator(MFValidator.Required('Please select an answer'));

        const otherOptions: SpecialOption[] = [];
        otherOptions.push(
            new SpecialOption('A', 'Option A', `This option's text <b>describes something relevant</b> to the user.`)
        );
        otherOptions.push(
            new SpecialOption('B', 'Option B', `This option went to climb a <b>particularly</b> tall mountain.`)
        );
        otherOptions.push(
            new SpecialOption(
                'C',
                'Option C',
                `This option <i>didn't want to go outside</i>, but was <u>tempted by the sunshine</u>. `
            )
        );

        this.form
            .addQuestion('q41', 'Select an option?', null)
            .addOptionControl('otherOption', MFOptions.OptionFromList(otherOptions, 'Please Select', false))
            .addValidator(MFValidator.Required('Please select an answer'));

        this.form.getQuestion('q41').addHtml('[specialOptionDescription]');

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

        this.form.addQuestion('q5', 'How loud should we play?').addSliderControl('volume', 'Volume', 0, 11);

        this.form
            .addQuestion('q6', 'Mailing address')
            .addTextControl('address1', MetaFormTextType.SingleLine, 50, 'House address')
            .addValidator(MFValidator.Required('Please enter your house address'));

        this.form.getQuestion('q6').addTextControl('address2', MetaFormTextType.SingleLine, 50);

        this.form
            .getQuestion('q6')
            .addTextControl('town', MetaFormTextType.SingleLine, 50, 'Town/city')
            .addValidator(MFValidator.Required('Please enter your town or city'));

        this.form
            .getQuestion('q6')
            .addTextControl('county', MetaFormTextType.SingleLine, 50, 'County/State')
            .addValidator(MFValidator.Required('Please enter your county or state'));

        this.form
            .getQuestion('q6')
            .addTextControl('postcode', MetaFormTextType.PostalCode, 10, 'Postal code')
            .addValidator(MFValidator.Required('Please enter your postal code'));

        // this.form.change$
        //     .pipe(
        //         filter(
        //             (c: MFValueChange) => c.name === 'interviewDateTime'),
        //     )
        //     .subscribe((chg: MFValueChange) => {
        //         this.dateTime = this.form.getValueAsDateTime(chg.name);
        //         console.log(`Value change on ${chg.name} to ${this.dateTime}`);
        //     });

        this.form.change$
            .pipe(filter((c: MFValueChange) => c.name === 'otherOption'))
            .subscribe((chg: MFValueChange) => {
                const selected = otherOptions.find(o => o.code === chg.value);
                const text = selected?.fullText ?? null;
                this.form.setValue('specialOptionDescription', text);
            });
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
                case UserEventType.NavigationButtonClickedBack:
                    console.log('The previous/back button has been clicked');
                    break;
                case UserEventType.NavigationButtonClickedForward:
                    console.log('The forward/next button has been clicked');
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
