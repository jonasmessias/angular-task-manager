import { OverlayModule } from '@angular/cdk/overlay';
import {
  BasePortalOutlet,
  CdkPortalOutlet,
  ComponentPortal,
  PortalModule,
  TemplatePortal,
} from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  computed,
  ElementRef,
  EmbeddedViewRef,
  EventEmitter,
  inject,
  NgModule,
  output,
  signal,
  TemplateRef,
  Type,
  viewChild,
  ViewContainerRef,
} from '@angular/core';

import { ZardIcon } from '@shared/components/icon/icons';
import { mergeClasses } from '@shared/utils/merge-classes';
import { ZardButtonComponent } from '../button/button.component';
import { ZardIconComponent } from '../icon/icon.component';
import { ZardDialogRef } from './dialog-ref';
import { ZardDialogService } from './dialog.service';
import { dialogVariants } from './dialog.variants';

const noopFun = () => void 0;
export type OnClickCallback<T> = (instance: T) => false | void | object;
export class ZardDialogOptions<T, U> {
  zCancelIcon?: ZardIcon;
  zCancelText?: string | null;
  zClosable?: boolean;
  zContent?: string | TemplateRef<T> | Type<T>;
  zCustomClasses?: string;
  zData?: U;
  zDescription?: string;
  zHideFooter?: boolean;
  zMaskClosable?: boolean;
  zOkDestructive?: boolean;
  zOkDisabled?: boolean;
  zOkIcon?: ZardIcon;
  zOkText?: string | null;
  zOnCancel?: EventEmitter<T> | OnClickCallback<T> = noopFun;
  zOnOk?: EventEmitter<T> | OnClickCallback<T> = noopFun;
  zTitle?: string | TemplateRef<T>;
  zViewContainerRef?: ViewContainerRef;
  zWidth?: string;
}

@Component({
  selector: 'z-dialog',
  exportAs: 'zDialog',
  imports: [OverlayModule, PortalModule, ZardButtonComponent, ZardIconComponent],
  template: `
    <!-- Header bar: close | title | (delete slot) -->
    <header class="flex h-14 shrink-0 items-center justify-between border-b px-2">
      <!-- Left: close button -->
      @if (config.zClosable || config.zClosable === undefined) {
        <button
          data-testid="z-close-header-button"
          z-button
          zType="ghost"
          zSize="sm"
          aria-label="Close"
          (click)="onCloseClick()"
        >
          <z-icon zType="x" />
        </button>
      } @else {
        <span class="w-9"></span>
      }

      <!-- Center: title -->
      <div class="flex flex-col items-center gap-0.5 text-center">
        @if (config.zTitle) {
          <h4 data-testid="z-title" class="text-base font-semibold leading-none tracking-tight">
            {{ config.zTitle }}
          </h4>
        }
        @if (config.zDescription) {
          <p data-testid="z-description" class="text-xs text-muted-foreground">
            {{ config.zDescription }}
          </p>
        }
      </div>

      <!-- Right: spacer to keep title centred -->
      <span class="w-9"></span>
    </header>

    <!-- Scrollable content area -->
    <main class="flex flex-col gap-4 overflow-y-auto p-6">
      <ng-template cdkPortalOutlet></ng-template>

      @if (isStringContent) {
        <div data-testid="z-content" [innerHTML]="config.zContent"></div>
      }
    </main>

    @if (!config.zHideFooter) {
      <footer
        class="flex shrink-0 flex-col-reverse gap-2 border-t p-4 sm:flex-row sm:justify-end sm:gap-0 sm:space-x-2"
      >
        @if (config.zCancelText !== null) {
          <button data-testid="z-cancel-button" z-button zType="outline" (click)="onCloseClick()">
            @if (config.zCancelIcon) {
              <z-icon [zType]="config.zCancelIcon" />
            }
            {{ config.zCancelText || 'Cancel' }}
          </button>
        }

        @if (config.zOkText !== null) {
          <button
            data-testid="z-ok-button"
            z-button
            [zType]="config.zOkDestructive ? 'destructive' : 'default'"
            [disabled]="config.zOkDisabled"
            (click)="onOkClick()"
          >
            @if (config.zOkIcon) {
              <z-icon [zType]="config.zOkIcon" />
            }
            {{ config.zOkText || 'OK' }}
          </button>
        }
      </footer>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[style.width]': 'config.zWidth ? config.zWidth : null',
    '[attr.data-state]': 'state()',
  },
})
export class ZardDialogComponent<T, U> extends BasePortalOutlet {
  private readonly host = inject(ElementRef<HTMLElement>);
  protected readonly config = inject(ZardDialogOptions<T, U>);

  protected readonly classes = computed(() =>
    mergeClasses(dialogVariants(), this.config.zCustomClasses),
  );
  public dialogRef?: ZardDialogRef<T>;

  protected readonly isStringContent = typeof this.config.zContent === 'string';

  readonly portalOutlet = viewChild.required(CdkPortalOutlet);

  okTriggered = output<void>();
  cancelTriggered = output<void>();
  state = signal<'close' | 'open'>('close');

  constructor() {
    super();
  }

  getNativeElement(): HTMLElement {
    return this.host.nativeElement;
  }

  attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
    if (this.portalOutlet()?.hasAttached()) {
      throw Error('Attempting to attach modal content after content is already attached');
    }
    return this.portalOutlet()?.attachComponentPortal(portal);
  }

  attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C> {
    if (this.portalOutlet()?.hasAttached()) {
      throw Error('Attempting to attach modal content after content is already attached');
    }

    return this.portalOutlet()?.attachTemplatePortal(portal);
  }

  onOkClick() {
    this.okTriggered.emit();
  }

  onCloseClick() {
    this.cancelTriggered.emit();
  }
}

@NgModule({
  imports: [ZardButtonComponent, ZardDialogComponent, OverlayModule, PortalModule],
  providers: [ZardDialogService],
})
export class ZardDialogModule {}
