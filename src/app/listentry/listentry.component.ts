/*
 *    Copyright 2017 OICR
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

import { SearchService } from './../search/search.service';
import { AfterViewInit, Component, Input, OnInit, ViewChild,  Output, EventEmitter} from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/takeUntil';
import { SearchComponent } from '../search/search.component';
import { DataTableDirective } from 'angular-datatables';
import { ListContainersService } from '../containers/list/list.service';
import { PagenumberService } from '../shared/pagenumber.service';
import { OnDestroy } from '@angular/core';
import { DockstoreService } from '../shared/dockstore.service';

@Component({
  selector: 'app-listentry',
  templateUrl: './listentry.component.html',
  styleUrls: ['./listentry.component.css']
})
export class ListentryComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() entryType: string;
  @Output() userUpdated = new EventEmitter();
  hits: any;
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  inited = false;
  dtOptions: any;
  updateResultsTable = false;
  private ngUnsubscribe: Subject<{}> = new Subject();
  constructor(private searchService: SearchService,
    private listContainersService: ListContainersService,
    private dockstoreService: DockstoreService) { }

  ngOnInit() {
    this.updateResultsTable = false;
    this.dtOptions = { searching: false };
    if (this.entryType === 'tool') {
      this.searchService.toolhit$.takeUntil(this.ngUnsubscribe).subscribe(
        hits => {
          this.setHitSubscribe(hits);
        });
    } else if (this.entryType === 'workflow') {
      this.searchService.workflowhit$.takeUntil(this.ngUnsubscribe).subscribe(
        hits => {
          this.setHitSubscribe(hits);
        });
    }
  }

  ngAfterViewInit() {
    // Only update the result tables when datatable has loaded
    this.updateResultsTable = true;
  }

  setHitSubscribe(hits: any) {
    if (this.updateResultsTable) {
      if (this.inited) {
        this.rerender(hits);
      } else {
        if (hits) {
          this.hits = hits;
          this.dtTrigger.next();
          this.inited = true;
        }
      }
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getFilteredDockerPullCmd(path: string, tagName: string = ''): string {
    return this.listContainersService.getDockerPullCmd(path, tagName);
  }

  sendToolInfo(tool) {
    this.userUpdated.emit();
  }

  rerender(hits: any): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      this.hits = hits;
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
    }).catch(error => console.log(error));
  }

  getVerifiedTool(tool) {
    return this.dockstoreService.getVersionVerified(tool.tags);
  }

  getVerifiedWorkflow(workflow) {
    return this.dockstoreService.getVersionVerified(workflow.workflowVersions);
  }
}
