import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MetaformComponent } from './metaform.component';

describe('MetaformComponent', () => {
    let component: MetaformComponent;
    let fixture: ComponentFixture<MetaformComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [MetaformComponent]
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(MetaformComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
