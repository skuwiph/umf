import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BusinessRule, RuleMatchType } from './business-rule';
import { IBusinessRule, IRulePart } from './serialisation/v1.interfaces';
import { MetaFormAnswers } from './metaform';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class BusinessRuleService {

    constructor(private http: HttpClient) { }

    rules: Map<string, BusinessRule> = new Map<string, BusinessRule>();

    loadRules(rulesUrl: string): Observable<boolean> {
        const subject = new Subject<boolean>();

        this.http.get(`${rulesUrl}`)
            .subscribe(
                (data: IBusinessRule[]) => {
                    for (const r of data) {
                        const rule = this.addRule(r.name, r.matchType);
                        for (const p of r.parts) {
                            rule.addPart(p.name, p.comparison, p.value);
                        }
                    }
                    subject.next(true);
                });
        return subject;
    }


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

    getRule(name: string): BusinessRule {
        // console.log(`Looking for ${name}`);
        return this.rules.get(name);
    }

    evaluateRule(name: string, data: MetaFormAnswers): boolean {
        if (this.rules.has(name)) {
            // console.log(`Got rule: ${name}`);
            const rule = this.rules.get(name);
            return rule.evaluate(data);
        } else {
            // console.error(`Rule ${name} was not found in the list`);
            for (const [key, value] of this.rules) {
                console.log(key, value);
            }
        }

        return false;
    }
}
