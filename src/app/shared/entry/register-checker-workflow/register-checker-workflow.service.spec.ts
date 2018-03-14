import { inject, TestBed } from '@angular/core/testing';

import { ContainerStubService, WorkflowsStubService, WorkflowStubService, RefreshStubService } from './../../../test/service-stubs';
import { ContainerService } from './../../container.service';
import { ErrorService } from './../../error.service';
import { RefreshService } from './../../refresh.service';
import { StateService } from './../../state.service';
import { WorkflowsService } from './../../swagger/api/workflows.service';
import { WorkflowService } from './../../workflow.service';
import { RegisterCheckerWorkflowService } from './register-checker-workflow.service';

describe('Service: RegisterCheckerWorkflow', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RegisterCheckerWorkflowService, StateService, ErrorService,
      {provide: WorkflowsService, useClass: WorkflowsStubService},
      {provide: ContainerService, useClass: ContainerStubService},
      {provide: WorkflowService, useClass: WorkflowStubService},
      {provide: RefreshService, useClass: RefreshStubService}
    ]
    });
  });

  it('should ...', inject([RegisterCheckerWorkflowService], (service: RegisterCheckerWorkflowService) => {
    expect(service).toBeTruthy();
  }));
});