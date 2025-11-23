# Tiptap Migration - Comprehensive Manual Testing Guide

This guide provides detailed step-by-step manual testing to verify the migration from react-quill to Tiptap was successful and production-ready.

## Prerequisites

1. **Start the development server:**
   ```bash
   npm start
   ```

2. **Clear browser cache** to ensure you're testing the latest code

3. **Open browser DevTools** (F12) and keep Console tab open throughout testing

4. **Have test data ready:**
   - Sample images (PNG, JPG, different sizes)
   - Text content to copy/paste
   - Access to multiple languages (especially RTL like Arabic)

---

## Test 1: Basic Editor Functionality

### 1.1 Editor Activation & Deactivation

**Steps:**
1. Navigate to Design Survey page
2. Create a new question or open an existing one
3. Click on the question **label** field
4. Verify editor appears with toolbar
5. Click outside the editor
6. Verify editor disappears and content is saved

**Expected Results:**
- [ ] Editor activates when clicking on content field
- [ ] Toolbar appears with all buttons visible
- [ ] Editor deactivates on blur
- [ ] Content persists after deactivation
- [ ] No console errors during activation/deactivation

### 1.2 Content Field Types

**Test in each content field type:**
- [ ] Question label
- [ ] Question hint
- [ ] Answer option labels (for choice questions)
- [ ] Instruction text
- [ ] Group title
- [ ] Survey title/description

**Steps for each:**
1. Click on the field
2. Type some text
3. Apply formatting
4. Save and verify persistence

**Expected Results:**
- [ ] All field types support the editor
- [ ] Formatting works in all fields
- [ ] Content saves correctly for each field type

---

## Test 2: Text Formatting Features

### 2.1 Font Size

**Steps:**
1. Type some text in the editor
2. Select the text
3. Use the font size dropdown
4. Test each size: Small, Normal, Large, Huge
5. Verify size changes visually
6. Save and reload
7. Verify size persists

**Expected Results:**
- [ ] Font size dropdown works
- [ ] All four sizes apply correctly
- [ ] Size persists after save
- [ ] Size displays correctly in rendered view
- [ ] Can change size multiple times

**Edge Cases:**
- [ ] Select text with different sizes and change to one size
- [ ] Apply size to empty selection (should apply to next typed text)
- [ ] Clear formatting removes font size

### 2.2 Bold, Italic, Underline, Strikethrough

**Steps for each:**
1. Type text
2. Select text
3. Click formatting button (B, I, U, S)
4. Verify formatting applies
5. Click again to remove formatting
6. Test multiple formats simultaneously

**Expected Results:**
- [ ] Each button toggles formatting on/off
- [ ] Active state shows when formatting is applied
- [ ] Multiple formats can be combined (bold + italic)
- [ ] Formatting persists after save
- [ ] Formatting displays in rendered view

**Combination Tests:**
- [ ] Bold + Italic
- [ ] Bold + Underline
- [ ] Italic + Strikethrough
- [ ] All four together
- [ ] Formatting with different font sizes

### 2.3 Text Color

**Steps:**
1. Select text
2. Click text color button (A with colored underline)
3. Color palette appears
4. Select a color
5. Verify text color changes
6. Test "Remove color" option (✕)
7. Save and verify

**Expected Results:**
- [ ] Color picker opens on click
- [ ] All colors in palette are selectable
- [ ] Selected color applies to text
- [ ] Color picker closes after selection
- [ ] "Remove color" removes text color
- [ ] Color persists after save
- [ ] Color displays in rendered view

**Edge Cases:**
- [ ] Click outside color picker closes it
- [ ] Can change color multiple times
- [ ] Color works with other formatting
- [ ] Color picker works in RTL mode

### 2.4 Background Color (Highlight)

**Steps:**
1. Select text
2. Click background color button (colored square)
3. Select a color from palette
4. Verify background color applies
5. Test "Remove background" option
6. Save and verify

