import { Component, OnInit, OnDestroy } from "@angular/core";
import { FilterService } from "../../../service/filter.service";
import { FilterStoreService } from "../../../service/filter-store.service";
import { Intercom } from "ng-intercom";

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html"
})

export class SidebarComponent implements OnInit, OnDestroy {
  public type: string = "type/";
  public types = {
    exceptions: "error",
    log: "log",
    broken: "404",
    feature: "usage",
    events: "events"
  };

  public filterUrlPattern: string;

  constructor(
    private filterStoreService: FilterStoreService,
    private filterService: FilterService,
    private intercom: Intercom
  ) { }

  public ngOnInit() {
    this.filterStoreService.getProjectFilterEmitter().subscribe(item => {
      this.setFilterUrlPattern();
    });

    this.setFilterUrlPattern();
    if (this.isIntercomEnabled()) {
      this.intercom.boot({
        app_id: environment.INTERCOM_APPID
      });
    }
  }

  public ngOnDestroy() {
    this.filterStoreService.getProjectFilterEmitter().unsubscribe();
  }

  public setFilterUrlPattern() {
    if (this.filterService.getProjectType() === "All Projects") {
      this.type = "type/";
      this.filterUrlPattern = "";
    } else {
      this.type = "";
      const projectId = this.filterService.getProjectTypeId();
      const projectType = this.filterService.getProjectType();
      this.filterUrlPattern = `${projectType}/${projectId}/`;
    }
  }

  public isIntercomEnabled() {
    return !!environment.INTERCOM_APPID;
  }

  public showIntercom() {
    this.intercom.showNewMessage();
  }
}
