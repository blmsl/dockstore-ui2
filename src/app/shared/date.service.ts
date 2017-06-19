import {Injectable} from '@angular/core';

@Injectable()
export class DateService {

  private static readonly months = ['Jan.', 'Feb.', 'Mar.', 'Apr.',
                                    'May', 'Jun.', 'Jul.', 'Aug.',
                                    'Sept.', 'Oct.', 'Nov.', 'Dec.'];

  // get a message containing both the day and time of day
  getDateTimeMessage(timestamp: number, dateOnly = false): string {
    let dateString = 'n/a';
    if (timestamp) {
      const date = new Date(timestamp);
      dateString = DateService.months[date.getMonth()] + ' ' + date.getDate() + ' ' + date.getFullYear();
      if (!dateOnly) {
        dateString += ' at ' + date.toLocaleTimeString();
      }
    }

    return dateString;
  }

  private getTime(timestamp: number, convert: number) {
    const timeDiff = (new Date()).getTime() - timestamp;
    return Math.floor(timeDiff / convert);
  }

  /*Note: change this link if necessary */
  getVerifiedLink() {
    return '/docs/faq#what-is-a-verified-tool-or-workflow-';
  }

  getAgoMessage(timestamp: number) {
    if (timestamp) {
      const msToMins = 1000 * 60;
      const msToHours = msToMins * 60;
      const msToDays = msToHours * 24;

      let time = this.getTime(timestamp, msToDays);

      if (time < 1) {

        time = this.getTime(timestamp, msToHours);

        if (time < 1) {

          time = this.getTime(timestamp, msToMins);

          if (time < 1) {
            return '< 1 minute ago';
          } else {
            return time + ((time === 1) ? ' minute ago' : ' minutes ago' );
          }

        } else {

          return time + ((time === 1) ? ' hour ago' : ' hours ago');

        }

      } else {

        return time + ((time === 1) ? ' day ago' : ' days ago');

      }
    } else {
      return 'n/a';
    }

  }
}