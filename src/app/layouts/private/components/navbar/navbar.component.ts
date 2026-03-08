import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  signal,
  TemplateRef,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { ConnectedPosition, Overlay, OverlayModule, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

import { AuthService } from '../../../../core/services/auth.service';
import { CreateBoardPopoverComponent } from '../../../../features/boards/components/create-board-popover/create-board-popover.component';
import { ZardIconComponent } from '../../../../shared/components/icon/icon.component';
import { AvatarMenuComponent } from './avatar-menu/avatar-menu.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    OverlayModule,
    ZardIconComponent,
    AvatarMenuComponent,
    CreateBoardPopoverComponent,
  ],
  template: `
    <header class="flex items-center h-12 px-2 gap-3 bg-background shrink-0">
      <a routerLink="/" class="flex items-center gap-2 mr-2 shrink-0">
        <z-icon zType="layers-2" class="text-primary size-5" />
        <span class="font-bold text-sm text-foreground">Task Manager</span>
      </a>
      <div class="flex-1 flex items-center justify-center gap-4 mx-auto">
        <div class="flex-1 max-w-xl relative">
          <z-icon
            zType="search"
            class="absolute left-1.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search..."
            class="w-full h-8 pl-8 pr-3 text-sm bg-muted/60 border border-border rounded-md
                   text-foreground placeholder:text-muted-foreground
                   focus:outline-none focus:ring-1 focus:ring-ring focus:bg-background
                   transition-colors"
          />
        </div>
        <button
          #createBtn
          (click)="toggleCreate()"
          class="flex items-center gap-1.5 h-8 px-3 rounded-md text-sm font-medium cursor-pointer
                 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <z-icon zType="plus" class="size-3.5" />
          Create
        </button>
      </div>
      <div class="flex items-center gap-1 ml-2 shrink-0">
        <button
          class="flex items-center justify-center size-8 rounded-full cursor-pointer
                 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          title="Notifications"
        >
          <z-icon zType="bell" class="size-4" />
        </button>
        <button
          class="flex items-center justify-center size-8 rounded-full cursor-pointer
                 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          title="Help"
        >
          <z-icon zType="circle-help" class="size-4" />
        </button>
        <app-avatar-menu
          [userName]="userName()"
          [userEmail]="userEmail()"
          [userInitial]="userInitial()"
          (logoutEvent)="logout()"
        />
      </div>
    </header>

    <ng-template #createTpl>
      <div class="rounded-lg border border-border bg-popover shadow-xl overflow-hidden">
        <app-create-board-popover (closed)="closeCreate()" />
      </div>
    </ng-template>
  `,
})
export class NavbarComponent implements OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);

  readonly createBtn = viewChild.required<ElementRef<HTMLButtonElement>>('createBtn');
  readonly createTpl = viewChild.required<TemplateRef<void>>('createTpl');

  readonly userName = computed(() => this.authService.currentUser()?.name ?? 'Usuario');
  readonly userEmail = computed(() => this.authService.currentUser()?.email ?? '');
  readonly userInitial = computed(() =>
    (this.authService.currentUser()?.name?.[0] ?? 'U').toUpperCase(),
  );

  private overlayRef?: OverlayRef;
  readonly isOpen = signal(false);

  toggleCreate(): void {
    this.isOpen() ? this.closeCreate() : this.openCreate();
  }

  openCreate(): void {
    if (this.overlayRef) return;

    const positions: ConnectedPosition[] = [
      { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 6 },
      { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 6 },
    ];

    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.createBtn().nativeElement)
        .withPositions(positions)
        .withPush(false),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });

    this.overlayRef.backdropClick().subscribe(() => this.closeCreate());
    this.overlayRef.attach(new TemplatePortal(this.createTpl(), this.vcr));
    this.isOpen.set(true);
  }

  closeCreate(): void {
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
    this.isOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeCreate();
  }

  ngOnDestroy(): void {
    this.overlayRef?.dispose();
  }

  logout(): void {
    this.authService.logout();
  }
}
