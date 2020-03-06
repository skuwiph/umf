# Metaform

## Quick Start

### Declare a form

``` (typescript)
form = this.formService.createForm('sample', 'Sample Form', MetaFormDrawType.EntireForm);
```

### Add a question to a form

``` (typescript)
form.addQuestion('q1', 'Please enter your name')
```

### Add a control to a question

``` (typescript)
.addTextControl('lastName', MetaFormTextType.SingleLine, 50, 'Last name')
```

### Add a validator to a control

``` (typescript)
.addValidator(MFValidator.Required('Please enter a value'))
```

### Declare a rule

``` (typescript)
ruleService
    .addRule('HasSelectedFourthOption', RuleMatchType.MatchAll)
    .addPart('fieldName', RuleComparison.Contains, '4');
```

### Link rules to a form

``` (typescript)
form.rules = this.rules.rules;
```

### Subscribe to form data changes

``` (typescript)
form.change$
    .subscribe((chg: MFValueChange) => {
        console.log(`Value change on ${chg.name} to ${chg.value}`);
    });
```

### Subscribe to a specific control change

``` (typescript)
form.change$
    .pipe(
        filter(
            (c: MFValueChange) => c.name === 'volume')
    )
    .subscribe((chg: MFValueChange) => {
        console.log(`Value change on ${chg.name} to ${chg.value}`);
    });
```

### Display the form

``` (html)
<lib-metaform-display [form]="form" [showButtons]="true"
 (formEvent)="onFormEvent($event)"></lib-metaform-display>
```

### Form events

``` (typescript)
onFormEvent(event: MetaFormUserEvent): void {
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
}
```

### Examples

#### Create a question with two text controls

``` (typescript)
// Generate the form and link to the created rules
form = this.formService.createForm('sample', 'Sample Form', MetaFormDrawType.EntireForm);
form.rules = ruleService.rules;

// Create the questions and controls for the form
form
    .addQuestion('q1', 'Please enter your name')
    .addTextControl('firstName', MetaFormTextType.SingleLine, 50, 'First name')
    .addValidator(MFValidator.Required('Please enter a value'));
form
    .getQuestion('q1')
    .addTextControl('lastName', MetaFormTextType.SingleLine, 50, 'Last name')
    .addValidator(MFValidator.Required('Please enter a value'));

```

#### Create a question with options

``` (typescript)
const yesno: MFOptionValue[] = [];
yesno.push(new MFOptionValue('Y', 'Yes'));
yesno.push(new MFOptionValue('N', 'No'));

form
    .addQuestion('q3', 'Can you answer yes or no?', null)
    .addOptionControl('yesOrNo', MFOptions.OptionFromList(yesno, null, true), ControlLayoutStyle.Horizontal)
    .addValidator(MFValidator.Required('Please select an answer'));

```

#### Create a question which displays dependent on another answer

``` (typescript)
ruleService
    .addRule('YesNoIsYes', RuleMatchType.MatchAny)
    .addPart('yesOrNo', RuleComparison.Equals, 'Y');

form
    .rules = ruleService.rules;

form
    .addQuestion('q3a', 'Enter a future date', null)
    .setDisplayRule('YesNoIsYes')
    .addDateControl('dateInTheFuture', MetaFormDateType.Full)
    .addLabel('Future Date')
    .addValidator(MFValidator.Date('Please enter a date'))
    .addValidator(MFValidator.AnswerAfterDate('%TODAY', 'Date must be later than today!'));
```
