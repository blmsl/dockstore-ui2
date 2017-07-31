import { RegisterWorkflowModalService } from './../workflow/register-workflow-modal/register-workflow-modal.service';
import { RefreshService } from './../shared/refresh.service';
import {Component, OnInit} from '@angular/core';

import {DockstoreService} from '../shared/dockstore.service';
import {ProviderService} from '../shared/provider.service';
import {WorkflowService} from '../shared/workflow.service';

import {MyWorkflowsService} from './myworkflows.service';
import {UserService} from '../loginComponents/user.service';



@Component({
  selector: 'app-myworkflows',
  templateUrl: './myworkflows.component.html',
  styleUrls: ['./myworkflows.component.css'],
  providers: [MyWorkflowsService, ProviderService,
              DockstoreService]
})
export class MyWorkflowsComponent implements OnInit {
  orgWorkflows = [];
  oneAtATime = true;
  selWorkflowObj: any;
  user: any;
  workflows: any;
  constructor(private myworkflowService: MyWorkflowsService,
              private userService: UserService,
              private workflowService: WorkflowService,
              private refreshService: RefreshService,
              private registerWorkflowModalService: RegisterWorkflowModalService) {

  }
  ngOnInit() {
    this.workflowService.setWorkflow(null);
    this.userService.getUser().subscribe(user => {
      this.user = user;
      this.userService.getUserWorkflowList(user.id).subscribe(workflows => {
        this.workflowService.setWorkflows(workflows);
      });
    });
    this.workflowService.workflows$.subscribe(workflows => {
      this.workflows = workflows;
      if (this.user) {
        const sortedWorkflows = this.myworkflowService.sortORGWorkflows(workflows, this.user.username);
        this.workflowService.setNsWorkflows(sortedWorkflows);
      }
    });
    this.workflowService.nsWorkflows$.subscribe(nsWorkflows => {
      this.orgWorkflows = nsWorkflows;
      if (this.orgWorkflows && this.orgWorkflows.length > 0) {
        const theFirstWorkflow = this.orgWorkflows[0].workflows[0];
        this.selectWorkflow(theFirstWorkflow);
      }
    });
  }
  selectWorkflow(workflow) {
    this.selWorkflowObj = workflow;
    this.workflowService.setWorkflow(workflow);
  }

  setModalGitURL(gitURL: string) {
    this.registerWorkflowModalService.setWorkflowRepository(gitURL);
  }

  showModal() {
    this.registerWorkflowModalService.setIsModalShown(true);
  }

  refreshAllWorkflows(): any {
    this.refreshService.refreshAllWorkflows(this.user.id);
  }
}
