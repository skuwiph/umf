# Metaform

## Quick Start

### Declare a form

``` (typescript)
form = this.formService.createForm('sample', 'Sample Form', MetaFormDrawType.EntireForm);
```

### Draw types

#### EntireForm

This will display all form questions on a single page.

#### SingleSection

By setting sections up on your form, you can display all questions within a given section:

``` (typescript)
form.addSection(title: 'Section #1', ruleToMatch?: 'ruleName');
```

Questions must be added to the desired section via ordinal:

``` (typescript)
form
    .addQuestion('country', 'Please select a country from URL')
    .setSection(1)
```

#### SingleQuestion

This will display all controls for a single question.

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

### Add an asynchronous validator to a control

``` (typescript)
    .addValidatorAsync(
        MFValidatorAsync.AsyncValidator(
            this.http,
            'http://localhost:3000/validate/email',
            'This email has already been registered'
        )
```

Where `this.http` is of type `HttpClient`.

The endpoint must return JSON of the format:

``` (json)
{
    valid: true|false
}
```

As a simple `node.js` example:

``` (javascript)
app.post("/validate/email", cors(), (req, res, next) => {
    var check = req.body.check.toLowerCase();
    // console.log(`Validate email called with '${check}'`);

    if (check === 'fail@example.com') {
        res.json(
            { 'valid': false }
        );
    } else {
        res.json(
            { 'valid': true }
        );
    }
});
```

_Note: async validation does complicate the control flow somewhat, and is best avoided until a refactoring of the validation logic to work purely on promises/observables can be completed._

In most instances the use of async can be avoided as, per the above example, many of the requirements can be managed on form submit in your own code.

### Declare a rule

``` (typescript)
ruleService
    .addRule('HasSelectedFourthOption', RuleMatchType.MatchAll)
    .addPart('fieldName', RuleComparison.Contains, '4')
    .addPart('fieldName2', RuleComparison.Equals, 'Match-Me-Too');
```

Rule constants:

``` (typescript)
export enum RuleMatchType {
    MatchAny,
    MatchAll
}
```

``` (typescript)
export enum RuleComparison {
    Unknown,
    Equals,
    NotEquals,
    LessThan,
    GreaterThan,
    Contains = 5,
    Between
}
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
<lib-metaform-display [form]="form" [showButtons]="true" (formEvent)="onFormEvent($event)"></lib-metaform-display>
```

Optional `@Input` parameters:

``` (html)
[backButtonLabel]="'◄'" 
[nextButtonLabel]="'Next ►'" 
[submitButtonLabel]="'Submit'"
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
        case UserEventType.NavigationButtonClickedBack:
            console.log('The previous/back button has been clicked');
            break;
        case UserEventType.NavigationButtonClickedForward:
            console.log('The forward/next button has been clicked')
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

The `MetaFormUserEvent.type` is guaranteed to be `FormInitialised` before any other event is sent.

### Display text on your page based on rule evaluation

``` (typescript)
    this.rules
        .addRule('HasSelectedFourthOption', RuleMatchType.MatchAll)
        .addPart('mops', RuleComparison.Contains, '4');
```

Add the `lib-rule-evaluator` tag to your page:

``` (html)
<lib-rule-evaluator [rule]="'HasSelectedFourthOption'" [data]="form.answers">
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

#### Load a form from a local JSON file

``` (typescript)
    var jsonLoaded: MetaForm = null;

    const otherOptions: SpecialOption[] = [];
    otherOptions.push(new SpecialOption('A', 'Option A',
        `Displayed on selection of Option <i>A</i>`));
    otherOptions.push(new SpecialOption('B', 'Option B',
        `Displayed on selection of Option <u>B</u>`));
    otherOptions.push(new SpecialOption('C', 'Option C',
        `Displayed on selection of Option <b>C</b>`));

    this.formService.loadFormWithName('./assets/', 'sample_2.json')
        .subscribe(d => {
            jsonLoaded = d;
            jsonLoaded.rules = this.rules.rules;

            this.form = jsonLoaded;

            this.form.change$
            .pipe(
                filter(
                    (c: MFValueChange) => c.name === 'otherOption'),
            )
            .subscribe((chg: MFValueChange) => {
                const selected = otherOptions.find(o => o.code === chg.value);
                const text = selected?.fullText ?? null;
                this.form.setValue('specialOptionDescription', text);
            });
        },
        error => {
            console.error(error);
        });
```
