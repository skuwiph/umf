import { MetaFormData } from './metaform-data';

export class BusinessRule {
    name: string;
    matchType: RuleMatchType;
    parts: IRulePart[];

    constructor(name: string, matchType: RuleMatchType, parts?: IRulePart[]) {
        this.name = name;
        this.matchType = matchType;
        this.parts = parts ?? [];
    }

    addPartFrom(part: IRulePart): BusinessRule {
        this.parts.push(part);
        return this;
    }

    addPart(fieldName: string, comparison: RuleComparison, value: string): BusinessRule {
        const rp = new RulePart(fieldName, comparison, value);
        this.parts.push(rp);

        return this;
    }

    addPartRange(fieldName: string, comparison: RuleComparison, min: string, max: string): BusinessRule {
        const rp = new RulePart(fieldName, comparison, undefined, min, max);
        this.parts.push(rp);

        return this;
    }

    evaluate(data: MetaFormData): boolean {
        let success = false;
        for (const rp of this.parts) {
            success = rp.evaluate(data);

            // Short circuit
            if (success && this.matchType === RuleMatchType.MatchAny) {
                // console.log(`Match Any, evaluation true`);
                return true;
            }

            // Short circuit
            if (!success && this.matchType === RuleMatchType.MatchAll) {
                // console.log(`Match All, evaluation false`);
                return false;
            }
        }
        return success;
    }
}

export interface IRulePart {
    evaluate(data: MetaFormData): boolean;
}

export class RulePart implements IRulePart {
    fieldName: string;
    comparison: RuleComparison;
    value?: any;

    min?: any;
    max?: any;

    constructor(fieldName: string, comparison: RuleComparison, value?: string, min?: string, max?: string) {
        this.fieldName = fieldName;
        this.comparison = comparison;
        this.value = value;
        this.min = min;
        this.max = max;
    }

    evaluate(data: MetaFormData): boolean {
        const comparedValue = data.getValue(this.fieldName);

        // console.log(`Got ${comparedValue}, looking for ${this.comparison} with value of ${this.value}`);

        switch (this.comparison) {
            case RuleComparison.Equals:
                // console.log('#### Equals!');
                if (typeof this.value === 'string' || typeof this.value === 'number') {
                    return this.evaluateEquality(this.value, comparedValue);
                } else if (this.value instanceof Date) {
                    return this.evaluateEqualityDate(this.value, comparedValue);
                } else if (typeof this.value === 'boolean') {
                    // console.info(`boolean equals`);
                    return this.value === comparedValue;
                }
                break;
            case RuleComparison.NotEquals:
                // console.debug("#### Not Equals!");
                if (typeof this.value === 'string' || typeof this.value === 'number') {
                    return !this.evaluateEquality(this.value, comparedValue);
                } else if (this.value instanceof Date) {
                    return !this.evaluateEqualityDate(this.value, comparedValue);
                } else if (typeof this.value === 'boolean') {
                    return this.value !== comparedValue;
                }
                break;
            case RuleComparison.Between:
                // // console.debug("#### Between!");
                if (typeof this.min === 'number') {
                    return this.evaluateBetween(this.min, this.max, comparedValue);
                } else if (this.min instanceof Date) {
                    // // console.debug("This value is a date between");
                    return this.evaluateBetweenDate(this.min, this.max, comparedValue);
                }
                break;
            case RuleComparison.Contains:
                if (typeof this.value === 'string' || typeof this.value === 'number') {
                    return this.evaluateContains(this.value, comparedValue);
                } else if (this.value instanceof Date) {
                    console.error(`No implementation for evaluating dates on rule part with field '${this.fieldName}'`);
                }
                break;
            case RuleComparison.GreaterThan:
                if (typeof this.value === 'number') {
                    return this.evaluateGreaterThan(this.value, comparedValue);
                } else {
                    console.error('BusinessRulePart::evaluateRule: Greater than can be used only with numbers!');
                }
                break;
            default:
                console.error('BusinessRulePart::evaluateRule: No comparison matches!');
        }

        return false;
    }

    private evaluateEquality(value: any, comparedValue: any): boolean {
        return value === comparedValue;
    }

    private evaluateEqualityDate(value: Date, comparedValue: Date): boolean {
        return value.getTime() === comparedValue.getTime();
    }

    private evaluateBetween(lower: number, upper: number, comparedValue: number): boolean {
        return lower <= comparedValue && upper >= comparedValue;
    }

    private evaluateGreaterThan(value: number, comparedValue: number): boolean {
        return value > comparedValue;
    }

    private evaluateBetweenDate(lower: Date, upper: Date, comparedValue: Date): boolean {
        // if( lower.getTime() <= comparedValue.getTime())
        //     // console.debug("Date is larger than lower bound");

        // if( upper.getTime() >= comparedValue.getTime())
        //     // console.debug("Date is smaller than upper bound");

        return lower.getTime() <= comparedValue.getTime() && upper.getTime() >= comparedValue.getTime();
    }

    /**
     * Does the array have a particular item contained within?
     * @param value (any) - value to find in array
     * @param comparedValue (any) - array
     */
    private evaluateContains(value: any, comparedValue: any): boolean {
        if (Array.isArray(comparedValue)) {
            const arr = comparedValue || [];
            const item = arr.find(v => v === value);

            return item;
        } else {
            if (typeof comparedValue === 'string') {
                const vs = comparedValue as string;
                if (vs.indexOf(',') > -1) {
                    const split = vs.split(',');
                    if (split.find(s => s === value)) {
                        return true;
                    }
                }
            }
            // Bit weird, but if it's not an array, it should be a straight equality check
            return this.evaluateEquality(value, comparedValue);
        }
    }
}

export enum RuleMatchType {
    MatchAny,
    MatchAll
}

export enum RuleComparison {
    Unknown,
    Equals,
    NotEquals,
    LessThan,
    GreaterThan,
    Contains = 5,
    Between
}
