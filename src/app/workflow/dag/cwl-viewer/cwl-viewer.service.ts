/*
 *    Copyright 2017 OICR
 *
 *    Licensed under the Apache License, Version 2.0 (the 'License');
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an 'AS IS' BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Dockstore } from '../../../shared/dockstore.model';
import { Observable } from 'rxjs/Observable';

interface WorkflowDetails {
  /**
   * A relative path link to the svg format visualisation image
   */
  visualisationSvg: string;
}

/**
 * A descriptor for some of the urls available from view.commonwl.org for a CWL visualization.
 */
export interface CwlViewerDescriptor {
  /**
   * The url of the SVG file
   */
  svgUrl: string;
  /**
   * The url of the web page on view.commonwl.org
   */
  webPageUrl: string;
}

/**
 * This service is responsible for generating visualizations, if they haven't already been generated, from
 * https://view.commonwl.org, and returning the urls of those visualizations.
 */
@Injectable()
export class CwlViewerService {

  constructor(private httpClient: HttpClient) {
  }

  /**
   *
   * Returns visualization urls for a workflow.
   *
   * 1. POSTs to https://view.commonwl.org/workflows?url=<cwl on GitHub>
   *    1. If visualization has already been generated, or generation is quick, response is 200 with details in response body.
   *    Actually, the POST returns a 303, but Angular HttpClient follows the redirect so from the client perspective
   *    it's as if it returned a 200.
   *    2. If image generation needs to be queued up, response is 202 with link to job in Location header
   *      1. Follow location header and poll job queue
   *      2. When job is finished, polling job queue redirects and returns a response with details in body
   *
   * @param {string} providerUrl, e.g., `https://github.com/dockstore-testing/Metaphlan-ISBCGC`
   * @param {string} reference, a branch name, e.g., `master`
   * @param {string} workflow_path, path to CWL, e.g., `/metaphlan_wfl.cwl`
   * @returns {Observable<CwlViewerDescriptor>}
   */
  getVisualizationUrls(providerUrl: string, reference: string, workflow_path: string): Observable<CwlViewerDescriptor> {

    const url = this.cwlViewerEndpoint(providerUrl, reference, workflow_path);

    return this.httpClient.post(url, null, {observe: 'response'})
      .switchMap((res: HttpResponse<WorkflowDetails>) => {
        if (res.status === 200) {
          return Observable.of(<CwlViewerDescriptor>{
            svgUrl: Dockstore.CWL_VISUALIZER_URI + res.body.visualisationSvg,
            webPageUrl: res.url});
        } else if (res.status === 202) {
          const locationHeader = res.headers.get('Location');
          if (locationHeader) {
            const queueUrl = locationHeader.startsWith('/') ? Dockstore.CWL_VISUALIZER_URI + locationHeader : locationHeader;
            return this.pollJobQueue(queueUrl);
          }
        }
        throw new Error(`Error posting ${workflow_path}`);
      });
  }

  /**
   * Returns the CommonWL endpoint to request a visualization.
   *
   * @param {string} providerUrl
   * @param {string} reference
   * @param {string} workflow_path
   * @returns {string}
   */
  cwlViewerEndpoint(providerUrl: string, reference: string, workflow_path: string): string {
    return Dockstore.CWL_VISUALIZER_URI + '/workflows?url='
      + encodeURIComponent(providerUrl + '/blob/' + reference
        + workflow_path);
  }

  private pollJobQueue(queueUrl: string): Observable<CwlViewerDescriptor> {
    const pollFrequencyMs = 250;
    const maxPolls = 30000 / pollFrequencyMs; // Poll for a maximum of 30 seconds
    return Observable.interval(pollFrequencyMs)
      .switchMap(() => this.httpClient.get(queueUrl, {observe: 'response'}))
      .take(maxPolls)
      // When the job is complete, polling the job sends a 302 which Angular Http client follows, giving the job output
      .filter((p: HttpResponse<any>) => p.body && p.body.visualisationSvg)
      .take(1)
      .map((resp: HttpResponse<WorkflowDetails>) => (<CwlViewerDescriptor>{
        svgUrl: Dockstore.CWL_VISUALIZER_URI + resp.body.visualisationSvg,
        webPageUrl: resp.url
      }));
  }
}
