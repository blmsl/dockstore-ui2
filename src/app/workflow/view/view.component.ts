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

import { WorkflowsService } from './../../shared/swagger/api/workflows.service';
import { StateService } from './../../shared/state.service';
import { VersionModalService } from './../version-modal/version-modal.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AfterViewChecked, AfterViewInit, Component, Input, ViewChild, OnInit } from '@angular/core';

import { View } from '../../shared/view';
import { DateService } from '../../shared/date.service';
import { WorkflowService } from '../../shared/workflow.service';

@Component({
  selector: 'app-view-workflow',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewWorkflowComponent extends View implements OnInit, AfterViewInit {
  @Input() workflowId: number;
  items: any[];
  isPublic: boolean;
  constructor(
              private workflowService: WorkflowService,
              private versionModalService: VersionModalService,
              private stateService: StateService,
              private workflowsService: WorkflowsService,
              dateService: DateService) {
    super(dateService);
  }

  showVersionModal() {
    this.versionModalService.setVersion(this.version);
    this.workflowsService.getTestParameterFiles(this.workflowId, this.version.name)
        .subscribe(items => {
            this.items = items;
            this.versionModalService.setTestParameterFiles(this.items);
          });
    this.versionModalService.setIsModalShown(true);
  }

  initItems() {
    if (this.version) {
      this.workflowsService.getTestParameterFiles(this.workflowId, this.version.name)
        .subscribe(items => {
            this.items = items;
          });
    }
  }

  ngAfterViewInit() {
    this.initItems();
  }

  ngOnInit() {
    this.stateService.publicPage$.subscribe(isPublic => this.isPublic = isPublic);
  }
}
