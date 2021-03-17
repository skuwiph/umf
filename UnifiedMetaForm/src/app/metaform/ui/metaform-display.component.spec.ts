import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { MetaFormDisplayComponent } from './metaform-display.component';
import { MetaForm } from '../meta-form';
import { MetaFormDrawType } from '../meta-form-enums';

describe('MetaformDisplayComponent', () => {
    let component: MetaFormDisplayComponent;
    let fixture: ComponentFixture<MetaFormDisplayComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule],
            declarations: [MetaFormDisplayComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MetaFormDisplayComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.form = MetaForm.create('test', MetaFormDrawType.EntireForm);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
