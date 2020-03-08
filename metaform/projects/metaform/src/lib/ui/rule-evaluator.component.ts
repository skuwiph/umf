import { Component, OnInit, Input } from '@angular/core';
import { BusinessRuleService } from '../business-rule.service';
import { MetaFormData, MFValueChange } from '../metaform-data';

@Component({
    selector: 'lib-rule-evaluator',
    template: `
        <ng-container *ngIf="ruleEvaluatesTrue"><ng-content></ng-content></ng-container>
    `,
    styleUrls: ['./rule-evaluator.component.css']
})
export class RuleEvaluatorComponent implements OnInit {
    @Input() rule: string;
    @Input() data: MetaFormData;

    ruleEvaluatesTrue = false;

    constructor(private ruleService: BusinessRuleService) { }

    ngOnInit(): void {
        if (this.rule) {
            this.ruleEvaluatesTrue = this.ruleService.evaluateRule(this.rule, this.data);
            if (this.data) {
                this.data.changes$.subscribe((change: MFValueChange) => {
                    this.ruleEvaluatesTrue = this.ruleService.evaluateRule(this.rule, this.data);
                });
            } else {
                console.warn(
                    `RuleEvaluatorComponent has not been given an instantiated MetaFormData object for its [data] attribute!`
                );
            }
        }
    }
}
