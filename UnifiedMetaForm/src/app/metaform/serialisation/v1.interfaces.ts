export interface Section {
    id: number;
    title: string;
}

export interface Validator {
    type: string;
    message: string;
    value: string;
}

export interface ValidatorsAsync {
    type: string;
    url: string;
    message: string;
}

export interface List {
    code: string;
    description: string;
}

export interface OptionSource {
    url: string;
}

export interface Options {
    expandOptions: boolean;
    list: List[];
    nullItem: string;
    optionSource: OptionSource;
}

export interface Control {
    controlType: number;
    textType?: number;
    maxLength?: number;
    placeholder?: string;
    name: string;
    validators?: Validator[];
    validatorsAsync?: ValidatorsAsync[];
    dateType?: number;
    start?: string;
    end?: string;
    hourStart?: number;
    hourEnd?: number;
    minuteStep?: number;
    optionLayout?: number;
    optionType?: number;
    options?: Options;
    text?: string;
}

export interface Question {
    sectionId: number;
    controls: Control[];
    controlLayout: number;
    name: string;
    caption: string;
    footnote?: string;
}

export interface IMetaFormV1 {
    name: string;
    drawType: number;
    dataSource?: string;
    version: number;
    allowSaves?: boolean;
    dateModified: Date;
    sections: Section[];
    questions: Question[];
    title: string;
}

