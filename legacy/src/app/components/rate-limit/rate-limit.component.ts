import { Component, OnInit } from "@angular/core";
import { RateLimitService } from "../../service/rate-limit.service";

@Component({
    selector: "app-rate-limit",
    templateUrl: "./rate-limit.component.html"
})

export class RateLimitComponent {
    constructor(private rateLimitService: RateLimitService) {}

    public rateLimitExceeded() {
        return this.rateLimitService.rateLimitExceeded();
    }
}
