import { BusinessRule, RuleMatchType } from './business-rule';

describe('BusinessRule', () => {
    it('should create an instance', () => {
        expect(new BusinessRule('name', RuleMatchType.MatchAll, [])).toBeTruthy();
    });
});
