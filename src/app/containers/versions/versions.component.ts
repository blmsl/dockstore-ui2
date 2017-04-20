import { Component, Input, OnInit } from '@angular/core';

import { DockstoreService } from '../../shared/dockstore.service';

@Component({
  selector: 'app-versions-container',
  templateUrl: './versions.component.html',
  styleUrls: ['./versions.component.css']
})
export class VersionsContainerComponent implements OnInit {
  @Input() tags: any;
  dtOptions = {
    bFilter: false,
    bPaginate: false,
    columnDefs: [
      {
        orderable: false,
        targets: [5, 6]
      }
    ]
  };

  constructor(private dockstoreService: DockstoreService) { }

  getDate(timestamp) {
    return this.dockstoreService.getDate(timestamp);
  }

  ngOnInit() { }

}