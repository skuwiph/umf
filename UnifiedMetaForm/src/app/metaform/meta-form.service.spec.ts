import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { MetaFormService } from './meta-form.service';

describe('MetaFormService', () => {
    let service: MetaFormService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule],
            providers: [MetaFormService]
        });
        service = TestBed.inject(MetaFormService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

});
