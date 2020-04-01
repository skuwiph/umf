import { MetaForm, MFControl, MFValidator, MFValidatorAsync } from '../metaform';
import { MetaFormControlType } from '../metaform-enums';
import { IMetaFormV1 } from './v1.interfaces';
import { HttpClient } from '@angular/common/http';

export class MetaformDeserialiser {
    static deserialise(data: IMetaFormV1, http: HttpClient): MetaForm {
        const form = new MetaForm();
        form.name = data.name;
        form.title = data.title;
        form.version = data.version;
        form.drawType = data.drawType;
        form.dataSource = data.dataSource;
        form.dateModified = data.dateModified;

        for (const s of data.sections) {
            form.addSection(s.title);
        }

        for (const q of data.questions) {
            const fq = form.addQuestion(q.name, q.caption, q.captionFootnote, q.controlLayout);
            fq.sectionId = q.sectionId;
            fq.ruleToMatch = q.ruleToMatch;
            for (const c of q.controls) {
                let fc: MFControl;
                switch (c.controlType) {
                    case MetaFormControlType.Text:
                        fc = fq.addTextControl(c.name, c.textType, c.maxLength, c.placeholder);
                        break;
                    case MetaFormControlType.Label:
                        fq.addLabel(c.text);
                        break;
                    case MetaFormControlType.Html:
                        fq.addHtml(c.html);
                        break;
                    case MetaFormControlType.Date:
                        fc = fq.addDateControl(c.name, c.dateType);
                        break;
                    case MetaFormControlType.Time:
                        fc = fq.addTimeControl(c.name, c.minuteStep, c.hourStart, c.hourEnd);
                        break;
                    case MetaFormControlType.DateTime:
                        fc = fq.addDateTimeControl(c.name, c.minuteStep, c.hourStart, c.hourEnd);
                        break;
                    case MetaFormControlType.Option:
                        fc = fq.addOptionControl(c.name, c.options, c.optionLayout);
                        break;
                    case MetaFormControlType.OptionMulti:
                        fc = fq.addOptionMultiControl(c.name, c.options, c.optionLayout);
                        break;
                    case MetaFormControlType.Toggle:
                        fc = fq.addToggleControl(c.name, c.text);
                        break;
                    case MetaFormControlType.TelephoneAndIddCode:
                        fc = fq.addTelephoneAndIddControl(c.name, c.maxLength, c.placeholder);
                        break;
                    case MetaFormControlType.Slider:
                        fc = fq.addSliderControl(c.name, c.text, c.min, c.max, c.step);
                        break;
                    default:
                        console.warn(`Missing type: ${c.controlType}, name: ${c.name}`);
                        break;
                }

                if (c.validators) {
                    for (const v of c.validators) {
                        switch (v.type) {
                            case 'Required':
                                fc.addValidator(MFValidator.Required(v.message));
                                break;
                            case 'Email':
                                fc.addValidator(MFValidator.Email(v.message));
                                break;
                            case 'Date':
                                fc.addValidator(MFValidator.Date(v.message));
                                break;
                            case 'Time':
                                fc.addValidator(MFValidator.Time(v.message));
                                break;
                            case 'AnswerMustMatch':
                                fc.addValidator(MFValidator.AnswerMustMatch(v.value, v.message));
                                break;
                            case 'AnswerAfterDate':
                                fc.addValidator(MFValidator.AnswerAfterDate(v.value, v.message));
                                break;
                            case 'AnswerBeforeDate':
                                fc.addValidator(MFValidator.AnswerBeforeDate(v.value, v.message));
                                break;
                            case 'AnswerAfterTime':
                                fc.addValidator(MFValidator.AnswerAfterTime(v.value, v.message));
                                break;
                            case 'AnswerBeforeTime':
                                fc.addValidator(MFValidator.AnswerBeforeTime(v.value, v.message));
                                break;
                            case 'ExceedWordCount':
                                fc.addValidator(
                                    MFValidator.AnswerMustExceedWordCount(parseInt(v.value, 10), v.message)
                                );
                                break;
                            case 'DateTime':
                                fc.addValidator(MFValidator.DateTime(v.message));
                                break;
                            default:
                                console.warn(`Got validator of type: ${v.type} and NO implementation`);
                        }
                    }
                }

                if (c.validatorsAsync) {
                    for (const va of c.validatorsAsync) {
                        switch (va.type) {
                            case 'Async':
                                fc.addValidatorAsync(MFValidatorAsync.AsyncValidator(http, va.url, va.message));
                                break;
                            default:
                                console.warn(`Got async validator of unknown type: ${va.type}`);
                        }
                    }
                }
            }
        }
        return form;
    }
}
