var express = require("express");
var cors = require('cors');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get("/url", (req, res, next) => {
    res.json(["Tony", "Lisa", "Michael", "Ginger", "Food"]);
});

//allow OPTIONS on all resources
app.options('*', cors());
app.post('*', cors());

app.get("/country", cors(), (req, res, next) => {
    res.json([
        { 'code': 'UK', 'description': 'United Kingdom' },
        { 'code': 'DE', 'description': 'Germany' },
        { 'code': 'ES', 'description': 'Spain' },
        { 'code': 'FR', 'description': 'France' },
        { 'code': 'PT', 'description': 'Portugal' },
    ]);
});

app.get("/country/:countryCode/regions", cors(), (req, res, next) => {
    var countryCode = req.params.countryCode.toUpperCase();
    if (countryCode === 'UK') {
        res.json([
            { 'code': '1', 'description': 'Scotland' },
            { 'code': '2', 'description': 'Northern Ireland' },
            { 'code': '3', 'description': 'Wales' },
            { 'code': '4', 'description': 'England' }
        ]);
    } else if (countryCode === 'DE') {
        res.json([
            { 'code': '5', 'description': 'Baden-Württemberg' },
            { 'code': '6', 'description': 'Bavaria' },
            { 'code': '7', 'description': 'Berlin' },
            { 'code': '8', 'description': 'Hamburg' },
            { 'code': '9', 'description': 'Bremen' },
            { 'code': '10', 'description': 'Saxony' },
            { 'code': '11', 'description': 'North Rhine-Westphalia' }
        ]);
    } else {
        res.json([
            { 'code': '99', 'description': 'Default Region' }
        ]);
    }
});

