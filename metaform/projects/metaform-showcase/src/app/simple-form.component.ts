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

@Component({
    selector: 'app-simple-form',
    templateUrl: './simple-form.component.html',
    styleUrls: ['./simple-form.component.scss']
})
export class SimpleFormComponent implements OnInit {
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

        // Load form from assets
        var jsonLoaded: MetaForm = null;
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

        this.formService.loadFormWithName('./assets/', 'sample_2.json').subscribe(
            d => {
                jsonLoaded = d;
                jsonLoaded.rules = this.rules.rules;

                this.form = jsonLoaded;

                this.form.change$
                    .pipe(filter((c: MFValueChange) => c.name === 'otherOption'))
                    .subscribe((chg: MFValueChange) => {
                        const selected = otherOptions.find(o => o.code === chg.value);
                        const text = selected?.fullText ?? null;
                        this.form.setValue('specialOptionDescription', text);
                    });
            },
            error => {
                console.error(error);
            }
        );
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

export class SpecialOption extends MFOptionValue {
    fullText: string;

    constructor(code: string, description: string, fullText: string) {
        super(code, description);
        this.fullText = fullText;
    }
}
