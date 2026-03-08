import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/**
 * Standardised page content wrapper.
 *
 * Usage:
 *   <app-page-container>
 *     <!-- page content -->
 *   </app-page-container>
 *
 * Produces a block constrained to max-w-[914px] with the standard top margin,
 * centred horizontally.  The parent `<main>` in PrivateLayoutComponent already
 * supplies all the horizontal / vertical padding and flex sizing.
 */
@Component({
  selector: 'app-page-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="w-full max-w-228.5 mx-auto mt-5">
      <ng-content />
    </div>
  `,
})
export class PageContainerComponent {}
