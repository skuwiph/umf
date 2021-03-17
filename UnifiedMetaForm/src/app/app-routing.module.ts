import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TestFormComponent } from './test-form.component';
import { FormBuilderComponent } from './form-builder.component';

const routes: Routes = [
    { path: '', component: FormBuilderComponent },
    { path: 'test', component: TestFormComponent }
];

@NgModule({
    declarations: [],
    imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
    exports: [RouterModule]
})
export class AppRoutingModule { }