app.post("/validate/email", cors(), (req, res, next) => {
    var check = req.body.check.toLowerCase();
    console.log(`Validate email called with '${check}'`);

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

app.get("/form/test-form", cors(), (req, res, next) => {
    res.json(
        {
            "name": "test-form",
            "drawType": 2,
            "version": 1,
            "allowSaves": false,
            "dateModified": "2020-02-21T18:20:34.405Z",
            "sections": [{
                "id": 1,
                "title": "Default"
            }],
            "questions": [{
                "controls": [{
                    "controlType": 1,
                    "textType": 0,
                    "maxLength": 50,
                    "placeholder": "First or given name",
                    "name": "firstName",
                    "validators": [{
                        "type": "Required",
                        "message": "This field is required"
                    }]
                },
                {
                    "controlType": 1,
                    "textType": 0,
                    "maxLength": 70,
                    "placeholder": "Middle name(s)",
                    "name": "middleName",
                    "validators": []
                },
                {
                    "controlType": 1,
                    "textType": 0,
                    "maxLength": 50,
                    "placeholder": "Last or family name",
                    "name": "lastName",
                    "validators": [{
                        "type": "Required",
                        "message": "This field is required"
                    }]
                }
                ],
                "controlLayout": 1,
                "name": "q_name",
                "caption": "Please enter your name"
            },
            {
                "controls": [{
                    "controlType": 1,
                    "textType": 3,
                    "maxLength": 255,
                    "placeholder": "email@example.com",
                    "name": "email",
                    "validators": [{
                        "type": "Required",
                        "message": "This field is required"
                    },
                    {
                        "type": "Email",
                        "message": "Please enter a valid email address"
                    }
                    ],
                    "validatorsAsync": [{
                        "type": "Async",
                        "url": "http://localhost:3000/validate/email",
                        "message": "Please enter a different email!"
                    }]
                }],
                "controlLayout": 1,
                "name": "q_email",
                "caption": "Please enter your email address"
            },
            {
                "controls": [{
                    "controlType": 1,
                    "textType": 2,
                    "maxLength": 255,
                    "placeholder": "Password",
                    "name": "password",
                    "validators": [{
                        "type": "Required",
                        "message": "This field is required"
                    }]
                },
                {
                    "controlType": 1,
                    "textType": 2,
                    "maxLength": 255,
                    "placeholder": "Confirm Password",
                    "name": "confirmPassword",
                    "validators": [{
                        "type": "Required",
                        "message": "This field is required"
                    },
                    {
                        "type": "AnswerMustMatch",
                        "message": "Passwords do not match!",
                        "value": "[password]"
                    }
                    ]
                }
                ],
                "controlLayout": 1,
                "name": "q_password",
                "caption": "Please choose a password"
            },
            {
                "controls": [{
                    "controlType": 3,
                    "dateType": 0,
                    "start": "2010-01-01",
                    "end": "2016-06-04",
                    "name": "leavingDate",
                    "validators": [{
                        "type": "Date",
                        "message": "Please enter a valid date"
                    }]
                },
                {
                    "controlType": 3,
                    "dateType": 1,
                    "name": "expiryMonth",
                    "validators": [{
                        "type": "Date",
                        "message": "Please enter a valid date"
                    },
                    {
                        "type": "AnswerAfterDate",
                        "message": "Date must be after September 1990",
                        "value": "1990-09-01"
                    }
                    ]
                }
                ],
                "controlLayout": 1,
                "name": "q_dates",
                "caption": "Please enter some dates"
            },
            {
                "controls": [{
                    "controlType": 4,
                    "hourStart": 8,
                    "hourEnd": 18,
                    "minuteStep": 15,
                    "name": "startTime",
                    "validators": [{
                        "type": "Time",
                        "message": "Please enter a valid time"
                    }]
                }],
                "controlLayout": 1,
                "name": "q_timeStart",
                "caption": "Please enter a start time"
            },
            {
                "controls": [{
                    "controlType": 4,
                    "hourStart": 8,
                    "hourEnd": 18,
                    "minuteStep": 15,
                    "name": "endTime",
                    "validators": [{
                        "type": "Time",
                        "message": "Please enter a valid time"
                    },
                    {
                        "type": "AnswerAfterTime",
                        "message": "End time must be after Start time",
                        "value": "[startTime]"
                    }
                    ]
                }],
                "controlLayout": 1,
                "name": "q_timeEnd",
                "caption": "Please enter an end time"
            },
            {
                "controls": [{
                    "optionLayout": 1,
                    "controlType": 2,
                    "optionType": 0,
                    "options": {
                        "expandOptions": true,
                        "list": [{
                            "code": "Y",
                            "description": "Yes"
                        },
                        {
                            "code": "N",
                            "description": "No"
                        }
                        ]
                    },
                    "name": "option1",
                    "validators": [{
                        "type": "Required",
                        "message": "Please select an option"
                    }]
                }],
                "controlLayout": 1,
                "name": "q_option1",
                "caption": "Please answer the option question"
            },
            {
                "controls": [{
                    "optionLayout": 1,
                    "controlType": 2,
                    "optionType": 1,
                    "options": {
                        "expandOptions": true,
                        "list": [{
                            "code": "en",
                            "description": "English"
                        },
                        {
                            "code": "fr",
                            "description": "French"
                        },
                        {
                            "code": "de",
                            "description": "German"
                        },
                        {
                            "code": "es",
                            "description": "Spanish"
                        }
                        ]
                    },
                    "name": "option2",
                    "validators": [{
                        "type": "Required",
                        "message": "Please select an option"
                    }]
                }],
                "controlLayout": 1,
                "name": "q_option2",
                "caption": "Please select all applicable options"
            },
            {
                "controls": [{
                    "optionLayout": 1,
                    "controlType": 2,
                    "optionType": 0,
                    "options": {
                        "expandOptions": false,
                        "nullItem": "Please Select",
                        "list": null,
                        "optionSource": {
                            "url": "http://localhost:3000/country"
                        }
                    },
                    "name": "countryCode",
                    "validators": [{
                        "type": "Required",
                        "message": "Please select an option"
                    }]
                }],
                "controlLayout": 1,
                "name": "q_country",
                "caption": "Please select a country from URL"
            },
            {
                "controls": [{
                    "optionLayout": 1,
                    "controlType": 2,
                    "optionType": 0,
                    "options": {
                        "expandOptions": true,
                        "nullItem": null,
                        "list": null,
                        "optionSource": {
                            "url": "http://localhost:3000/country/[countryCode]/regions"
                        }
                    },
                    "name": "region",
                    "validators": [{
                        "type": "Required",
                        "message": "Please select a region"
                    }]
                }],
                "controlLayout": 1,
                "name": "q_region",
                "caption": "Please select a region from URL"
            }
            ],
            "title": "A Test Form from JSON"
        }
    );
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
})