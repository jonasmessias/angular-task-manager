import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';

import { WorkspaceService } from '@core/services/workspace.service';
import { ZardDialogService } from '@shared/components/dialog/dialog.service';
import { CreateWorkspaceDialogComponent } from '../workspaces/components/create-workspace-dialog/create-workspace-dialog.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: ``,
})
export class DashboardComponent implements OnInit {
  private readonly workspaceService = inject(WorkspaceService);
  private readonly dialogService = inject(ZardDialogService);

  ngOnInit(): void {
    this.workspaceService.loadAll().subscribe({
      next: () => {
        if (!this.workspaceService.hasWorkspaces()) {
          this.dialogService.create({
            zTitle: '🎉 Create your first workspace',
            zDescription: 'Give your workspace a name. You can always change it later.',
            zContent: CreateWorkspaceDialogComponent,
            zData: { isFirstWorkspace: true },
            zWidth: '440px',
            zHideFooter: true,
            zClosable: false,
            zMaskClosable: false,
          });
        }
      },
    });
  }
}