**Expected Results:**
- [ ] Background color picker works
- [ ] Colors apply correctly
- [ ] Can remove background color
- [ ] Persists after save
- [ ] Displays in rendered view

**Edge Cases:**
- [ ] Background color with text color
- [ ] Background color with other formatting
- [ ] Multiple background colors in same paragraph

### 2.5 Clear Formatting

**Steps:**
1. Apply multiple formats to text (bold, italic, color, size, etc.)
2. Select the formatted text
3. Click clear formatting button (🗑)
4. Verify all formatting removed

**Expected Results:**
- [ ] All formatting removed in one click
- [ ] Text remains but unformatted
- [ ] Works on partially selected text
- [ ] No errors when clearing

---

## Test 3: Link Functionality

### 3.1 Creating Links

**Steps:**
1. Type or select text
2. Click link button (🔗)
3. Link input appears
4. Enter URL (test with and without http://)
5. Click OK or press Enter
6. Verify link is created
7. Click link in rendered view
8. Verify link opens in new tab

**Expected Results:**
- [ ] Link input appears on button click
- [ ] Can enter URL
- [ ] Auto-adds http:// if protocol missing
- [ ] Link creates successfully
- [ ] Link is clickable in rendered view
- [ ] Link opens in new tab/window
- [ ] Link persists after save

**URL Format Tests:**
- [ ] `example.com` → becomes `http://example.com`
- [ ] `https://example.com` → stays `https://example.com`
- [ ] `http://example.com` → stays `http://example.com`
- [ ] `www.example.com` → becomes `http://www.example.com`

### 3.2 Editing Links

**Steps:**
1. Select existing link
2. Click link button
3. Verify existing URL appears in input
4. Modify URL
5. Save
6. Verify new URL works

**Expected Results:**
- [ ] Existing URL pre-populates in input
- [ ] Can edit URL
- [ ] Changes save correctly
- [ ] New URL works when clicked

### 3.3 Removing Links

**Steps:**
1. Select linked text
2. Click link button
3. Link should be removed
4. Or click link button again to remove

**Expected Results:**
- [ ] Link removes correctly
- [ ] Text remains but unlinked
- [ ] No errors when removing

### 3.4 Link Input Interaction

**Steps:**
1. Open link input
2. Press Escape key
3. Verify input closes
4. Open link input again
5. Click Cancel button
6. Verify input closes
7. Open link input
8. Click outside input
9. Verify input closes

**Expected Results:**
- [ ] Escape closes input
- [ ] Cancel button works
- [ ] Click outside closes input
- [ ] Focus returns to editor after closing

---

## Test 4: Lists (Extended Mode)

### 4.1 Ordered Lists

**Steps:**
1. Create a question that supports extended mode (e.g., paragraph question)
2. Click in the editor
3. Click ordered list button (1.)
4. Type items, pressing Enter after each
5. Verify numbering appears
6. Test indentation buttons
7. Save and verify

**Expected Results:**
- [ ] Ordered list creates correctly
- [ ] Numbers increment automatically
- [ ] Enter creates new list item
- [ ] Indentation buttons work
- [ ] List persists after save
- [ ] List displays in rendered view

### 4.2 Bullet Lists

**Steps:**
1. Click bullet list button (•)
2. Type items
3. Verify bullets appear
4. Test indentation
5. Save and verify

**Expected Results:**
- [ ] Bullet list creates correctly
- [ ] Bullets appear for each item
- [ ] Indentation works
- [ ] Persists after save

### 4.3 List Indentation

**Steps:**
1. Create a list
2. Place cursor on an item
3. Click increase indent (▸)
4. Verify item indents
5. Click decrease indent (◂)
6. Verify item unindents
7. Test with multiple items

**Expected Results:**
- [ ] Increase indent works
- [ ] Decrease indent works
- [ ] Buttons disable when can't indent further
- [ ] Nested lists work correctly
- [ ] Indentation persists

**Edge Cases:**
- [ ] Can't decrease indent at top level
- [ ] Can indent multiple levels
- [ ] Mixed ordered and bullet lists with indentation

---

## Test 5: Image Upload

### 5.1 Basic Image Upload

**Steps:**
1. Click in editor
2. Click image button (📷)
3. Select image file from computer
4. Wait for upload
5. Verify image appears in editor
6. Click outside editor
7. Verify image persists
8. Reload page
9. Verify image still displays

**Expected Results:**
- [ ] Image button opens file picker
- [ ] Can select image file
- [ ] Upload progress shows (loading indicator)
- [ ] Image appears after upload
- [ ] Image is properly sized (responsive)
- [ ] Image persists after save
- [ ] Image displays after page reload
- [ ] No console errors

### 5.2 Image File Validation

**Test with different file types:**
- [ ] PNG image - should work
- [ ] JPG/JPEG image - should work
- [ ] GIF image - should work
- [ ] Non-image file (e.g., PDF) - should be rejected
- [ ] Very large image (>10MB) - should be rejected
- [ ] Small image (<1MB) - should work

**Expected Results:**
- [ ] Valid image formats accepted
- [ ] Invalid files rejected silently
- [ ] Large files rejected
- [ ] No errors shown to user for invalid files

### 5.3 Multiple Images

**Steps:**
1. Upload first image
2. Add some text
3. Upload second image
4. Upload third image
5. Verify all images display
6. Save and reload
7. Verify all images persist

**Expected Results:**
- [ ] Can upload multiple images
- [ ] All images display correctly
- [ ] Images don't overlap
- [ ] All images persist after save

### 5.4 Image in Different Contexts

**Test image upload in:**
- [ ] Question label
- [ ] Question hint
- [ ] Answer option label
- [ ] Instruction text
- [ ] Group title
- [ ] Collapsible section content

**Expected Results:**
- [ ] Images work in all content fields
- [ ] Images display correctly in all contexts
- [ ] Images persist in all contexts

---

## Test 6: Collapsible/Details Component

### 6.1 Creating Collapsible Sections

**Steps:**
1. Click in editor
2. Click collapsible button (▼)
3. Verify purple button appears with "Show more details"
4. Click the purple button
5. Verify content area appears
6. Type content inside
7. Click button again to collapse
8. Verify content hides
9. Save and verify

**Expected Results:**
- [ ] Collapsible section inserts correctly
- [ ] Purple button appears
- [ ] Button text is "Show more details"
- [ ] Button toggles content visibility
- [ ] Arrow rotates when toggling
- [ ] Content can be edited when open
- [ ] State persists after save

### 6.2 Collapsible Content

**Test with different content types:**
- [ ] Plain text
- [ ] Formatted text (bold, italic, colors)
- [ ] Lists (ordered and bullet)
- [ ] Links
- [ ] Images
- [ ] Multiple paragraphs
- [ ] Mentions (@ references)

**Expected Results:**
- [ ] All content types work inside collapsible
- [ ] Formatting persists
- [ ] Content displays correctly when open
- [ ] Content hidden when closed

### 6.3 Multiple Collapsible Sections

**Steps:**
1. Insert first collapsible
2. Add content
3. Insert second collapsible
4. Add different content
5. Toggle each independently
6. Save and verify

**Expected Results:**
- [ ] Can have multiple collapsibles
- [ ] Each toggles independently
- [ ] All persist after save
- [ ] All work in rendered view

### 6.4 Collapsible in Rendered View

**Steps:**
1. Create collapsible with content
2. Save and exit edit mode
3. Click collapsible button in rendered view
4. Verify toggle works
5. Verify content shows/hides

**Expected Results:**
- [ ] Toggle works in rendered view
- [ ] Content shows/hides correctly
- [ ] Arrow rotates correctly
- [ ] No errors in console

---

## Test 7: Mentions (@ References)

### 7.1 Basic Mention Functionality

**Steps:**
1. Type "@" in editor
2. Verify dropdown appears
3. Verify list of references shows
4. Type to filter list
5. Select a mention
6. Verify mention inserts
7. Save and verify

**Expected Results:**
- [ ] "@" triggers dropdown
- [ ] Dropdown shows available references
- [ ] Typing filters the list
- [ ] Arrow keys navigate list
- [ ] Enter selects mention
- [ ] Mention inserts correctly
- [ ] Mention displays in rendered view

### 7.2 Mention Filtering

**Steps:**
1. Type "@"
2. Type first few letters of a question code
3. Verify list filters
4. Type more letters
5. Verify list continues filtering
6. Clear and type different letters
7. Verify list updates

**Expected Results:**
- [ ] Filtering works in real-time
- [ ] Case-insensitive filtering
- [ ] Filter updates as you type
- [ ] Empty query shows all references

### 7.3 Mention in Different Contexts

**Test mentions in:**
- [ ] Question label
- [ ] Question hint
- [ ] Answer option label
- [ ] Instruction text
- [ ] Inside collapsible section
- [ ] With other formatting

**Expected Results:**
- [ ] Mentions work in all contexts
- [ ] Mentions work with formatting
- [ ] Mentions persist correctly

### 7.4 Mention with Reference Instructions

**Steps:**
1. Create question Q1
2. Create question Q2 that references Q1
3. In Q2, add mention to Q1
4. Change Q1's code (via reference instruction)
5. Verify mention updates

**Expected Results:**
- [ ] Mentions update when referenced code changes
- [ ] Reference instructions work with mentions
- [ ] No errors when references change

---

## Test 8: Paste Functionality

### 8.1 Plain Text Paste

**Steps:**
1. Copy plain text from notepad
2. Paste into editor
3. Verify text appears
4. Verify no unwanted formatting

**Expected Results:**
- [ ] Plain text pastes correctly
- [ ] No formatting applied
- [ ] Text is sanitized (bullets/dashes removed if applicable)

### 8.2 Rich Text Paste

**Steps:**
1. Copy formatted text from Word/Google Docs
2. Paste into editor
3. Verify text appears
4. Check if formatting is preserved or stripped

**Expected Results:**
- [ ] Text pastes successfully
- [ ] Formatting handled appropriately
- [ ] No errors
- [ ] Editor remains stable

### 8.3 Multi-line Paste

**Steps:**
1. Copy text with multiple lines
2. Paste into single-line editor (e.g., question label)
3. Verify first line pastes
4. Verify onMoreLines callback fires (if applicable)

**Expected Results:**
- [ ] First line pastes in editor
- [ ] Additional lines handled correctly
- [ ] No errors with multi-line paste

### 8.4 Paste from Web Pages

**Steps:**
1. Copy text from a web page
2. Paste into editor
3. Verify content appears
4. Check for unwanted HTML/formatting

**Expected Results:**
- [ ] Text pastes successfully
- [ ] Unwanted formatting stripped
- [ ] Editor remains clean

---

## Test 9: RTL/LTR Language Support

### 9.1 RTL Language Testing

**Steps:**
1. Switch to Arabic (or other RTL language)
2. Test all editor features:
   - Text input
   - Formatting buttons
   - Color pickers
   - Link input
   - Lists
   - Images
   - Collapsible sections
3. Verify alignment and direction

**Expected Results:**
- [ ] Editor displays in RTL mode
- [ ] Text aligns right
- [ ] Toolbar buttons work correctly
- [ ] Color pickers position correctly
- [ ] Collapsible button arrow positions correctly
- [ ] Lists work in RTL
- [ ] All features function properly

### 9.2 Language Switching

**Steps:**
1. Create content in English (LTR)
2. Switch to Arabic (RTL)
3. Edit the same content
4. Switch back to English
5. Verify content persists

**Expected Results:**
- [ ] Switching languages works smoothly
- [ ] Content persists across language switches
- [ ] Editor adapts to language direction
- [ ] No content loss

### 9.3 Mixed Content

**Steps:**
1. In RTL language, type Arabic text
2. Add English text
3. Add numbers
4. Verify display is correct

**Expected Results:**
- [ ] Mixed content displays correctly
- [ ] Direction handling is appropriate
- [ ] No layout issues

---

## Test 10: Question Type Coverage

### 10.1 Text-Based Questions

**Test editor in:**
- [ ] Text question (label, hint)
- [ ] Paragraph question (label, hint)
- [ ] Number question (label, hint)
- [ ] Email question (label, hint)
- [ ] Multiple text question (label, hint, answer options)

**Expected Results:**
- [ ] Editor works in all text question types
- [ ] All content fields support editor
- [ ] Formatting works in all fields

### 10.2 Choice-Based Questions

**Test editor in:**
- [ ] SCQ (Single Choice) - label, hint, answer options
- [ ] MCQ (Multiple Choice) - label, hint, answer options
- [ ] Select - label, hint, answer options
- [ ] SCQ Array - label, hint, answer options
- [ ] MCQ Array - label, hint, answer options
- [ ] NPS - label, hint

**Expected Results:**
- [ ] Editor works in all choice questions
- [ ] Answer option labels support editor
- [ ] All formatting features work

### 10.3 Image/Icon Choice Questions

**Test editor in:**
- [ ] Icon SCQ - label, hint, answer options
- [ ] Image SCQ - label, hint, answer options
- [ ] SCQ Icon Array - label, hint, answer options
- [ ] Icon MCQ - label, hint, answer options
- [ ] Image MCQ - label, hint, answer options

**Expected Results:**
- [ ] Editor works in image/icon questions
- [ ] Can add formatted text to labels
- [ ] Images/icons display alongside formatted text

### 10.4 Display Questions

**Test editor in:**
- [ ] Text Display - content field
- [ ] Image Display - caption (if applicable)
- [ ] Video Display - caption (if applicable)

**Expected Results:**
- [ ] Editor works in display questions
- [ ] Content displays correctly
- [ ] Formatting preserved

### 10.5 Other Question Types

**Test editor in:**
- [ ] Date question - label, hint
- [ ] Time question - label, hint
- [ ] Date/Time question - label, hint
- [ ] Ranking question - label, hint, answer options
- [ ] File Upload - label, hint
- [ ] Signature - label, hint
- [ ] Barcode - label, hint

**Expected Results:**
- [ ] Editor works in all question types
- [ ] No conflicts with question-specific features

---

## Test 11: Groups and Survey Level

### 11.1 Group Content

**Steps:**
1. Create a group
2. Edit group title
3. Add formatted content
4. Verify editor works
5. Save and verify

**Expected Results:**
- [ ] Group title supports editor
- [ ] Formatting works
- [ ] Content persists

### 11.2 Survey Level Content

**Steps:**
1. Edit survey title
2. Edit survey description
3. Add formatted content
4. Verify editor works
5. Save and verify

**Expected Results:**
- [ ] Survey-level fields support editor
- [ ] Formatting works
- [ ] Content persists

---

## Test 12: Content Persistence & Data Integrity

### 12.1 Save and Reload

**Steps:**
1. Create complex content with:
   - Multiple formatted text sections
   - Images
   - Links
   - Lists
   - Collapsible sections
   - Mentions
   - Mixed formatting
2. Save the survey
3. Reload the page
4. Open the question again
5. Verify all content loads correctly

**Expected Results:**
- [ ] All content persists after save
- [ ] All content loads after reload
- [ ] Formatting preserved
- [ ] Images display correctly
- [ ] Links work
- [ ] Collapsible state preserved
- [ ] Mentions work

### 12.2 Edit Existing Content

**Steps:**
1. Load existing survey with content
2. Edit a question with existing formatted content
3. Modify the content
4. Add new formatting
5. Save and verify

**Expected Results:**
- [ ] Existing content loads correctly
- [ ] Can edit existing content
- [ ] Can add new formatting
- [ ] Changes save correctly

### 12.3 Multiple Languages

**Steps:**
1. Create content in main language
2. Switch to translation language
3. Add translated content
4. Switch back to main language
5. Verify both languages persist

**Expected Results:**
- [ ] Content persists per language
- [ ] Switching languages works
- [ ] No content mixing between languages

---

## Test 13: Error Handling & Edge Cases

### 13.1 Network Errors

**Steps:**
1. Disconnect internet
2. Try to upload image
3. Reconnect internet
4. Try upload again

**Expected Results:**
- [ ] Upload fails gracefully
- [ ] No error messages shown to user
- [ ] Can retry after reconnection
- [ ] No console errors

### 13.2 Large Content

**Steps:**
1. Create very long content (1000+ words)
2. Add many images
3. Add many collapsible sections
4. Save and verify performance

**Expected Results:**
- [ ] Editor remains responsive
- [ ] Save works
- [ ] Load works
- [ ] No performance degradation

### 13.3 Rapid Interactions

**Steps:**
1. Rapidly click formatting buttons
2. Rapidly type and format
3. Rapidly open/close color pickers
4. Rapidly toggle collapsible sections

**Expected Results:**
- [ ] No errors from rapid clicking
- [ ] All actions register correctly
- [ ] UI remains responsive
- [ ] No race conditions

### 13.4 Empty Content

**Steps:**
1. Create question with empty label
2. Save
3. Reload
4. Verify empty state handled

**Expected Results:**
- [ ] Empty content saves correctly
- [ ] Empty content loads correctly
- [ ] Placeholder shows when appropriate

### 13.5 Special Characters

**Steps:**
1. Type special characters: `!@#$%^&*()_+-=[]{}|;':",./<>?`
2. Type emojis: 😀 🎉 ✅
3. Type unicode characters
4. Save and verify

**Expected Results:**
- [ ] Special characters handled correctly
- [ ] Emojis work
- [ ] Unicode characters work
- [ ] All persist correctly

---

## Test 14: Browser Compatibility

### 14.1 Chrome/Edge

**Steps:**
1. Test all features in Chrome/Edge
2. Verify console for errors
3. Test performance

**Expected Results:**
- [ ] All features work
- [ ] No errors
- [ ] Good performance

### 14.2 Firefox

**Steps:**
1. Test all features in Firefox
2. Verify console for errors
3. Test performance

**Expected Results:**
- [ ] All features work
- [ ] No errors
- [ ] Good performance

### 14.3 Safari

**Steps:**
1. Test all features in Safari
2. Verify console for errors
3. Test performance

**Expected Results:**
- [ ] All features work
- [ ] No errors
- [ ] Good performance

---

## Test 15: Mobile/Responsive Testing

### 15.1 Mobile Viewport

**Steps:**
1. Resize browser to mobile size (375px width)
2. Test editor functionality
3. Test toolbar buttons
4. Test color pickers
5. Test link input

**Expected Results:**
- [ ] Editor works on mobile viewport
- [ ] Toolbar is usable
- [ ] Color pickers position correctly
- [ ] Link input is usable
- [ ] Touch interactions work

### 15.2 Tablet Viewport

**Steps:**
1. Resize to tablet size (768px width)
2. Test all features
3. Verify layout

**Expected Results:**
- [ ] All features work
- [ ] Layout is appropriate
- [ ] Touch interactions work

---

## Test 16: Integration with Other Features

### 16.1 Survey Validation

**Steps:**
1. Create question with formatted label
2. Leave label empty (should show validation error)
3. Add content
4. Verify validation clears

**Expected Results:**
- [ ] Validation works with editor
- [ ] Errors show/hide correctly
- [ ] No conflicts

### 16.2 Survey Logic

**Steps:**
1. Create question with formatted label
2. Add skip logic referencing this question
3. Verify logic works
4. Test conditional relevance

**Expected Results:**
- [ ] Logic works with formatted content
- [ ] References work correctly
- [ ] No conflicts

### 16.3 Survey Publishing

**Steps:**
1. Create survey with formatted content
2. Publish survey
3. View published survey
4. Verify content displays correctly

**Expected Results:**
- [ ] Published survey shows formatted content
- [ ] All formatting preserved
- [ ] Images display
- [ ] Links work
- [ ] Collapsible sections work

---

## Test 17: Performance Testing

### 17.1 Editor Load Time

**Steps:**
1. Open survey with many questions
2. Click to edit a question
3. Measure time to editor activation
4. Verify feels instant (< 200ms)

**Expected Results:**
- [ ] Editor activates quickly
- [ ] No noticeable delay
- [ ] Smooth experience

### 17.2 Typing Performance

**Steps:**
1. Type rapidly in editor
2. Verify no lag
3. Apply formatting while typing
4. Verify responsiveness

**Expected Results:**
- [ ] No lag when typing
- [ ] Formatting applies instantly
- [ ] Smooth experience

### 17.3 Save Performance

**Steps:**
1. Create large amount of content
2. Save
3. Measure save time
4. Verify reasonable (< 2 seconds)

**Expected Results:**
- [ ] Save completes in reasonable time
- [ ] No timeout errors
- [ ] Progress indication if needed

---

## Test 18: Accessibility

### 18.1 Keyboard Navigation

**Steps:**
1. Navigate to editor using Tab
2. Use keyboard to activate formatting
3. Use Enter to confirm actions
4. Use Escape to cancel

**Expected Results:**
- [ ] All features accessible via keyboard
- [ ] Tab order is logical
- [ ] Keyboard shortcuts work
- [ ] Focus indicators visible

### 18.2 Screen Reader

**Steps:**
1. Enable screen reader
2. Navigate editor
3. Verify announcements are clear
4. Test all features

**Expected Results:**
- [ ] Screen reader announces correctly
- [ ] Buttons have proper labels
- [ ] Content is readable
- [ ] Actions are clear

---

## Test 19: Console & Error Monitoring

### 19.1 Console Errors

**Steps:**
1. Open browser console
2. Perform all tests above
3. Monitor for errors/warnings

**Expected Results:**
- [ ] No console errors
- [ ] No warnings (or only expected ones)
- [ ] No React errors
- [ ] No network errors (except expected)

### 19.2 Error Boundaries

**Steps:**
1. Try to break editor (invalid operations)
2. Verify error handling
3. Verify recovery

**Expected Results:**
- [ ] Errors handled gracefully
- [ ] No crashes
- [ ] User can recover

---

## Test 20: Build & Production

### 20.1 Production Build

**Steps:**
1. Run `npm run build`
2. Verify build succeeds
3. Test built application
4. Verify all features work

**Expected Results:**
- [ ] Build completes without errors
- [ ] No build warnings
- [ ] Built app works correctly
- [ ] All features functional

### 20.2 Bundle Size

**Steps:**
1. Check bundle size
2. Compare to previous (Quill) size
3. Verify reasonable size

**Expected Results:**
- [ ] Bundle size is reasonable
- [ ] No unexpected large dependencies
- [ ] Performance not degraded

---

## Final Comprehensive Checklist

Before marking migration as complete and shipping to production:

### Core Functionality
- [ ] All formatting features work (bold, italic, underline, strikethrough)
- [ ] Font sizes work (Small, Normal, Large, Huge)
- [ ] Text and background colors work
- [ ] Links work (create, edit, remove)
- [ ] Lists work (ordered, bullet, indentation)
- [ ] Image upload works
- [ ] Collapsible sections work
- [ ] Mentions (@ references) work
- [ ] Paste functionality works
- [ ] Clear formatting works

### Content Persistence
- [ ] Content saves correctly
- [ ] Content loads correctly after reload
- [ ] Formatting persists
- [ ] Images persist
- [ ] All question types work
- [ ] All content field types work

### Language Support
- [ ] RTL languages work (Arabic, Hebrew, etc.)
- [ ] LTR languages work
- [ ] Language switching works
- [ ] Mixed content works

### User Experience
- [ ] Editor activates/deactivates smoothly
- [ ] Toolbar is intuitive
- [ ] Color pickers work and position correctly
- [ ] Link input works
- [ ] Click-outside closes pickers
- [ ] Keyboard shortcuts work
- [ ] No UI glitches

### Error Handling
- [ ] No console errors
- [ ] Network errors handled gracefully
- [ ] Invalid inputs handled
- [ ] Large files rejected
- [ ] Edge cases handled

### Performance
- [ ] Editor loads quickly
- [ ] Typing is responsive
- [ ] Save/load is fast
- [ ] No memory leaks
- [ ] Large content handled

### Browser Compatibility
- [ ] Chrome/Edge works
- [ ] Firefox works
- [ ] Safari works
- [ ] Mobile browsers work

### Integration
- [ ] Works with all question types
- [ ] Works with survey logic
- [ ] Works with validation
- [ ] Works with publishing
- [ ] No conflicts with other features

### Production Readiness
- [ ] Build succeeds
- [ ] No build warnings
- [ ] Bundle size acceptable
- [ ] All tests pass
- [ ] Documentation updated

---

## Known Issues / Notes

Document any issues found during testing:

**Issue 1:** _________________________________________________
- Description: 
- Severity: [ ] Critical [ ] High [ ] Medium [ ] Low
- Steps to reproduce:
- Expected vs Actual:
- Workaround (if any):

**Issue 2:** _________________________________________________
- Description: 
- Severity: [ ] Critical [ ] High [ ] Medium [ ] Low
- Steps to reproduce:
- Expected vs Actual:
- Workaround (if any):

**Issue 3:** _________________________________________________
- Description: 
- Severity: [ ] Critical [ ] High [ ] Medium [ ] Low
- Steps to reproduce:
- Expected vs Actual:
- Workaround (if any):

---

## Migration Status

- [ ] ✅ **Migration Complete - All tests passing - Ready for Production**
- [ ] ⚠️ **Migration Complete - Minor issues found (see notes above) - Review before production**
- [ ] ❌ **Migration Incomplete - Critical issues found - Do not deploy**

**Tested by:** _________________________  
**Date:** _________________________  
**Browser(s) tested:** _________________________  
**Additional Notes:** 

_______________________________________________________________________________
_______________________________________________________________________________
_______________________________________________________________________________

---

## Quick Reference: Testing Order

For efficient testing, follow this order:

1. **Basic functionality** (Test 1) - 10 min
2. **Text formatting** (Test 2) - 15 min
3. **Links** (Test 3) - 10 min
4. **Lists** (Test 4) - 10 min
5. **Images** (Test 5) - 15 min
6. **Collapsible** (Test 6) - 10 min
7. **Mentions** (Test 7) - 10 min
8. **Paste** (Test 8) - 5 min
9. **RTL/LTR** (Test 9) - 10 min
10. **Question types** (Test 10) - 20 min
11. **Persistence** (Test 12) - 10 min
12. **Error handling** (Test 13) - 10 min
13. **Console check** (Test 19) - 5 min
14. **Build test** (Test 20) - 5 min

**Total estimated time: ~2.5 hours for comprehensive testing**

---

*Last updated: [Date]*  
*Migration version: Tiptap v3.7.2*
