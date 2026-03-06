import { ConnectedPosition, Overlay, OverlayModule, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  OnDestroy,
  output,
  signal,
  TemplateRef,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { ThemeService } from '../../../../../core/services/theme.service';
import { ZardIconComponent } from '../../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-avatar-menu',
  standalone: true,
  imports: [OverlayModule, ZardIconComponent],
  template: `
    <!-- Avatar trigger button -->
    <button
      #triggerRef
      (click)="toggle()"
      class="flex items-center justify-center size-8 rounded-full cursor-pointer
             bg-primary text-primary-foreground text-sm font-bold
             hover:ring-2 hover:ring-primary/50 transition-all"
      [title]="userName()"
    >
      {{ userInitial() }}
    </button>

    <!-- Main menu panel — rendered via CDK Overlay -->
    <ng-template #menuTemplate>
      <div
        class="w-60 rounded-md border border-border bg-popover shadow-lg overflow-hidden"
        role="menu"
      >
        <!-- Account header -->
        <div class="px-3 py-2.5 border-b border-border">
          <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            Account
          </p>
          <div class="flex items-center gap-2.5">
            <div
              class="size-8 rounded-full bg-primary flex items-center justify-center
                     text-primary-foreground text-sm font-bold shrink-0"
            >
              {{ userInitial() }}
            </div>
            <div class="flex flex-col min-w-0">
              <span class="text-sm font-medium text-foreground truncate">{{ userName() }}</span>
              <span class="text-xs text-muted-foreground truncate">{{ userEmail() }}</span>
            </div>
          </div>
        </div>

        <!-- Menu items -->
        <div class="py-1">
          <!-- Theme row — click opens submenu to the left -->
          <button
            #themeBtnRef
            (click)="toggleThemeSubmenu()"
            class="flex items-center gap-2 w-full px-3 py-1.5 text-sm rounded-sm cursor-pointer
                   text-foreground hover:bg-accent transition-colors"
            [class.bg-accent]="themeSubmenuOpen()"
            role="menuitem"
          >
            <z-icon zType="palette" class="size-4 text-muted-foreground" />
            <span class="flex-1 text-left">Theme</span>
            <z-icon
              zType="chevron-down"
              class="size-3.5 text-muted-foreground transition-transform duration-75"
              [style.transform]="themeSubmenuOpen() ? 'rotate(90deg)' : 'rotate(0deg)'"
            />
          </button>

          <button
            class="flex items-center gap-2 w-full px-3 py-1.5 text-sm rounded-sm cursor-pointer
                   text-foreground hover:bg-accent transition-colors"
            role="menuitem"
          >
            <z-icon zType="user" class="size-4 text-muted-foreground" />
            Profile
          </button>

          <button
            class="flex items-center gap-2 w-full px-3 py-1.5 text-sm rounded-sm cursor-pointer
                   text-foreground hover:bg-accent transition-colors"
            role="menuitem"
          >
            <z-icon zType="settings" class="size-4 text-muted-foreground" />
            Settings
          </button>
        </div>

        <!-- Logout -->
        <div class="border-t border-border py-1">
          <button
            (click)="logout()"
            class="flex items-center gap-2 w-full px-3 py-1.5 text-sm rounded-sm cursor-pointer
                   text-destructive hover:bg-accent transition-colors"
            role="menuitem"
          >
            <z-icon zType="log-out" class="size-4" />
            Log out
          </button>
        </div>
      </div>
    </ng-template>

    <!-- Theme submenu panel — rendered via a second CDK Overlay -->
    <ng-template #themeTemplate>
      <div class="w-52 rounded-md border border-border bg-popover shadow-lg py-2" role="menu">
        <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-1">
          Theme
        </p>

        <!-- Light -->
        <button
          (click)="setLight()"
          class="flex items-center gap-3 w-full px-3 py-2 text-sm transition-colors hover:bg-accent cursor-pointer"
          [class]="!themeService.isDark() ? 'text-primary font-medium' : 'text-foreground'"
          role="menuitem"
        >
          <div
            class="size-4 rounded-full border-2 flex items-center justify-center shrink-0"
            [class]="!themeService.isDark() ? 'border-primary' : 'border-border'"
          >
            @if (!themeService.isDark()) {
              <div class="size-2 rounded-full bg-primary"></div>
            }
          </div>
          <div
            class="w-10 h-7 rounded bg-white border border-gray-200 flex flex-col gap-0.5 p-1 overflow-hidden shrink-0"
          >
            <div class="h-1 w-full rounded-sm bg-gray-200"></div>
            <div class="flex gap-0.5 flex-1">
              <div class="w-2 rounded-sm bg-gray-200"></div>
              <div class="flex-1 rounded-sm bg-gray-100"></div>
            </div>
          </div>
          Light
        </button>

        <!-- Dark -->
        <button
          (click)="setDark()"
          class="flex items-center gap-3 w-full px-3 py-2 text-sm transition-colors hover:bg-accent cursor-pointer"
          [class]="themeService.isDark() ? 'text-primary font-medium' : 'text-foreground'"
          role="menuitem"
        >
          <div
            class="size-4 rounded-full border-2 flex items-center justify-center shrink-0"
            [class]="themeService.isDark() ? 'border-primary' : 'border-border'"
          >
            @if (themeService.isDark()) {
              <div class="size-2 rounded-full bg-primary"></div>
            }
          </div>
          <div
            class="w-10 h-7 rounded bg-zinc-900 border border-zinc-700 flex flex-col gap-0.5 p-1 overflow-hidden shrink-0"
          >
            <div class="h-1 w-full rounded-sm bg-zinc-700"></div>
            <div class="flex gap-0.5 flex-1">
              <div class="w-2 rounded-sm bg-zinc-700"></div>
              <div class="flex-1 rounded-sm bg-zinc-800"></div>
            </div>
          </div>
          Dark
        </button>
      </div>
    </ng-template>
  `,
})
export class AvatarMenuComponent implements OnDestroy {
  // ── Inputs / Outputs ─────────────────────────────────────────────────────
  readonly userName = input.required<string>();
  readonly userEmail = input.required<string>();
  readonly userInitial = input.required<string>();
  readonly logoutEvent = output<void>();

