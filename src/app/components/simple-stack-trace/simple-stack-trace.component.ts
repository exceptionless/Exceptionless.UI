import { Component, OnInit, OnChanges, Input, SimpleChanges } from '@angular/core';
import { SimpleErrorService } from '../../service/simple-error.service';

@Component({
    selector: 'app-simple-stack-trace',
    templateUrl: './simple-stack-trace.component.html',
    styleUrls: ['./simple-stack-trace.component.less']
})

export class SimpleStackTraceComponent implements OnInit, OnChanges {
    @Input() exception;
    @Input() textStackTrace;
    stackTrace: any;
    constructor(
        private simpleErrorService: SimpleErrorService
    ) {}

    ngOnInit() {}

    ngOnChanges(changes: SimpleChanges) {
        const errors = this.simpleErrorService.getExceptions(this.exception);
        this.stackTrace = this.buildStackTrace(errors, true);
        this.textStackTrace = this.buildStackTrace(errors, true);
    }

    buildStackFrames(exceptions, includeHTML) {
        let frames = '';
        for (let index = 0; index < exceptions.length; index++) {
            const stackTrace = exceptions[index].stack_trace;
            if (!!stackTrace) {
                if (includeHTML) {
                    frames += '<div class="stack-frame">' + this.escapeHTML(stackTrace.replace(' ', ''));

                    if (index < (exceptions.length - 1)) {
                        frames += '<div>--- End of inner exception stack trace ---</div>';
                    }

                    frames += '</div>';
                } else {
                    frames += stackTrace.replace(' ', '');

                    if (index < (exceptions.length - 1)) {
                        frames += '--- End of inner exception stack trace ---';
                    }
                }
            }
        }

        return frames;
    }

    escapeHTML(input) {
        if (!input || !input.replace) {
            return input;
        }

        return input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    buildStackTraceHeader(exceptions, includeHTML) {
        let header = '';
        for (let index = 0; index < exceptions.length; index++) {
            if (includeHTML) {
                header += '<span class="ex-header">';
            }

            if (index > 0) {
                header += ' ---> ';
            }

            const hasType = !!exceptions[index].type;
            if (hasType) {
                if (includeHTML) {
                    header += '<span class="ex-type">' + this.escapeHTML(exceptions[index].type) + '</span>: ';
                } else {
                    header += exceptions[index].type + ': ';
                }
            }

            if (exceptions[index].message) {
                if (includeHTML) {
                    header += '<span class="ex-message">' + this.escapeHTML(exceptions[index].message) + '</span>';
                } else {
                    header += exceptions[index].message;
                }
            }

            if (hasType) {
                if (includeHTML) {
                    header += '</span>';
                } else {
                    header += '\r\n';
                }
            }
        }

        return header;
    }

    buildStackTrace(exceptions, includeHTML) {
        return this.buildStackTraceHeader(exceptions, includeHTML) + this.buildStackFrames(exceptions.reverse(), includeHTML);
    }
}
