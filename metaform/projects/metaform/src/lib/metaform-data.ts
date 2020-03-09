import { Subject } from 'rxjs';

export class MetaFormData {
    changes$ = new Subject<MFValueChange>();

    private forceLowerCase = false;
    private data: Map<string, any> = new Map<string, any>();

    getValue(name: string): any {
        const fieldName = this.correctFieldName(name);
        if (this.data[fieldName]) {
            return this.data[fieldName];
        }
    }

    setValue(name: string, value: any) {
        const fieldName = this.correctFieldName(name);
        const oldValue = this.getValue(fieldName);
        if (oldValue !== value) {
            this.data[fieldName] = value;
            this.changes$.next(new MFValueChange(name, value));
        }
    }

    toJson(): string {
        return JSON.stringify(this, metaFormDataJsonReplacer, 2);
    }

    // In some circumstances, you may wish to force
    // lowercase field names in order to prevent mistypings
    // causing you issues. In others, you'll want to
    // preserve cases passed in, but you will need to ensure
    // that all uses are correct.
    private correctFieldName(name: string): string {
        return (this.forceLowerCase ? name.toLowerCase() : name);
    }
}

export class MFValueChange {
    name: string;
    value: string;
    constructor(name: string, value: string) {
        this.name = name;
        this.value = value;
    }
}

export class MFOptionsChanged {
    name: string;
    countOfOptions: number;
    constructor(name: string, count: number) {
        this.name = name;
        this.countOfOptions = count;
    }
}

function metaFormDataJsonReplacer(key: string, value: any) {
    switch (key) {
        case 'changes$':
            return undefined;
        default:
            return value;
    }
}
