import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestFormComponent } from './test-form.component';

describe('TestFormComponent', () => {
    let component: TestFormComponent;
    let fixture: ComponentFixture<TestFormComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TestFormComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TestFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it(`should have as title 'UnifiedMetaForm'`, () => {
        fixture = TestBed.createComponent(TestFormComponent);
        const app = fixture.componentInstance;
        expect(app.title).toEqual('UnifiedMetaForm');
    });

});
