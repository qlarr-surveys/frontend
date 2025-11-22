# Tiptap Migration - Manual Verification Guide

This guide provides step-by-step manual testing to verify the migration from react-quill to Tiptap was successful.

## Prerequisites

1. Start the development server:

   ```bash
   npm start
   ```

2. Navigate to the Design Survey page in your application

---

## Test 1: Image Upload Functionality

### Steps:

1. Create a new question or edit an existing one
2. Click on the question label or any content field to activate the editor
3. In the toolbar, locate and click the **image icon** (📷)
4. Select an image file from your computer (PNG, JPG, etc.)
5. Wait for the upload to complete

### Expected Results:

- [ ] Image uploads successfully (no console errors)
- [ ] Image appears in the editor immediately after upload
- [ ] Image is properly sized (max-width: 100%, responsive)
- [ ] Image persists after clicking outside the editor (blur event)
- [ ] Image displays correctly in the rendered view (non-editing mode)
- [ ] Image URL uses the same resource system as Image Display question

### Test Different Scenarios:

- [ ] Upload PNG image
- [ ] Upload JPG image
- [ ] Upload large image (verify it scales down)
- [ ] Upload multiple images in different content fields
- [ ] Verify images persist after page refresh

---

## Test 2: Collapsible/Details Component

### Steps:

1. In any content editor, locate and click the **collapsible button** (▼) in the toolbar
2. A purple button with "Show more details" text should appear
3. Click the purple button to toggle it open/closed
4. Add some text content inside the collapsible section
5. Click the button again to toggle
6. Save the content and exit edit mode

### Expected Results:

- [ ] Purple button appears with "Show more details" text
- [ ] Button is clickable and toggles content visibility
- [ ] Arrow indicator (▼) rotates when toggling open/closed
- [ ] Content shows when button is clicked (open state)
- [ ] Content hides when button is clicked again (closed state)
- [ ] Toggle functionality works in rendered view (non-editing mode)
- [ ] State persists after saving and reloading

### Test Different Scenarios:

- [ ] Insert collapsible section
- [ ] Add plain text inside collapsible
- [ ] Add formatted text (bold, italic, lists) inside collapsible
- [ ] Add multiple collapsible sections
- [ ] Verify toggle works in both edit and rendered views
- [ ] Verify state persists after page refresh

---

## Test 3: Existing Formatting Features

### Text Formatting:

1. Select text in the editor
2. Test each formatting button:

- [ ] **Font Size** dropdown - Change to Small, Normal, Large, Huge
- [ ] **Bold** (B) - Text becomes bold
- [ ] **Italic** (I) - Text becomes italic
- [ ] **Underline** (U) - Text becomes underlined
- [ ] **Strikethrough** (S) - Text gets strikethrough
- [ ] **Link** (🔗) - Add/edit links
- [ ] **Text Color** - Change text color
- [ ] **Background Color** - Change background color
- [ ] **Clear Formatting** (🗑) - Remove all formatting

### Extended Mode Features (if applicable):

- [ ] **Ordered List** (1.) - Create numbered list
- [ ] **Bullet List** (•) - Create bullet list
- [ ] **Decrease Indent** (◂) - Reduce indentation
- [ ] **Increase Indent** (▸) - Increase indentation

### Expected Results:

- [ ] All formatting buttons work correctly
- [ ] Formatting persists after saving
- [ ] Formatting displays correctly in rendered view
- [ ] Multiple formats can be applied simultaneously
- [ ] Clear formatting removes all styles

---

## Test 4: Mentions (@ References)

### Steps:

1. In the editor, type the "@" symbol
2. A dropdown menu should appear with available references
3. Type to filter the list
4. Select a mention from the dropdown
5. Save and verify in rendered view

### Expected Results:

- [ ] "@" triggers mention dropdown
- [ ] Dropdown shows available survey references
- [ ] Typing filters the mention list
- [ ] Selecting a mention inserts it correctly
- [ ] Mention displays correctly in rendered view
- [ ] Mention references work with reference instructions

---

## Test 5: RTL/LTR Support

### Steps:

1. Switch to an RTL language (e.g., Arabic)
2. Test all editor features in RTL mode
3. Switch back to LTR language (e.g., English)
4. Verify everything works in both directions

### Expected Results:

- [ ] Editor displays correctly in RTL mode
- [ ] Text alignment is correct for RTL
- [ ] Toolbar buttons work in RTL
- [ ] Images display correctly in RTL
- [ ] Collapsible component works in RTL
- [ ] Switching between RTL/LTR works smoothly

---

## Test 6: Paste Functionality

### Steps:

1. Copy text from another source (Word, web page, etc.)
2. Paste into the editor
3. Verify formatting is handled correctly

### Expected Results:

- [ ] Paste works without errors
- [ ] Text is sanitized (bullet points, dashes removed)
- [ ] Formatting is preserved appropriately
- [ ] No unwanted formatting is introduced

---

## Test 7: Content Persistence

### Steps:

1. Create content with:
   - Formatted text
   - Image
   - Collapsible section
   - Links
   - Mentions
2. Save the content
3. Reload the page
4. Edit the content again

### Expected Results:

- [ ] All content persists after save
- [ ] All content loads correctly after page refresh
- [ ] Images display correctly after reload
- [ ] Collapsible state is preserved
- [ ] All formatting is maintained
- [ ] Can edit previously saved content

---

## Test 8: Error Checking

### Browser Console:

1. Open browser DevTools (F12)
2. Go to Console tab
3. Perform all the above tests
4. Check for any errors or warnings

### Expected Results:

- [ ] No errors in console
- [ ] No warnings related to Quill or missing modules
- [ ] No React errors
- [ ] No network errors (except expected ones)

---

## Test 9: Performance Check

### Steps:

1. Create content with multiple elements:
   - Multiple images
   - Multiple collapsible sections
   - Lots of formatted text
2. Test editor responsiveness
3. Test save/load performance

### Expected Results:

- [ ] Editor remains responsive
- [ ] No lag when typing
- [ ] Toolbar buttons respond quickly
- [ ] Save/load operations complete in reasonable time

---

## Final Checklist

Before marking migration as complete, verify:

- [ ] All tests above pass
- [ ] No console errors
- [ ] Images upload and display correctly
- [ ] Collapsible component works in both edit and rendered views
- [ ] All formatting features work
- [ ] Mentions work correctly
- [ ] RTL/LTR support works
- [ ] Content persists correctly
- [ ] No performance issues
- [ ] Application builds without errors (`npm run build`)

---

## Known Issues / Notes

Document any issues found during testing:

- Issue 1: ******\*\*******\_******\*\*******
- Issue 2: ******\*\*******\_******\*\*******
- Issue 3: ******\*\*******\_******\*\*******

---

## Migration Status

- [ ] ✅ Migration Complete - All tests passing
- [ ] ⚠️ Migration Complete - Minor issues found (see notes above)
- [ ] ❌ Migration Incomplete - Critical issues found

**Tested by:** **\*\*\*\***\_**\*\*\*\***  
**Date:** **\*\*\*\***\_**\*\*\*\***  
**Notes:** **\*\*\*\***\_**\*\*\*\***
