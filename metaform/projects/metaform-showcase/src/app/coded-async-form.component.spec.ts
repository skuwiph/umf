import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodedAsyncFormComponent } from './coded-async-form.component';

describe('CodedAsyncFormComponent', () => {
    let component: CodedAsyncFormComponent;
    let fixture: ComponentFixture<CodedAsyncFormComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CodedAsyncFormComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CodedAsyncFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
