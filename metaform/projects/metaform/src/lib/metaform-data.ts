import { Subject } from 'rxjs';

export class MetaFormData {
    changes$ = new Subject<MFValueChange>();

    private data: Map<string, any> = new Map<string, any>();

    getValue(name: string): any {
        if (this.data[name.toLowerCase()]) {
            return this.data[name.toLowerCase()];
        }
    }

    setValue(name: string, value: any) {
        const oldValue = this.getValue(name);
        if (oldValue !== value) {
            this.data[name.toLowerCase()] = value;
            this.changes$.next(new MFValueChange(name, value));
        }
    }

    toJson(): string {
        return JSON.stringify(this, metaFormDataJsonReplacer, 2);
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
