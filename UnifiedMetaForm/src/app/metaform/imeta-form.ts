import { MetaFormDrawType } from './meta-form-enums';

export interface IMetaForm {
    name: string;
    title: string;
    version: number;
    dateModified: Date;
    dataSource?: string;
    drawType: MetaFormDrawType;
    allowSaves?: boolean;
}

export interface IMFQuestion {
    sectionId: number;
    caption: string;
    captionFootnote?: string;
    name: string;
    ruleToMatch?: string;
    animation?: [IMFAnimation];
    items: [IMFItem];
}

export interface IMFAnimation {
    event: string;
    name: string;
}

export interface IMFItem {
    controlType: string;
    name: string;
}

export interface IMFTextItem {
    textType: string;
    maxLength: number;
    placeholder?: string;
}

export interface IMFOptionItem {
    optionType: string;
    nullItem?: string;
    options?: [IMFOptionValue];
    optionSource?: string;
}

export interface IMFOptionValue {
    code: string;
    description: string;
}

export interface IMFValidator {
    name: string;
    message: string;
}
