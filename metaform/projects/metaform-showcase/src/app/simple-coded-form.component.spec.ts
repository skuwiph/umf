import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleCodedFormComponent } from './simple-coded-form.component';

describe('SimpleCodedFormComponent', () => {
    let component: SimpleCodedFormComponent;
    let fixture: ComponentFixture<SimpleCodedFormComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SimpleCodedFormComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SimpleCodedFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
