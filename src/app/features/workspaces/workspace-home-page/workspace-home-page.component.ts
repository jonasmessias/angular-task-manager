import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { WorkspaceService } from '@core/services/workspace.service';
import { PageContainerComponent } from '@shared/ui/page-container/page-container.component';

@Component({
  selector: 'app-workspace-home-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageContainerComponent],
  template: `
    <app-page-container>
      @if (workspace()) {
        <h1 class="text-2xl font-semibold text-foreground">{{ workspace()!.name }}</h1>
      } @else {
        <h1 class="text-2xl font-semibold text-foreground">Workspace</h1>
      }
    </app-page-container>
  `,
})
export class WorkspaceHomePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly workspaceService = inject(WorkspaceService);

  readonly workspace = computed(() => {
    const slug = this.route.snapshot.paramMap.get('workspaceSlug') ?? '';
    return this.workspaceService.workspaces().find((w) => slug.endsWith(w.id)) ?? null;
  });

  ngOnInit(): void {
    if (!this.workspaceService.hasWorkspaces()) {
      this.workspaceService.loadAll().subscribe();
    }
  }
}
