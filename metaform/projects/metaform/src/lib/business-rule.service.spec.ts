import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { BusinessRuleService } from './business-rule.service';
import { RuleMatchType, RuleComparison, IRulePart } from './business-rule';
import { MetaFormData } from './metaform-data';

describe('BusinessRuleService', () => {
    let service: BusinessRuleService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule],
            providers: [BusinessRuleService]
        });
        service = TestBed.inject(BusinessRuleService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should allow creation of a simple rule', () => {
        service
            .addRule('IsInUnitedKingdom', RuleMatchType.MatchAll)
            .addPart('countryCode', RuleComparison.Equals, 'UK');

        expect(service.rules.size === 1).toEqual(true, 'Rule was not created');
    });

    it('should not allow creation of a duplicate rules', () => {
        service
            .addRule('IsInUnitedKingdom', RuleMatchType.MatchAll)
            .addPart('countryCode', RuleComparison.Equals, 'UK');

        expect(service.rules.size === 1).toEqual(true, 'Rule was not created');

        service
            .addRule('IsInUnitedKingdom', RuleMatchType.MatchAll)
            .addPart('countryCode', RuleComparison.Equals, 'UK');

        expect(service.rules.size === 1).toEqual(true, 'Duplicate rule was allowed');
    });

    it('should evaluate an Equal comparison as true', () => {
        service
            .addRule('IsInUnitedKingdom', RuleMatchType.MatchAll)
            .addPart('countryCode', RuleComparison.Equals, 'UK');

        const data = new MetaFormData();
        data.setValue('countryCode', 'UK');

        expect(service.evaluateRule('IsInUnitedKingdom', data)).toEqual(true, 'Rule did not evaluate correctly');
    });

    it('should evaluate an Equal non comparison as false', () => {
        service
            .addRule('IsInUnitedKingdom', RuleMatchType.MatchAll)
            .addPart('countryCode', RuleComparison.Equals, 'UK');

        const data = new MetaFormData();
        data.setValue('countryCode', 'DE');

        expect(service.evaluateRule('IsInUnitedKingdom', data)).toEqual(false, 'Rule did not evaluate correctly');
    });

    it('should evaluate an NotEqual comparison as true', () => {
        service
            .addRule('IsNotInUnitedKingdom', RuleMatchType.MatchAll)
            .addPart('countryCode', RuleComparison.NotEquals, 'UK');

        const data = new MetaFormData();
        data.setValue('countryCode', 'DE');

        expect(service.evaluateRule('IsNotInUnitedKingdom', data)).toEqual(true, 'Rule did not evaluate correctly');
    });

    it('should evaluate an NotEqual non comparison as false', () => {
        service
            .addRule('IsNotInUnitedKingdom', RuleMatchType.MatchAll)
            .addPart('countryCode', RuleComparison.NotEquals, 'UK');

        const data = new MetaFormData();
        data.setValue('countryCode', 'UK');

        expect(service.evaluateRule('IsNotInUnitedKingdom', data)).toEqual(false, 'Rule did not evaluate correctly');
    });

    it('should evaluate a match any comparison as true', () => {
        service
            .addRule('IsInUnitedKingdomOrPoland', RuleMatchType.MatchAny)
            .addPart('countryCode', RuleComparison.Equals, 'UK')
            .addPart('countryCode', RuleComparison.Equals, 'PL');

        const data = new MetaFormData();
        data.setValue('countryCode', 'PL');

        expect(service.evaluateRule('IsInUnitedKingdomOrPoland', data)).toEqual(
            true,
            'Rule did not evaluate correctly'
        );
    });

    it('should evaluate a match all as true', () => {
        service
            .addRule('ReturnerFromUK', RuleMatchType.MatchAll)
            .addPart('countryCode', RuleComparison.Equals, 'UK')
            .addPart('isReturner', RuleComparison.Equals, 'true');

        const data = new MetaFormData();
        data.setValue('countryCode', 'UK');
        data.setValue('isReturner', 'true');

        expect(service.evaluateRule('ReturnerFromUK', data)).toEqual(true, 'Rule did not evaluate correctly');
    });

    class TestRulePart implements IRulePart {
        evaluate(data: MetaFormData): boolean {
            return (
                data.getValue('countryCode') === 'FR' ||
                data.getValue('countryCode') === 'BE' ||
                data.getValue('countryCode') === 'CH'
            );
        }
    }

    it('should evaluate an externally-supplied part with match all as true', () => {
        service
            .addRule('ComplexCheck', RuleMatchType.MatchAll)
            .addPartFrom(new TestRulePart())
            .addPart('isReturner', RuleComparison.Equals, 'true');

        const data = new MetaFormData();
        data.setValue('countryCode', 'CH');
        data.setValue('isReturner', 'true');

        expect(service.evaluateRule('ComplexCheck', data)).toEqual(true, 'Rule did not evaluate correctly');
    });
});
