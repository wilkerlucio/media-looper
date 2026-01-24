# Changelog

## 2026.1.9
- Fix YouTube embed error in dashboard
  - Removed modal video preview that was causing YouTube Error 153
  - Clicking video thumbnails now opens videos directly in YouTube in a new tab
  - Provides better user experience while avoiding Chrome extension embedding limitations

## 2026.1.8
- Chapter loops are managed differently now, they wont be stored in DB.
  - This will solve an issue that YouTube Looper was creating entries even without the user interacting with the looper.
  - It also fixes potential cases where YouTube Looper might create loops from chapters from a different video.
  - It also improves the situation where the chapters might change, being only in-memory will make them always current.

## 2026.01.04
- Fix button insertion when using with YouTube embed player

## 2025.12.27
- Fix button UI on new YouTube design
- Fix issue where YouTube buttons get missing after a page change
- Improve reliability of the chapters feature

## 2025.6.6
- Change analytics to use GA

## 2024.9.15
- Upgraded system to Svelte 5
- Return the import/export feature for single media
- Keep split action visible while looking at actions from active loop

## 2024.9.10
- Downgraded Amplitude to a version that complies with Chrome Manifest V3 policy

## 2024.9.9
- Better performance by only checking for split validity when the action menu is open (issue #11)
- Fix loop activation when a new loop is created, and deactivation when its deleted (issue #12)

## 2024.9.4
- Whole new version of the extension using WXT and Svelte
- New dashboard page
- New popup menu
- New sync technology