import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SimpleFormComponent } from './simple-form.component';
import { SimpleCodedFormComponent } from './simple-coded-form.component';
import { CodedAsyncFormComponent } from './coded-async-form.component';

const routes: Routes = [
    { path: 'simple', component: SimpleFormComponent },
    { path: 'coded', component: SimpleCodedFormComponent },
    { path: 'async', component: CodedAsyncFormComponent }
];

@NgModule({
    declarations: [],
    imports: [RouterModule.forRoot(routes), CommonModule],
    exports: [RouterModule]
})
export class AppRoutingModule {}
