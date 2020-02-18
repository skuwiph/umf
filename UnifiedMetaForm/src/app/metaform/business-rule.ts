import { MetaFormAnswers } from './meta-form';

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

    evaluate(data: MetaFormAnswers): boolean {
        let success = false;
        for (const rp of this.parts) {
            success = rp.evaluate(data);

            // Short circuit
            if (success && this.matchType === RuleMatchType.MatchAny) {
                return true;
            }

            // Short circuit
            if (!success && this.matchType === RuleMatchType.MatchAll) {
                return false;
            }
        }
        return success;
    }
}

export interface IRulePart {
    evaluate(data: MetaFormAnswers): boolean;
}

export class RulePart implements IRulePart {
    fieldName: string;
    comparison: RuleComparison;
    value?: string;

    min?: string;
    max?: string;

    constructor(fieldName: string, comparison: RuleComparison, value?: string, min?: string, max?: string) {
        this.fieldName = fieldName;
        this.comparison = comparison;
        this.value = value;
        this.min = min;
        this.max = max;
    }

    evaluate(data: MetaFormAnswers): boolean {
        const enteredValue = data.getValue(this.fieldName);
        let valid = false;

        switch (this.comparison) {
            case RuleComparison.Equals:
                valid = this.value === enteredValue;
                break;
            default:
                console.error(`Unhandled comparison: ${this.comparison}`);
                return false;
        }

        return valid;
    }
}

export enum RuleMatchType {
    MatchAny,
    MatchAll
}

export enum RuleComparison {
    Equals,
    NotEquals,
    LessThan,
    GreaterThan,
    Between
}

