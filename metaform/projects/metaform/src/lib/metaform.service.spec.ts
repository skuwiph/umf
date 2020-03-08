import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { MetaFormService } from './metaform.service';

describe('MetaFormService', () => {
    let service: MetaFormService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule],
            providers: [MetaFormService]
        });
        service = TestBed.inject(MetaFormService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });


    it('should create a form from Json', () => {
        const form = service.loadMetaForm(JSON.parse(testJson));
        expect(form.questions.length).toEqual(7, `Expected the sample form to have 7 questions`);
    });

    const testJson = `
{
    "name": "sample",
    "drawType": 2,
    "version": 1,
    "allowSaves": false,
    "dateModified": "2020-03-08T21:27:30.591Z",
    "sections": [],
    "questions": [
        {
            "controls": [
                {
                    "controlType": 7,
                    "name": "interviewDateTime",
                    "hourStart": 7,
                    "hourEnd": 21,
                    "minuteStep": 1,
                    "validators": [
                        {
                            "type": "DateTime",
                            "message": "Please enter a value"
                        }
                    ],
                    "label": "Start"
                }
            ],
            "controlLayout": 1,
            "available": true,
            "captionFootnote": "",
            "name": "q_q0",
            "caption": "Enter the interview date and time"
        },
        {
            "controls": [
                {
                    "controlType": 2,
                    "textType": 0,
                    "maxLength": 50,
                    "placeholder": "First name",
                    "name": "firstName",
                    "validators": [
                        {
                            "type": "Required",
                            "message": "Please enter a value"
                        }
                    ]
                },
                {
                    "controlType": 2,
                    "textType": 0,
                    "maxLength": 50,
                    "placeholder": "Last name",
                    "name": "lastName",
                    "validators": [
                        {
                            "type": "Required",
                            "message": "Please enter a value"
                        }
                    ]
                }
            ],
            "controlLayout": 1,
            "available": true,
            "name": "q_q1",
            "caption": "Please enter your name"
        },
        {
            "controls": [
                {
                    "iddList": [],
                    "controlType": 8,
                    "name": "contactNumber",
                    "placeholder": "number",
                    "maxLength": 10,
                    "validators": [
                        {
                            "type": "Required",
                            "message": "Please enter a value"
                        }
                    ]
                }
            ],
            "controlLayout": 1,
            "available": true,
            "name": "q_q1a",
            "caption": "Please enter your telephone number"
        },
        {
            "controls": [
                {
                    "optionLayout": 0,
                    "controlType": 3,
                    "options": {
                        "expandOptions": true,
                        "nullItem": null,
                        "list": [
                            {
                                "code": "Y",
                                "description": "Yes"
                            },
                            {
                                "code": "N",
                                "description": "No"
                            }
                        ]
                    },
                    "name": "yesOrNo",
                    "validators": [
                        {
                            "type": "Required",
                            "message": "Please select an answer"
                        }
                    ]
                }
            ],
            "controlLayout": 1,
            "available": true,
            "name": "q_q3",
            "caption": "Can you answer yes or no?"
        },
        {
            "controls": [
                {
                    "optionLayout": 1,
                    "controlType": 3,
                    "options": {
                        "expandOptions": false,
                        "nullItem": "Please Select",
                        "list": [
                            {
                                "code": "A",
                                "description": "Option A",
                                "fullText": "This option's text <b>describes something relevant</b> to the user."
                            },
                            {
                                "code": "B",
                                "description": "Option B",
                                "fullText": "This option went to climb a <b>particularly</b> tall mountain."
                            },
                            {
                                "code": "C",
                                "description": "Option C",
                                "fullText": "This option <i>didn't want to go outside</i>, but was <u>tempted by the sunshine</u>. "
                            }
                        ]
                    },
                    "name": "otherOption",
                    "validators": [
                        {
                            "type": "Required",
                            "message": "Please select an answer"
                        }
                    ]
                },
                {
                    "controlType": 1,
                    "name": "html",
                    "html": "[specialOptionDescription]"
                }
            ],
            "controlLayout": 1,
            "available": true,
            "captionFootnote": null,
            "name": "q_q41",
            "caption": "Select an option?"
        },
        {
            "controls": [
                {
                    "optionLayout": 0,
                    "controlType": 4,
                    "options": {
                        "expandOptions": true,
                        "nullItem": null,
                        "list": [
                            {
                                "code": "1",
                                "description": "First"
                            },
                            {
                                "code": "2",
                                "description": "Second"
                            },
                            {
                                "code": "3",
                                "description": "Third"
                            },
                            {
                                "code": "4",
                                "description": "Fourth"
                            }
                        ]
                    },
                    "name": "mops",
                    "validators": []
                }
            ],
            "controlLayout": 1,
            "available": true,
            "captionFootnote": null,
            "name": "q_q4",
            "caption": "Please select all applicable answers?"
        },
        {
            "controls": [
                {
                    "controlType": 10,
                    "name": "volume",
                    "text": "Volume",
                    "min": 0,
                    "max": 11,
                    "step": 1,
                    "validators": []
                }
            ],
            "controlLayout": 1,
            "available": true,
            "name": "q_q5",
            "caption": "How loud should we play?"
        }
    ],
    "title": "Sample Form"
}    `;
});
