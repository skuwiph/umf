import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BusinessRule, RuleMatchType } from './business-rule';
import { MetaFormAnswers } from './meta-form';

@Injectable({
    providedIn: 'root'
})
export class BusinessRuleService {

    constructor(private http: HttpClient) { }

    rules: Map<string, BusinessRule> = new Map<string, BusinessRule>();

    add(rule: BusinessRule) {
        if (!this.rules.has(rule.name)) {
            this.rules.set(rule.name, rule);
        } else {
            console.warn(`The rule ${rule.name} has already been added to the rule list!`);
        }

        return rule;
    }

    addRule(name: string, matchType: RuleMatchType): BusinessRule {
        const r = new BusinessRule(name, matchType);

        return this.add(r);
    }

    evaluateRule(name: string, data: MetaFormAnswers): boolean {
        if (this.rules.has(name)) {
            const rule = this.rules.get(name);
            return rule.evaluate(data);
        } else {
            console.error(`Rule ${name} was not found in the list`);
            for (const [key, value] of this.rules) {
                console.log(key, value);
            }
        }

        return false;
    }
}
