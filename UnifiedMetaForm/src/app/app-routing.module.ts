import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TestFormComponent } from './test-form.component';

const routes: Routes = [
    { path: '', component: TestFormComponent }
];

@NgModule({
    declarations: [],
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
