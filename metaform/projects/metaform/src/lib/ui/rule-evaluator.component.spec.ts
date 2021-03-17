import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RuleEvaluatorComponent } from './rule-evaluator.component';
import { HttpClientModule } from '@angular/common/http';

describe('RuleEvaluatorComponent', () => {
    let component: RuleEvaluatorComponent;
    let fixture: ComponentFixture<RuleEvaluatorComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [HttpClientModule],
                declarations: [RuleEvaluatorComponent]
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(RuleEvaluatorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