  // ── Injections ──────────────────────────────────────────────────────────
  readonly themeService = inject(ThemeService);
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);

  // ── Template refs ────────────────────────────────────────────────────────
  private readonly triggerRef = viewChild.required<ElementRef>('triggerRef');
  private readonly themeBtnRef = viewChild<ElementRef>('themeBtnRef');
  private readonly menuTemplate = viewChild.required<TemplateRef<unknown>>('menuTemplate');
  private readonly themeTemplate = viewChild.required<TemplateRef<unknown>>('themeTemplate');

  // ── State ────────────────────────────────────────────────────────────────
  private menuOverlayRef?: OverlayRef;
  private themeOverlayRef?: OverlayRef;
  readonly themeSubmenuOpen = signal(false);

  // ── Positions ────────────────────────────────────────────────────────────
  private readonly menuPositions: ConnectedPosition[] = [
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 4 },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -4 },
  ];

  private readonly themePositions: ConnectedPosition[] = [
    { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top', offsetX: -4 },
    { originX: 'start', originY: 'bottom', overlayX: 'end', overlayY: 'bottom', offsetX: -4 },
  ];

  // ── Outside-click ────────────────────────────────────────────────────────
  @HostListener('document:pointerdown', ['$event'])
  onDocumentClick(event: PointerEvent): void {
    const target = event.target as Node;
    const insideMenu = this.menuOverlayRef?.overlayElement?.contains(target);
    const insideTheme = this.themeOverlayRef?.overlayElement?.contains(target);
    const insideTrigger = this.triggerRef().nativeElement.contains(target);
    if (!insideMenu && !insideTheme && !insideTrigger) {
      this.closeAll();
    }
  }

  // ── Public API ───────────────────────────────────────────────────────────
  toggle(): void {
    if (this.menuOverlayRef?.hasAttached()) {
      this.closeAll();
    } else {
      this.openMenu();
    }
  }

  toggleThemeSubmenu(): void {
    if (this.themeOverlayRef?.hasAttached()) {
      this.closeThemeSubmenu();
    } else {
      this.openThemeSubmenu();
    }
  }

  setLight(): void {
    if (this.themeService.isDark()) this.themeService.toggleTheme();
  }

  setDark(): void {
    if (!this.themeService.isDark()) this.themeService.toggleTheme();
  }

  logout(): void {
    this.closeAll();
    this.logoutEvent.emit();
  }

  ngOnDestroy(): void {
    this.closeAll();
  }

  // ── Private ──────────────────────────────────────────────────────────────
  private openMenu(): void {
    this.menuOverlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.triggerRef().nativeElement)
        .withPositions(this.menuPositions)
        .withPush(false),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: false,
    });

    this.menuOverlayRef.attach(new TemplatePortal(this.menuTemplate(), this.vcr));
  }

  private openThemeSubmenu(): void {
    const anchor = this.themeBtnRef()?.nativeElement ?? this.triggerRef().nativeElement;

    this.themeOverlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(anchor)
        .withPositions(this.themePositions)
        .withPush(false),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: false,
    });

    this.themeOverlayRef.attach(new TemplatePortal(this.themeTemplate(), this.vcr));
    this.themeSubmenuOpen.set(true);
  }

  private closeThemeSubmenu(): void {
    if (this.themeOverlayRef?.hasAttached()) this.themeOverlayRef.detach();
    this.themeOverlayRef?.dispose();
    this.themeOverlayRef = undefined;
    this.themeSubmenuOpen.set(false);
  }

  private closeAll(): void {
    this.closeThemeSubmenu();
    if (this.menuOverlayRef?.hasAttached()) this.menuOverlayRef.detach();
    this.menuOverlayRef?.dispose();
    this.menuOverlayRef = undefined;
  }
}
