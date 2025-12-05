# Discussion: Print Layout Centering Issue

## User Prompt (Current)
"same result still not equal margin. Does this 'Page 1 (A4 - Landscape)' creating bigger top margin? or this issue is different. if this text is creating issue then write this outside the page."

## Thinking Process
1.  **Re-Analyze**: User correctly identified that the watermark might be affecting layout, but the real issue was the outer container.

2.  **Root Cause Identified**:
    -   The outer `<div>` wrapper in `PrintPreview.tsx` had `py-8` (padding 32px top/bottom) and `gap-8` (32px gap between items).
    -   These classes were applied even during print, causing extra spacing at the top of the page.

3.  **Solution Applied**:
    -   Added `print:py-0 print:gap-0` to the outer container to remove padding and gaps in print mode.
    -   Moved the "Page N" watermark outside the `.print-page` div (into a wrapper) so it doesn't affect the page's internal layout.
